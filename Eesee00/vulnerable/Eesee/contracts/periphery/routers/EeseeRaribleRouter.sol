// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/IEeseeMarketplaceRouter.sol";
import "../../interfaces/IExchangeV2Core.sol";
import "../../libraries/LibDirectTransfer.sol";

contract EeseeRaribleRouter is IEeseeMarketplaceRouter, ERC721Holder {
    using SafeERC20 for IERC20;

    ///@dev Main rarible marketplace contract's address.
    IExchangeV2Core public immutable exchangeV2Core;
    
    error ERC20NotSupported();

    constructor(IExchangeV2Core _exchangeV2Core) {
        exchangeV2Core = _exchangeV2Core;
    }

    receive() external payable {
        //Reject deposits from EOA
        if (msg.sender == tx.origin) revert EthDepositRejected();
    }

    /**
     * @dev Buys NFT for {nftPrice} from Rarible marketplace and sends it to {recipient}.
     * @param data - Encoded LibDirectTransfer.Purchase struct needed for rarible contracts.
     * @param recipient - Address to send nft to.
     *
     * @return asset - Asset received.
     * @return spent - Tokens spent.
     */
    function purchaseAsset(bytes calldata data, address recipient) external payable returns (Asset memory asset, uint256 spent) {
        LibDirectTransfer.Purchase memory purchase = abi.decode(data, (LibDirectTransfer.Purchase)); 

        spent = (101 * purchase.sellOrderPaymentAmount) / 100;

        if (address(purchase.paymentToken) != address(0)) revert ERC20NotSupported();
        if (msg.value < spent) revert InsufficientFunds(); // Take fee into account
        exchangeV2Core.directPurchase{value: spent}(purchase);

        if(spent != msg.value){
            unchecked {
                (bool success, ) = msg.sender.call{value: msg.value - spent}("");
                if(!success) revert TransferNotSuccessful();
            }
        }

        (address token, uint256 tokenID) = abi.decode(purchase.nftData, (address, uint256));
        asset = Asset({
            token: token,
            tokenID: tokenID,
            amount: 1,
            assetType: AssetType.ERC721,
            data: ""
        });
        IERC721(token).safeTransferFrom(address(this), recipient, tokenID);
    }
}
