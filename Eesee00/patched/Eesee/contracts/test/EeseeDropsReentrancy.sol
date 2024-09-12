// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "../interfaces/IEeseeDrops.sol";

contract EeseeDropsReentrancy {
    IEeseeDrops public drops;
    constructor(IEeseeDrops _drops){
        drops = _drops;
    }
    function onERC721Received(address, address, uint256, bytes memory) external returns (bytes4) {
        uint256[] memory IDs = new uint256[](0);
        uint32[] memory quantities = new uint32[](0);
        bytes32[][] memory merkleProofs = new bytes32[][](0);

        drops.mintDrops(IDs, quantities, merkleProofs, address(0), "");
        return this.onERC721Received.selector;
    }
}