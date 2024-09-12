// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IEeseeMinter.sol";
import "../interfaces/IEesee.sol";
import "../types/Asset.sol";

library AssetTransfer { 
    using SafeERC20 for IERC20;

    ///@dev Lot typehash.
    bytes32 private constant LOT_TYPEHASH = keccak256("Lot(bytes32 assetHash,uint32 totalTickets,uint96 ticketPrice,uint32 duration,address owner,uint256 nonce,uint256 deadline)");

    error TransferNotSuccessful();
    error InvalidAsset();
    error InvalidAmount();
    error InvalidToken();
    error InvalidTokenID();
    error InvalidMsgValue();
    error InvalidInterface();
    error InvalidSignature();
    error ExpiredDeadline();
    error InvalidData();
    error InvalidLazyMintOwner();

    // ============ External Write Functions ============

    function transferAssetFrom(
        Asset calldata asset,
        IEesee.LotParams calldata params,
        uint256 availableValue,
        address msgSender,
        bytes32 domainSeparatorV4,
        IERC20 ESE
    ) external returns(address signer, uint256 nonce, uint256 valueLeft) {
        valueLeft = availableValue;
        if (asset.assetType == AssetType.ERC721) {
            if(asset.amount != 1) revert InvalidAmount();
            (bool success, bytes memory res) = asset.token.staticcall(abi.encodeWithSelector(IERC165.supportsInterface.selector, type(IERC721).interfaceId));
            if(!success || abi.decode(res, (bool)) == false) revert InvalidInterface();

            IERC721(asset.token).safeTransferFrom(params.signer, address(this), asset.tokenID);
        } else if (asset.assetType == AssetType.ERC1155) {
            if(asset.amount == 0) revert InvalidAmount();
            (bool success, bytes memory res) = asset.token.staticcall(abi.encodeWithSelector(IERC165.supportsInterface.selector, type(IERC1155).interfaceId));
            if(!success || abi.decode(res, (bool)) == false) revert InvalidInterface();

            IERC1155(asset.token).safeTransferFrom(params.signer, address(this), asset.tokenID, asset.amount, "");
        } else if (asset.assetType == AssetType.ERC20) {
            if(asset.amount == 0) revert InvalidAmount();
            // Most ERC-20 tokens do not implement supportsInterface, so we check against IERC721 to ensure we are not calling ERC721 contract.
            // ERC1155 will revert anyway because of different safeTransferFrom scheme.
            (bool success, bytes memory res) = asset.token.staticcall(abi.encodeWithSelector(IERC165.supportsInterface.selector, type(IERC721).interfaceId));
            if(success && abi.decode(res, (bool)) == true) revert InvalidInterface();
            if(asset.tokenID != 0) revert InvalidTokenID();
            if(asset.data.length != 0) revert InvalidData();

            IERC20(asset.token).safeTransferFrom(params.signer, address(this), asset.amount);
        } else if (asset.assetType == AssetType.Native) {
            if(asset.amount == 0) revert InvalidAmount();
            if(availableValue < asset.amount) revert InvalidMsgValue();
            if(asset.token != address(0)) revert InvalidToken();
            if(asset.tokenID != 0) revert InvalidTokenID();
            if(asset.data.length != 0) revert InvalidData();
            unchecked{ valueLeft -= asset.amount; }
        } else if (asset.assetType == AssetType.ESE) {
            if(asset.amount != params.totalTickets * params.ticketPrice) revert InvalidAmount();
            if(asset.token != address(ESE)) revert InvalidToken();
            if(asset.tokenID != 0) revert InvalidTokenID();
            if(asset.data.length != 0) revert InvalidData();
        } else if(asset.assetType == AssetType.ERC721LazyMint){
            if(asset.amount != 1) revert InvalidAmount();
            if(asset.token != address(0)) revert InvalidToken();
            if(asset.tokenID != 0) revert InvalidTokenID();

            (,address owner,,) = abi.decode(asset.data, (uint256, address, LazyMintCollectionMetadata, LazyMintTokenMetadata));
            if(owner != params.signer) revert InvalidLazyMintOwner();
        } else revert InvalidAsset();
        
        (signer, nonce) = _checkLotSignature(asset, params, msgSender, domainSeparatorV4);
    }

    // Note: _transferAssetFrom has all sanity checks and is always called before _transferAssetTo, so we don't need to put any sanity checks here.
    function transferAssetTo(
        Asset memory asset,
        address to,
        IEeseeMinter minter
    ) external returns (Asset memory){
        if (asset.assetType == AssetType.ERC721) {
            IERC721(asset.token).safeTransferFrom(address(this), to, asset.tokenID, asset.data);
            asset.data = "";
            return asset;
        } 
        if (asset.assetType == AssetType.ERC1155) {
            IERC1155(asset.token).safeTransferFrom(address(this), to, asset.tokenID, asset.amount, asset.data);
            asset.data = "";
            return asset;
        }
        if (asset.assetType == AssetType.ERC20) {
            IERC20(asset.token).safeTransfer(to, asset.amount);
            return asset;
        }
        if (asset.assetType == AssetType.Native) {
            (bool success,) = to.call{value: asset.amount}("");
            if(!success) revert TransferNotSuccessful(); 
            return asset;
        }
        if(asset.assetType == AssetType.ERC721LazyMint) {
            (
                uint256 collectionID, 
                address owner,
                LazyMintCollectionMetadata memory collectionMetadata,
                LazyMintTokenMetadata memory tokenMetadata
            ) = abi.decode(asset.data, (uint256, address, LazyMintCollectionMetadata, LazyMintTokenMetadata));
            (IERC721 collection, uint256 tokenID) = minter.lazyMint(collectionID, owner, collectionMetadata, tokenMetadata, to);
            
            return Asset({
                token: address(collection),
                tokenID: tokenID,
                amount: 1,
                assetType: AssetType.ERC721,
                data: ""
            });
        }
        revert InvalidAsset();
    }

    // ============ Internal View Functions ============

    function _checkLotSignature(
        Asset calldata asset, 
        IEesee.LotParams calldata params, 
        address msgSender, 
        bytes32 domainSeparatorV4
    ) internal view returns(address signer, uint256 nonce){
        signer = params.signer;
        if(signer == msgSender){
            return (signer, 0);
        }
        (uint256 _nonce, uint256 deadline, bytes memory signature) = abi.decode(params.signatureData,(uint256,uint256,bytes));
        if(block.timestamp > deadline) revert ExpiredDeadline();
        
        nonce = _nonce;
        bytes32 structHash = keccak256(abi.encode(
            LOT_TYPEHASH, 
            keccak256(abi.encode(asset)),

            params.totalTickets,
            params.ticketPrice,
            params.duration,
            params.owner,

            nonce,
            deadline
        ));
        if(!SignatureChecker.isValidSignatureNow(signer, ECDSA.toTypedDataHash(domainSeparatorV4, structHash), signature)) revert InvalidSignature();
    }
}