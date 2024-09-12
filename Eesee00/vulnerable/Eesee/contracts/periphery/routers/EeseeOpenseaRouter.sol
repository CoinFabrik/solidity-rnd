// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/IEeseeMarketplaceRouter.sol";
import "../../interfaces/ISeaport.sol";
import "../../interfaces/IConduitController.sol";
import "../../libraries/OpenseaStructs.sol";

contract EeseeOpenseaRouter is IEeseeMarketplaceRouter, ERC721Holder {
    using SafeERC20 for IERC20;

    ///@dev Main opensea marketplace contract's address
    ISeaport public immutable seaport;

    error ConduitDoesntExist();

    constructor(ISeaport _seaport) {
        seaport = _seaport;
    }

    receive() external payable {
        //Reject deposits from EOA
        if (msg.sender == tx.origin) revert EthDepositRejected();
    }

    /**
     * @dev Buys NFT for {nftPrice} from Opensea marketplace and sends it to {recipient}
     * @param data - Encoded OpenseaStructs.BasicOrderParameters struct needed for rarible contracts.
     * @param recipient - Address where to send nft.
     *
     * @return asset - Asset received.
     * @return spent - Tokens spent.
     */
    function purchaseAsset(bytes calldata data, address recipient) external payable returns (Asset memory asset, uint256 spent) {
        OpenseaStructs.BasicOrderParameters memory params = abi.decode(data, (OpenseaStructs.BasicOrderParameters));
        spent = params.considerationAmount;
        for (uint256 i; i < params.additionalRecipients.length;) {
            spent += params.additionalRecipients[i].amount;
            unchecked { ++i; }
        }

        IERC20 token = IERC20(params.considerationToken);
        if (address(token) == address(0)) {
            if (msg.value < spent) revert InsufficientFunds();
            seaport.fulfillBasicOrder{value: spent}(params);

            if(spent != msg.value){
                unchecked {
                    (bool success, ) = msg.sender.call{value: msg.value - spent}("");
                    if(!success) revert TransferNotSuccessful();
                }
            }
        } else {
            uint256 tokenBalance = token.balanceOf(address(this));
            if (tokenBalance < spent) revert InsufficientFunds();
            
            (,,address conduitControllerAddress) = seaport.information();
            (address conduitAddress, bool exists) = IConduitController(conduitControllerAddress).getConduit(params.fulfillerConduitKey);
            if (!exists) revert ConduitDoesntExist();
            
            token.safeIncreaseAllowance(conduitAddress, spent);
            seaport.fulfillBasicOrder(params);

            if(spent != tokenBalance){
                unchecked {
                    token.safeTransfer(msg.sender, tokenBalance - spent);
                }
            }
        }

        address offerToken = params.offerToken;
        uint256 tokenID = params.offerIdentifier;
        asset = Asset({
            token: offerToken,
            tokenID: tokenID,
            amount: 1,
            assetType: AssetType.ERC721,
            data: ""
        });
        IERC721(offerToken).safeTransferFrom(address(this), recipient, tokenID);
    }
}
