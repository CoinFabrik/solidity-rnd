# Smart Contracts

## Eesee

Eesee is one of the main contracts users will interact with to buy or sell NFTs. This contract allows users to create their own NFTs and to collect [ESE](#ese) or NFT tokens from completed lots. It also allows users to spend ESE tokens they earned from lots on NFTs from any other marketplace using [EeseeSwap](#eeseeswap) contract (Rarible & Opensea currently). Eesee supports Lazy Minting, so you can create lots without providing upfront gas. We also make use of Lazy Transfer functionality, so tokens you place on our marketplace can be collected only when someone interacts with your lot (e.g. buys a ticket).

When creating a lot, creator can set its deadline, max tickets users can buy and a price for a single ticket. When buying multiple tickets, additional bonus tickets are provided to the buyer, amount of which is calculated by the formula: $$bonus = buyAmount^2 / (totalTickets * 4)$$ The more tickets the user buys, the more bonus tickets they receive, making large ticket sales more profitable.

If enough tickets were bought, the contract waits for a random number from ChainlinkVRF and allows lot winner to collect their winnings and lot owner to collect [ESE](#ese) they earned. In case the lot has expired, lot owner can withdraw their NFTs. Then, the contract waits for a random number from ChainlinkVRF and allows lot winner to collect collect [ESE](#ese) they earned from that lot. In case ChainlinkVRF was not called for 24 hours after the lot has ended, all users who participated in that lot can reclaim their tokens.

The winner is calculated on collection of rewards using binary search method, making it so that buying multiple tickets in a lot costs the same gas as buying a single ticket.

This contract is designed to be changeable in our system, so it will be replaced whennever a new version of Eesee comes out.

Eesee also supports making lots without providing upfront tokens by using "ESE" asset type. The winners of such lots will be able to either collect [ESE](#ese) tokens they earned from those lots, or to trade it for any NFT on any other NFT marketplace.

There is also a buyout system in place, allowing a single address to buy out all tickets in a lot and collect their assets immediately without waiting for ChainlinkVRF. This allows Eesee to act as a more traditional marketplace.

### Available external write functions:

1. **createLots** - Creates new lots with provided assets and parameters. To create a lot a signer must have those assets approved for use in Eesee contract. A lot can be created on behalf of the signer by using a signature system. There is also an ability to create lazy mining lots using said system.

2. **buyTickets** - Spends ESE tokens in exchange for tickets for specified lots. Must have ESE tokens approved or have a valid ERC712 permit provided. When buying multiple tickets, additional bonus tickets are provided to the buyer, amount of which is calculated by the formula: $bonus = buyAmount^2 / (totalTickets * 4)$.

3. **createLotsAndBuyTickets** - Combines two of the functions above to allow creating lots and buying tickets in them in a single transaction. Is useful for cases in which ticket buyers create lots on behalf of asset sellers using a signature system.

4. **receiveAssets** - Is called by lot winner to collect assets from specified lots. Note that for ESE type lots, **receiveTokens** should be called by winner instead.

5. **receiveTokens** - There are a number of different cases this function can be called for:
- By lot owner to collect ESE tokens earned from this lot.
- For ESE type lot - The winner can call this function to collect ESE tokens collected by this lot.
- In case a lot has expired while not collecting enough tickets - The winner selected after expire timestamp can call this function to claim ESE tokens collected by this lot. Note that if 24 hours pass after expireTimestamp without selecting a winner, a lot is canceled and all ticket buyers are able to reclaim their tokens with the **reclaimTokens** function.

6. **reclaimAssets** - In case a lot has expired while not collecting enough tickets, an owner can call this function to retrieve an asset from that lot. Also, in case a lot has collected enough tickets but ChainlinkVRF was not called in 24 hour window, an owner will also have an ability to reclaim the asset from that lot.

7. **reclaimTokens** - This function can only be called by ticket buyers if the lot has ended (by any means) and ChainlinkVRF was not called in 24 hour window. In such case ticket buyers can reclaim ESE tokens they paid for tickets back.

8. **callExternal** - Can call [EeseeProxy's](#eeseeproxy) callExternal. Is intended to be used with multicall to add flexibility to Eesee.sol. For example, it can be used to claim/reclaim tokens and swap them for assets on other marketplaces, but it can do much more.


[**Technical Documentation**](../contracts/marketplace/Eesee.md)

## EeseeDrops

EeseeDrops allows anyone to create their own collection, which other users will be able to mint tokens in. Drop parameters are highly customizable, so creators will be able to set mint price, allow lists, phases, etc. Allow lists are expressed as Merkle Tree roots, so users will have to provide proofs to prove that they are in the allowlist. Metadatas for each NFT in a drop are distributed randomly and verifiably by ChainlinkVRF after reveal.

[**Technical Documentation**](../contracts/marketplace/EeseeDrops.md)

## EeseePeriphery

EeseePeriphery allows users to buy tickets or mint drops in [Eesee](#eesee) and [EeseeDrops](#eeseedrops) with any token by swaping it for [ESE](#ese) using [1inch](https://1inch.io/) exchange. This contract also allows us to get winners of fulfilled lots.

[**Technical Documentation**](../contracts/periphery/EeseePeriphery.md)

## EeseeSwap

EeseeSwap is a helper contract that swaps [ESE](#ese) for specified token on [1inch](https://1inch.io/) exchange and trades that token for specified NFTs on external third-party exchanges using [EeseeRouters](#eeseerouters)

[**Technical Documentation**](../contracts/periphery/EeseeSwap.md)

## EeseePaymaster

EeseePaymaster is a paymaster contract for [Gas Station Network](https://opengsn.org/) that allows users to pay for gas in [ESE](#ese) tokens. It receives signed [ESE](#ese)'s price and user's personal discount from our backend, verifies the signature and collects calculated [ESE](#ese) from a user making a call.

[**Technical Documentation**](../contracts/periphery/EeseePaymaster.md)

## EeseeRandom

EeseeRandom is a contract that requests and stores random numbers using Chainlink Automation + Chainlink VRF combo. Chainlink Automation is used to ensure that the Chainlink VRF is called regularly without interruption. The contract also uses binary search algorithm to determine random word and timestamp of the next VRF call based on timestamp provided. This is used in [Eesee](#eesee) to get winners of lots and in [EeseeNFTDrop](../contracts/NFT/EeseeNFTDrop.md) to reveal metadatas of NFT Drop.

[**Technical Documentation**](../contracts/random/EeseeRandom.md)

## EeseeMining

EeseeMining is a contract that distibutes [ESE](#ese) tokens to users depending on Merkle Roots passed to it. Users have to provide proofs that they are in fact, part of Merkle Tree to have an ability to collect their [ESE](#ese) tokens.

[**Technical Documentation**](../contracts/rewards/EeseeMining.md)

## EeseeStaking

EeseeStaking is an [ESE](#ese) staking contract that has two staking schemes:

* "Flexible Staking" allows users to deposit and withdraw their tokens anytime and earn rewards.
* "Locked Staking", allows users to commit to leaving their tokens untouched for 90 days in exchange for a higher interst rate.

User's interest rate depends on their [ESE](#ese) volume on eesee platform, so whennever users spend [ESE](#ese) tokens on [Eesee](#eesee) or [EeseeDrops](#eeseedrops), they also increase their tier and APR in staking contract.
This contract's core staking algorithm is based on SmartChef's (MasterChef) with a number of additions such as volume tier system and multiple staking schemes.

[**Technical Documentation**](../contracts/rewards/EeseeStaking.md)

## ESE

ESE is a ERC20 token with automatic vesting and permit mechanisms, which is used on eesee platform.

[**Technical Documentation**](../contracts/token/ESE.md)

## EeseeRouters

EeseeRouters is a general name for a number of smart contracts that buy NFTs from external third-party marketplaces. They are used in conjunction with [EeseeSwap](#eeseeswap) to allow users to buy NFTs for ESE tokens.

[**Technical Documentation for EeseeOpenseaRouter**](../contracts/periphery/routers/EeseeOpenseaRouter.md)

[**Technical Documentation for EeseeRaribleRouter**](../contracts/periphery/routers/EeseeRaribleRouter.md)

## EeseeMinter

EeseeMinter is a helper contract that deploys and/or mints new NFT. It allows us to lazy mint new NFTs and create drops collections. It utilizes [OpenZeppelin's Clones](https://docs.openzeppelin.com/contracts/4.x/api/proxy#minimal\_clones) library to save deployment gas.

[**Technical Documentation**](../contracts/NFT/EeseeMinter.md)

## EeseeFeeSplitter

EeseeFeeSplitter is an contract that is used to split fees between multiple destinations, such as [EeseeStaking](#eeseestaking), [EeseeMining](#eeseemining), DAO and Team's treasury.

[**Technical Documentation**](../contracts/admin/EeseeFeeSplitter.md)

## EeseeProxy

EeseeProxy allows [Eesee](#eesee) to call any contract in another context. This feature can be used together with multicall to call arbitrary external contracts.

[**Technical Documentation**](../contracts/periphery/EeseeProxy.md)
