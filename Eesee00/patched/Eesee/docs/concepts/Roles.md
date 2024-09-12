Eesee has a number of roles in the project:

* **ADMIN_ROLE** has the ability to: 
    * Grant and revoke other roles in [EeseeAccessManager](../contracts/admin/EeseeAccessManager.md). 
    * Change project fees in [Eesee](../contracts/marketplace/Eesee.md) and [EeseeDrops](../contracts/marketplace/EeseeDrops.md). 
    * Change the minimum and the maximum lot durations in [Eesee](../contracts/marketplace/Eesee.md). 
    * Approve and revoke approvals for contracts for use in [EeseePaymaster](../contracts/periphery/EeseePaymaster.md). 
    * Change automation interval for Chainlink Automation in [EeseeRandom](../contracts/random/EeseeRandom.md). 
    * Change Locked staking duration in [EeseeStaking](../contracts/rewards/EeseeStaking.md). 
    * Change staking reward rates in [EeseeStaking](../contracts/rewards/EeseeStaking.md).

* **PERFORM_UPKEEP_ROLE** can call ChainlinkVRF at any time in [EeseeRandom](../contracts/random/EeseeRandom.md). 

* **SIGNER_ROLE** is used in [EeseePaymaster](../contracts/periphery/EeseePaymaster.md) to sign current ESE token price and a personal user discount.

* **MERKLE_ROOT_UPDATER_ROLE** can add new merkle roots in [EeseeMining](../contracts/rewards/EeseeMining.md) contract.

* **volumeUpdater** (in [EeseeStaking.sol](../contracts/rewards/EeseeStaking.md)) can update lifetime user volume for [EeseeStaking](../contracts/rewards/EeseeStaking.md). Is intended to be a contract with which the users interact with to gain volume on our platform, eg. [Eesee](../contracts/marketplace/Eesee.md) or [EeseeDrops](../contracts/marketplace/EeseeDrops.md).

* **_initializer** (in [ESE.sol](../contracts/token/ESE.md)) - Can initialize [ESE](../contracts/token/ESE.md) contract and set vesting beneficiaries during uninitialized state. Is not used after initialization.

* **minter** (in [EeseeNFTLazyMint.sol](../contracts/NFT/EeseeNFTLazyMint.md)) - Can mint new NFTs for [EeseeNFTLazyMint](../contracts/NFT/EeseeNFTLazyMint.md) contract.

* **minter** (in [EeseeNFTDrop.sol](../contracts/NFT/EeseeNFTDrop.md)) - Can mint new NFTs for [EeseeNFTDrop.sol](../contracts/NFT/EeseeNFTDrop.md) contract.

* **PAUSER_ROLE** - Can pause [EeseeSwap.sol](../contracts/periphery/EeseeSwap.md), [EeseePeriphery.sol](../contracts/periphery/EeseePeriphery.md), [EeseeOpenseaRouter.sol](../contracts/periphery/routers/EeseeOpenseaRouter.md) & [EeseeRaribleRouter.sol](../contracts/periphery/routers/EeseeRaribleRouter.md) contracts.
