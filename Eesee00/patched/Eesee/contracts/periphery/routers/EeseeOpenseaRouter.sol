// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/IEeseeMarketplaceRouter.sol";
import "../../interfaces/ISeaport.sol";
import "../../interfaces/IConduitController.sol";
import "../../libraries/OpenseaStructs.sol";

contract EeseeOpenseaRouter is IEeseeMarketplaceRouter, ERC721Holder, Pausable {
    using SafeERC20 for IERC20;

    ///@dev Main opensea marketplace contract's address
    ISeaport public immutable seaport;
    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Pauser role in {accessManager}.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    error ConduitDoesntExist();
    error InvalidOrderType();

    modifier onlyPauser(){
        if(!accessManager.hasRole(PAUSER_ROLE, msg.sender)) revert CallerNotAuthorized();
        _;
    }

    constructor(ISeaport _seaport, IEeseeAccessManager _accessManager) {
        seaport = _seaport;
        accessManager = _accessManager;
    }

    receive() external payable {
        //Reject deposits from EOA
        if (msg.sender == tx.origin) revert EthDepositRejected();
    }

    // ============ External Write Functions ============

    /**
     * @dev Buys NFT for {nftPrice} from Opensea marketplace and sends it to {recipient}
     * @param data - Encoded OpenseaStructs.BasicOrderParameters struct needed for rarible contracts.
     * @param recipient - Address where to send nft.
     *
     * @return asset - Asset received.
     * @return spent - Tokens spent.
     */
    function purchaseAsset(bytes calldata data, address recipient) external payable whenNotPaused returns (Asset memory asset, uint256 spent) {
        OpenseaStructs.BasicOrderParameters memory params = abi.decode(data, (OpenseaStructs.BasicOrderParameters));
        spent = params.considerationAmount;
        for (uint256 i; i < params.additionalRecipients.length;) {
            spent += params.additionalRecipients[i].amount;
            unchecked { ++i; }
        }

        IERC20 token = IERC20(params.considerationToken);
        if (address(token) == address(0)) {
            if(
                params.basicOrderType != OpenseaStructs.BasicOrderType.ETH_TO_ERC721_FULL_OPEN &&
                params.basicOrderType != OpenseaStructs.BasicOrderType.ETH_TO_ERC721_PARTIAL_OPEN
            ) revert InvalidOrderType();
            if (msg.value < spent) revert InsufficientFunds();
            seaport.fulfillBasicOrder{value: spent}(params);

            if(spent != msg.value){
                unchecked {
                    (bool success, ) = msg.sender.call{value: msg.value - spent}("");
                    if(!success) revert TransferNotSuccessful();
                }
            }
        } else {
            if (
                params.basicOrderType != OpenseaStructs.BasicOrderType.ERC20_TO_ERC721_FULL_OPEN &&
                params.basicOrderType != OpenseaStructs.BasicOrderType.ERC20_TO_ERC721_PARTIAL_OPEN
            ) revert InvalidOrderType();
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

    // ============ Admin Methods ============

    /**
    * @dev Called by the PAUSER_ROLE to pause, triggers stopped state.
    */
    function pause() onlyPauser external {
        _pause();
    }

    /**
     * @dev Called by the PAUSER_ROLE to unpause, returns to normal state.
     */
    function unpause() onlyPauser external {
        _unpause();
    }
}
