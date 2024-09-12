module.exports={
    //soldiity-coverage doesn't work with GSN, so we skip EeseePaymaster. Also ERC721AInitializable was already tested and we only changed constructor, so we skip it too.
    skipFiles: ['test', 'interfaces', 'types', 'periphery/EeseePaymaster.sol', 'NFT/ERC721AInitializable.sol'],
    configureYulOptimizer: true
}