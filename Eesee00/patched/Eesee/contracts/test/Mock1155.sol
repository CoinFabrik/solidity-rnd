// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
contract Mock1155 is ERC1155, ERC2981 {
    constructor(string memory uri, uint256 id, uint256 amount, address royaltyReceiver, uint96 royaltyFeeNumerator) ERC1155(uri) {
        _mint(msg.sender, id, amount, "");
        if(royaltyReceiver != address(0) && royaltyFeeNumerator != 0){
            _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
        }
    }
     function supportsInterface(bytes4 interfaceId) public view override(ERC2981, ERC1155) returns (bool) {
        return ERC2981.supportsInterface(interfaceId) || ERC1155.supportsInterface(interfaceId) || interfaceId == 0x01ffc9a7;
    }
}