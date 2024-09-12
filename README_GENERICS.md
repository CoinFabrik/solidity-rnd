# Security Issues

## Generical

1.  Non-Finalized Code in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "medium",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Non-Finalized Code",
    - vulnerable_functions:
      `vStakerFactory::createPoolStaker()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vStakerFactory.sol#L59), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/VStakerFactory.sol)
    - description: "The code should not contain TODO comments. Otherwise, it means that the code is not finalized and additional changes will be introduced in the future."
    - slither_output: ["Parameter vStakerFactory.createPoolStaker(address)._lpToken (contracts/vStakerFactory.sol#57) is not in mixedCase"]
    - slither_detect: 0

2.  Floating Pragma in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Unlocked pragma version",
    - vulnerable_functions:""
    - description: "Locking the pragma helps ensure that contracts do not accidentally get deployed using, for example, an outdated compiler version that might introduce bugs that affect the contract system negatively."
    - slither_output: [""]
    - slither_detect: 0

3.  Unscalable Functionality - Same Checks In Functions in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Repeated code",
    - vulnerable_functions:`vStaker::` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vStaker.sol), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/VStaker.sol)
    - description: "It is considered that smart contract systems should be easily scalable. Same checks used in several functions overwhelm code and make further development difficult"
    - slither_output: [""]
    - slither_detect: 0

4.  Missing Zero Address Validation in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "medium",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Zero Address Validation",
    - vulnerable_functions:`vStakerFactory::constructor()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vStakerFactory.sol), [patched] (virtuswap-tokenomics00/patched/tokenomics/contracts/vStakerFactory.sol)
      `vStaker::unlockVrsw()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vStaker.sol), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/VStaker.sol)
      `vChainMinter::constructor(), setStakerFactory(), transferRewards(), mintGVrsw(), burnGVrsw()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vChainMinter.sol), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/VChainMinter.sol)
      `GVrsw::mint()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/GVrsw.sol), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/GVrsw.sol)
    - description: "Address parameters are being used without checking against the possibility of 0x0.\\n\\nThis can lead to unwanted external calls to 0x0."
    - slither_output: ["vStakerFactory.constructor(address,address,address)._tokenomicsParams (contracts/vStakerFactory.sol#29) lacks a zero-check on : - tokenomicsParams = _tokenomicsParams (contracts/vStakerFactory.sol#34)",
      "vStaker.constructor(address,address,address,address)._tokenomicsParams (contracts/vStaker.sol#76) lacks a zero-check on : - tokenomicsParams = _tokenomicsParams (contracts/vStaker.sol#81)",
      "vChainMinter.constructor(uint256,address,address,address)._tokenomicsParams (contracts/vChainMinter.sol#59) lacks a zero-check on : - tokenomicsParams = _tokenomicsParams (contracts/vChainMinter.sol#63)",
      "vChainMinter.setStakerFactory(address)._newStakerFactory (contracts/vChainMinter.sol#92) lacks a zero-check on : - stakerFactory = _newStakerFactory (contracts/vChainMinter.sol#94)",
      "Parameter vChainMinter.setStakerFactory(address)._newStakerFactory (contracts/vChainMinter.sol#92) is not in mixedCase",
      "Reentrancy in vChainMinter.transferRewards(address,uint256) (contracts/vChainMinter.sol#158-186): External calls: - SafeERC20.safeTransfer(IERC20(vrsw),to,amount) (contracts/vChainMinter.sol#184) Event emitted after the call(s): - TransferRewards(to,amount) (contracts/vChainMinter.sol#185)",
      "vChainMinter.transferRewards(address,uint256) (contracts/vChainMinter.sol#158-186) uses timestamp for comparisons Dangerous comparisons: - require(bool,string)(block.timestamp >= emissionStartTs,too early) (contracts/vChainMinter.sol#159) - block.timestamp >= startEpochTime + epochDuration (contracts/vChainMinter.sol#167)",
      "Reentrancy in vStaker.lockVrsw(uint256,uint256) (contracts/vStaker.sol#194-216): External calls: - SafeERC20.safeTransferFrom(IERC20(vrswToken),msg.sender,address(this),amount) (contracts/vStaker.sol#208-213) - IvChainMinter(minter).mintGVrsw(msg.sender,amount) (contracts/vStaker.sol#214) Event emitted after the call(s): - LockVrsw(msg.sender,amount,lockDuration) (contracts/vStaker.sol#215)",
      "vChainMinter.burnGVrsw(address,uint256) (contracts/vChainMinter.sol#201-210) uses arbitrary from in transferFrom: SafeERC20.safeTransferFrom(IERC20(gVrsw),to,address(this),amount) (contracts/vChainMinter.sol#209)",
      "Reentrancy in vStaker.unstakeVrsw(uint256) (contracts/vStaker.sol#174-191): External calls: - SafeERC20.safeTransfer(IERC20(vrswToken),msg.sender,amount) (contracts/vStaker.sol#187) - IvChainMinter(minter).burnGVrsw(msg.sender,amount) (contracts/vStaker.sol#188) Event emitted after the call(s): - UnstakeVrsw(msg.sender,amount) (contracts/vStaker.sol#190)"]
    - slither_detect: 0.5

5.  Best Practice Violation in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Arrays lengths unchecked",
    - vulnerable_functions:`vChainMinter::setAllocationPoints()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vChainMinter.sol), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/VChainMinter.sol)
    - description: "The input arrays are not validated for having equal lengths. This violates the best practices"
    - slither_output: ["Parameter vChainMinter.setAllocationPoints(address[],uint256[]).\_stakers (contracts/vChainMinter.sol#119) is not in mixedCase",
      "Parameter vChainMinter.setAllocationPoints(address[],uint256[]).\_allocationPoints (contracts/vChainMinter.sol#120) is not in mixedCase",
      "vChainMinter.setAllocationPoints(address[],uint256[]) (contracts/vChainMinter.sol#118-155) uses timestamp for comparisons Dangerous comparisons: - block.timestamp >= startEpochTime + epochDuration (contracts/vChainMinter.sol#122)",
      "vChainMinter.setAllocationPoints(address[],uint256[]) (contracts/vChainMinter.sol#118-155) has external calls inside a loop: require(bool,string)(IvStakerFactory(\_stakerFactory).getPoolStaker(IvStaker(\_stakers[i]).lpToken()) == \_stakers[i],invalid staker) (contracts/vChainMinter.sol#130-135)"
      ]
    - slither_detect: 0

6.  State Variables Can Be Declared Immutable in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Gas usage",
    - vulnerable_functions:`vGlobalMinter::gVrsw(), vrsw()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vGlobalMinter.sol#L23), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vGlobalMinter.sol)
    - description: "Variables gVrsw and vrsw values are only set in the constructor. Those variables can be declared as immutable. This will lower Gas usage."
    - slither_output: [""]
    - slither_detect: 0

7.  Unauthorized Access in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "low",
    - cwe_classification": 284,
    - vulnerability_class: "Access control",
    - vulnerability_subclass: "Authorization",
    - vulnerable_functions:`vVestingWallet::release()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vVestingWallet.sol#L23), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/VVestingWallet.sol)
    - description: "The release() function can be called by anyone, allowing external users to release tokens on behalf of the beneficiary."
    - slither_output: [""]
    - slither_detect: 0

8.  Missing Events in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "low",
    - cwe_classification": 778,
    - vulnerability_class: "Best practices",
    - vulnerability_subclass: "Missing Events",
    - vulnerable_functions:`vTokenomicsParams::constructor()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vTokenomicsParams.sol), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/VTokenomicsParams.sol)
    - description: "Events for critical state changes should be emitted for tracking things off-chain. Missing event inside constructor() of vTokenomicsParams, tokenomics parameters are updated and UpdateTokenomicsParams should be emitted like in updateParams()."
    - slither_output: [""]
    - slither_detect: 0

9.  NatSpec Comment Contradiction in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "N/As",
    - vulnerability_subclass: "",
    - vulnerable_functions:`vChainMinter::transferRewards()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vChainMinter.sol#L160), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/VChainMinter.sol)
    - description: "It is considered that the project should be consistent and contain no self-contradictions. The NatSpec comments of the transferRewards() imply that the caller must be a registered staker with a non-zero allocation point. Actually, staker can have a non-zero allocation point, in case he had rewards before. This may lead to wrong assumptions about the code's purpose."
    - slither_output: ["vChainMinter.transferRewards(address,uint256) (contracts/vChainMinter.sol#158-186) uses timestamp for comparisons Dangerous comparisons: - require(bool,string)(block.timestamp >= emissionStartTs,too early) (contracts/vChainMinter.sol#159) - block.timestamp >= startEpochTime + epochDuration (contracts/vChainMinter.sol#167)",
      "Reentrancy in vChainMinter.transferRewards(address,uint256) (contracts/vChainMinter.sol#158-186): External calls: - SafeERC20.safeTransfer(IERC20(vrsw),to,amount) (contracts/vChainMinter.sol#184) Event emitted after the call(s): - TransferRewards(to,amount) (contracts/vChainMinter.sol#185)"
      ]
    - slither_detect: 0

10. Incorrect Mathematical Operation in [Venus Protocol](./venusProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/06/Venus_SC-Audit-Report_10052023_SA-1336.pdf),
    - reported_impact: "Critical",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:`PegStability.sol::previewTokenUSDAmount()` [vulnerable](venusProtocol00/vulnerable/venus-protocol/contracts/PegStability/PegStability.sol#L208), [patched](venusProtocol00/patched/venus-protocol/contracts/PegStability/PegStability.sol)
      `PegStability.sol::getPriceInUSD()` [vulnerable](venusProtocol00/vulnerable/venus-protocol/contracts/PegStability/PegStability.sol#L228), [patched](venusProtocol00/patched/venus-protocol/contracts/PegStability/PegStability.sol)
    - description: "It is assumed that in all cases the decimals for USDC and USDT are 18, but depending on the network this may not always be the case. Therefore, when calculating to estimate the swap, an incorrect value can be produced."
    - slither_output: [""]
    - slither_detect: 0

11. Check-Effect-Interaction in [Venus Protocol](./venusProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/06/Venus_SC-Audit-Report_10052023_SA-1336.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 387,
    - vulnerability_class: "Reentrancy",
    - vulnerability_subclass: "Time-of-check Time-of-use (TOCTOU) Race Condition",
    - vulnerable_functions:`PegStability.sol::swapVAIForStable()` [vulnerable](venusProtocol00/vulnerable/venus-protocol/contracts/PegStability/PegStability.sol#L163), [patched](venusProtocol00/patched/venus-protocol/contracts/PegStability/PegStability.sol)
      `PegStability.sol::swapStableForVAI()` [vulnerable](venusProtocol00/vulnerable/venus-protocol/contracts/PegStability/PegStability.sol#L189), [patched](venusProtocol00/patched/venus-protocol/contracts/PegStability/PegStability.sol)
    - description: "Reentrancy error: The static variable vaiMinted is modified after executing the transfer, which means the balance can be refilled before the transfer is completed, potentially allowing it to be re-executed."
    - slither_output: ["Reentrancy in PegStability.swapVAIForStable(address,uint256) (contracts/PegStability/PegStability.sol#151-168)"]
    - slither_detect: 1

12. Denial of Service in [Warped Games](./WarpedGames00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/Warped_SC-Audit-Report_20_06_23_SA-1317.pdf),
    - reported_impact: "Critical",
    - cwe_classification": 400,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Resource Exhaustion",
    - vulnerable_functions:`WarpedTaxHandler.sol::removeNFTs()` [vulnerable](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTaxHandler.sol#L154), [patched](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTaxHandler.sol)
    - description: "Deletes an element from an array, but forgets to delete the place it occupies."
    - slither_output: ["WarpedTaxHandler.removeNFTs(address[]) (contracts/WarpedTaxHandler.sol#154-165) has costly operations inside a loop",
      "Loop condition j < nftContracts.length (contracts/WarpedTaxHandler.sol#157) should use cached array length instead of referencing `length` member of the storage array."]
    - slither_detect: 0

13. Front Running in [Warped Games](./WarpedGames00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/Warped_SC-Audit-Report_20_06_23_SA-1317.pdf),
    - reported_impact: "High",
    - cwe_classification": 0,
    - vulnerability_class: "MEV",
    - vulnerability_subclass: "Front Running",
    - vulnerable_functions:`WarpedTreasuryHandler.sol::addLiquidity()` [vulnerable](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTreasuryHandler.sol), [patched](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTreasuryHandler.sol)
    - description: "Amount values are set to 0 when interacting with Uniswap. This allows attackers to conduct frontal attacks and operations can generate unexpected amounts of tokens."
    - slither_output: [""]
    - slither_detect: 0

14. Denial Of Service in [Warped Games](./WarpedGames00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/Warped_SC-Audit-Report_20_06_23_SA-1317.pdf),
    - reported_impact: "High",
    - cwe_classification": 400,
    - vulnerability_class: "Denial Of Service",
    - vulnerability_subclass: "Resource Exhaustion",
    - vulnerable_functions:`WarpedTokenManager.sol::_getTaxBasisPoints()` [vulnerable](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTokenManager.sol), [patched](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTokenManager.sol)
    - description: "tour all NFTs and tax rates. In case the arrays are large enough to exceed the gas limit of the block, the execution may fail."
    - slither_output: [""]
    - slither_detect: 0

15. Data Consistency in [Warped Games](./WarpedGames00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/Warped_SC-Audit-Report_20_06_23_SA-1317.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 703,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Uniqueness Check Missing",
    - vulnerable_functions:`WarpedTaxHandler.sol::addNFTs()` [vulnerable](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTaxHandler.sol#L142), [patched](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTokenManager.sol)
    - description: "The NFTs are not being checked for the uniqueness when they are added. This may result in duplicates and inconsistent contract state."
    - slither_output: [""]
    - slither_detect: 0

16. Unchecked Transfer in [Warped Games](./WarpedGames00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/Warped_SC-Audit-Report_20_06_23_SA-1317.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 703,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Unchecked Return Value",
    - vulnerable_functions:`WarpedTreasuryHandler.sol::withdraw()` [vulnerable](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTreasuryHandler.sol), [patched](WarpedGames00/vulnerable/contracts-warped-token/contracts/WarpedTreasuryHandler.sol)
    - description: "The function withdraw() does not use SafeERC20 library for checking the result of ERC20 token transfer."
    - slither_output: ["WarpedTreasuryHandler.withdraw(address,uint256) (contracts/WarpedTreasuryHandler.sol#218-224) ignores return value by IERC20(tokenAddress).transfer(address(treasury),amount) (contracts/WarpedTreasuryHandler.sol#222)"]
    - slither_detect: 1

17. Data Consistency in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Critical",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Input Validation",
    - vulnerable_functions:`CyberTitansTournament.sol::joinTournament()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L137), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol),
      `CyberTitansTournament.sol::startTournament()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L166), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol)
      `CyberTitansTournament.sol::finalizeTournament()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L178), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol)
    - description: "The functions joinTournament(), startTournament(), and finalizeTournament() take an id value as an argument, which is used to interact with an array of created tournaments stored in the CyberTitansTournament contract. The value passed as id is not validated. This issue leads to the possibility of interacting with non-existent tournaments."
    - slither_output: ["Reentrancy in CyberTitansTournament.joinTournament(uint256) (contracts/game/CyberTitansTournament.sol#137-148)",
      "CyberTitansTournament.joinTournament(uint256) (contracts/game/CyberTitansTournament.sol#137-148) uses timestamp for comparisons",
      "CyberTitansTournament.joinTournament(uint256) (contracts/game/CyberTitansTournament.sol#137-148) compares to a boolean constant",
      "Reentrancy in CyberTitansTournament.finalizeTournament(uint256,address[]) (contracts/game/CyberTitansTournament.sol#177-224)"]
    - slither_detect: 0

18. Insufficient Balance in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "High",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:`CyberTitansGame.sol::finalizeGame()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol#L128), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol),
    - description: "In the CyberTitansGame contract, the finalizeGame() function first sends rewards to the winners, then takes fees and burns some amount of tokens. The function does not validate the sum of these operations; it can be greater than the number of tokens allocated for the game, as there is no limit on the values used for computation: winners[], fee, and rake. This can lead to an insufficient balance in the smart contract."
    - slither_output: ["Reentrancy in CyberTitansGame.finalizeGame(uint256,address[]) (contracts/game/CyberTitansGame.sol#128-148)"]
    - slither_detect: 0

19. Non-Finalized Code in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 1121,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Incomplete Code",
    - vulnerable_functions:`CyberTitansTournament.sol::retireFromTournament()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L106), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol),
    - description: "The function retireFromTournament() and the Event onRetiredTournament are present in the code as a draft, suggesting there will be an upgrade of the provided contracts. This means that the code is not finalized and additional changes will be introduced in the future, which cannot be validated."
    - slither_output: [""]
    - slither_detect: 0

20. Inefficient Gas Model: Uncontrolled Loop of Storage Interactions in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Storage Interaction",
    - vulnerable_functions:`CyberTitansTournament.sol::changeArray()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L156), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol),
    - description: "The function changeArrays() performs loops of uncontrolled iterations. Since those loops interact with storage variables, the block gas limit can be reached and the function may fail. Additionally, this design is not efficient in terms of Gas expense, since different storage variables must be accessed every time, even if only one of them has to be set."
    - slither_output: ["Parameter CyberTitansTournament.changeArrays(uint32[][8],uint32[][8],uint32[][12],uint8[8]).\_prizes (contracts/game/CyberTitansTournament.sol#106) is not in mixedCase"]
    - slither_detect: 0

21. Inefficient Gas Model: Uncontrolled Loop of Storage Interactions in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Storage Interaction",
    - vulnerable_functions:`CyberTitansTournament.sol::finalizeTournament()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L156), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol),
      `CyberTitansGame.sol::createGame()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol),
      `LitlabPreStakingBox.sol::stake()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol),
    - description: "The following functions perform highly expensive storage operations inside a loop, which can reach the block Gas limit"
    - slither_output: [""]
    - slither_detect: 0

22. Inefficient Gas Model: Storage Abuse in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Storage Access",
    - vulnerable_functions:`CyberTitansTournament.sol::finalizeTournament()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L156), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol),
    - description: "In the finalizeTournament() function, the state variables tournament.tournamentAssuredAmount and tournament.token are accessed multiple times, consuming Gas unnecessarily."
    - slither_output: ["Parameter CyberTitansTournament.changeArrays(uint32[][8],uint32[][8],uint32[][12],uint8[8]).\_prizes (contracts/game/CyberTitansTournament.sol#106) is not in mixedCase"]
    - slither_detect: 0

23. Inefficient Gas Model: Storage Abuse in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Storage Access",
    - vulnerable_functions:`CyberTitansGame.sol::finalizeGame()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol#L128), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol),
    - description: "In the finalizeGame() function, the state variables game.token and game.totalBet are accessed multiple times, consuming Gas unnecessarily.."
    - slither_output: ["Reentrancy in CyberTitansGame.finalizeGame(uint256,address[]) (contracts/game/CyberTitansGame.sol#128-148):"]
    - slither_detect: 0

24. Invalid Calculations in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "High",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:`LitlabPreStakingBox.sol::_getData()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L183), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol),
    - description: "In the \_getData() function, rewardsTokensPerSec is calculated. To do so, there are two divisions by 10\*\*18 which are unnecessary, as they cancel each other out mathematically. However, the way that calculation is set right now, leads to two errors: First, Solidity language does not have floating point numbers and thus the result of the calculation will not be accurate, leaving some residual leftover tokens. Second, the if (totalStakedAmount > 0) check is incorrect, as for 0 < totalStakedAmount < 1e18 range there will be a case of the division by 0, which will result in Denial of Service violation."
    - slither*output: ["LitlabPreStakingBox.\_getData(address) (contracts/staking/LitlabPreStakingBox.sol#183-196) performs a multiplication on the result of a division: rewardsTokensPerSec = (totalRewards \* (balances[_user].amount / 10 \*\* 18)) / ((stakeEndDate - stakeStartDate) \_ (totalStakedAmount / 10 \*\* 18)) (contracts/staking/LitlabPreStakingBox.sol#193)",
      "LitlabPreStakingBox.\_getData(address) (contracts/staking/LitlabPreStakingBox.sol#183-196) performs a multiplication on the result of a division: rewardsTokensPerSec = (totalRewards * (balances[_user].amount / 10 \*\* 18)) / ((stakeEndDate - stakeStartDate) \_ (totalStakedAmount / 10 \*\* 18)) (contracts/staking/LitlabPreStakingBox.sol#193)"]
    - slither_detect: 1

25. Inefficient Gas Model: Non-specific View Function in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "View Function Optimization",
    - vulnerable_functions:`LitlabPreStakingBox.sol::withdrawRewards()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol),
    - description: "In the withdrawRewards() function, there is a call to the view function \_getData() in order to get pendingRewards. Said function computes a lot of variables, but only one of them is used. Although it is a view function, it will spend Gas when called by a non-view function."
    - slither_output: [""]
    - slither_detect: 0

26. Non-Finalized Code in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "High",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Non finalized code",
    - vulnerable_functions:`LITTAdvisorsTeam.sol::teamWithdraw()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol#L106), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol),
    - description: "The smart contract LITTAdvisorsTeam.sol uses truffle/console.sol and console.log() functions inside. This means that the code is submitted in a non-final version"
    - slither_output: [""]
    - slither_detect: 0

27. Inefficient Gas Model: Storage Abuse in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Storage Access",
    - vulnerable_functions:`LITTVestingContract.sol::_executeVesting()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#L151), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#L151),
    - description: "In the \_executeVesting() function, the state variable data.\_amount is accessed multiple times, consuming Gas unnecessarily."
    - slither_output: [""]
    - slither_detect: 0

28. Inefficient Gas Model: Cache Length in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Loop Optimization",
    - vulnerable_functions:`LITTAdvisorsTeam.sol::approveTeamWithdraw()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol),
    - description: "In the approveTeamWithdraw() function, a for loop iterates through approvalWallets.length. The storage variable approvalWallets will be thus read at every iteration, consuming Gas unnecessarily."
    - slither_output: [""]
    - slither_detect: 0

29. Inefficient Gas Model: Cache Length in [Litlab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Loop Optimization",
    - vulnerable_functions:`LITTAdvisorsTeam.sol::teamWithdraw()` [vulnerable](litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol), [patched](litLab00/patched/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol),
    - description: "In the teamWithdraw() function, a for loop iterates through approvalWallets.length. The storage variable approvalWallets will be thus read at every iteration, consuming Gas unnecessarily."
    - slither_output: ["LITTAdvisorsTeam.teamWithdraw() (contracts/vesting/LITTAdvisorsTeam.sol#106-129) has costly operations inside a loop: delete teamApprovals[approvalWallets[i]] (contracts/vesting/LITTAdvisorsTeam.sol#112)"]
    - slither_detect: 1

30. Redundant Balance Mapping in [DeedzCoin](./deedzCoin00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/2cimple_SC-Audit-Report_201023_SA-1808.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Data Inconsistency",
    - vulnerable_functions:`DeedzCoin.sol::` [vulnerable](deedzCoin00/vulnerable/DeedzCoin/contracts/DeedzCoin.sol), [patched](deedzCoin00/patched/DeedzCoin/contracts/DeedzCoin.sol),
    - description: "The DeedzCoin smart contract introduces a public mapping named balances to store the balance of tokens for each address. This is redundant as the contract inherits from the ERC20 contract, which already provides a function named balanceOf() to retrieve an address's balance and maintains a private mapping \_balances to store token balances for addresses. Moreover, the contract does not override or update the functions (transfer, transferFrom) from the ERC20, which means, when those functions are called, only the \_balances mapping from the ERC20 will be updated, and not the balances mapping of the DeedzCoin contract. This could lead to major inconsistencies in the token balance data."
    - slither_output: [""]
    - slither_detect: 0

31. No Zero Address Validation in [DeedzCoin](./deedzCoin00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/2cimple_SC-Audit-Report_201023_SA-1808.pdf),
    - reported_impact: "Low",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Zero Address Validation",
    - vulnerable_functions:`DeedzCoin.sol::setSupplier()` [vulnerable](deedzCoin00/vulnerable/DeedzCoin/contracts/DeedzCoin.sol#L165), [patched](deedzCoin00/patched/DeedzCoin/contracts/DeedzCoin.sol),
    - description: "No zero address validation"
    - slither_output: [""]
    - slither_detect: 0

32. Unchecked Transfer in [Diverse](./Diverse00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/06/Diverse_Solutions_SC-Audit-Report_15062023_SA-1275.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 703,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Validation",
    - vulnerable_functions:`XARDMStaking.sol::deposit(), withdraw(),resetRewards()` [vulnerable](Diverse00/vulnerable/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol), [patched](Diverse00/patched/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol),
    - description: "The deposit(), withdraw() and resetRewards() functions do not use the SafeERC20 library for checking the result of ERC20 token transfers. Tokens may not follow the ERC20 standard and return a false in case of transfer failure or not return any value at all"
    - slither_output: ["XARDMStaking.deposit(uint256) (contracts/XARDMStaking.sol#76-94) ignores return value by ARDM.transferFrom(msg.sender,address(this),_amount) (contracts/XARDMStaking.sol#89)",
      "XARDMStaking.withdraw(uint256) (contracts/XARDMStaking.sol#96-120) ignores return value by ARDM.transfer(msg.sender,transferAmountMinusFee) (contracts/XARDMStaking.sol#111)",
      "XARDMStaking.withdraw(uint256) (contracts/XARDMStaking.sol#96-120) ignores return value by ARDM.transfer(treasuryAddress,fee) (contracts/XARDMStaking.sol#112)",
      "XARDMStaking.withdraw(uint256) (contracts/XARDMStaking.sol#96-120) ignores return value by ARDM.transfer(msg.sender,transferAmount) (contracts/XARDMStaking.sol#116)",
      "XARDMStaking.resetRewards(address) (contracts/XARDMStaking.sol#122-134) ignores return value by ARDM.transfer(to,amount) (contracts/XARDMStaking.sol#133)"]
    - slither_detect: 1

33. Redundant Memory Allocation in [Fore Protocol](./foreProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/ForeProtocol_SC-Audit-ReportSA-1667_update-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 0,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Redundant Memory Allocation",
    - vulnerable_functions:`MarketLib.sol::_predict()` [vulnerable](/foreProtocol00/vulnerable/contracts/contracts/protocol/markets/basic/library/MarketLib.sol#L305), [patched](/foreProtocol00/patched/contracts/contracts/protocol/markets/basic/library/MarketLib.sol),
    - description: "The line MarketLib.Market memory m = market; creates an in-memory copy of the storage variable market. Given the size of the struct (multiple variables), this can lead to a significant Gas overhead. Only one attribute of m (endPredictionTimestamp) is accessed afterward. It is wasteful to create an entire in-memory copy of the market for this purpose. It will lead to increased Gas cost for every invocation of the function, making predictions more expensive for users"
    - slither_output: [""]
    - slither_detect: 0

34. Denial of Service Vulnerability in [Fore Protocol](./foreProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/ForeProtocol_SC-Audit-ReportSA-1667_update-1.pdf),
    - reported_impact: "Critical",
    - cwe_classification": 400,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Resource Exhaustion",
    - vulnerable_functions:`BasicMarket.sol::withdrawVerificationReward()` [vulnerable](/foreProtocol00/vulnerable/contracts/contracts/protocol/markets/basic/BasicMarket.sol#L305), [patched](/foreProtocol00/patched/contracts/contracts/protocol/markets/basic/BasicMarket.sol),
    - description: "The withdrawVerificationReward function attempts to transfer tokens from its own address using the transferFrom method. Regular ERC20 implementations typically do not allow for this kind of transfer without prior approval calls, leading to potential denial-of-service (DoS) attacks as the function can be made to fail consistently.The addVestingSchedule and changeBeneficiaryAddress functions in the vesting contract are crucial for managing vesting schedules and beneficiaries. However, both functions lack event emissions, which is a significant oversight. Events in smart contracts are essential for tracking changes on the blockchain, especially for key administrative actions"
    - slither_output: ["BasicMarket.withdrawVerificationReward(uint256,bool) (contracts/protocol/markets/basic/BasicMarket.sol#305-363) uses arbitrary from in transferFrom: foreToken.transferFrom(address(foreVerifiers),m.disputeCreator,toDisputeCreator) (contracts/protocol/markets/basic/BasicMarket.sol#342-346)",
      "BasicMarket.withdrawVerificationReward(uint256,bool) (contracts/protocol/markets/basic/BasicMarket.sol#305-363) uses arbitrary from in transferFrom: foreToken.transferFrom(address(foreVerifiers),protocolConfig.highGuard(),toHighGuard) (contracts/protocol/markets/basic/BasicMarket.sol#347-351)",
      "BasicMarket.withdrawVerificationReward(uint256,bool) (contracts/protocol/markets/basic/BasicMarket.sol#305-363) ignores return value by foreToken.transferFrom(address(this),v.verifier,toVerifier) (contracts/protocol/markets/basic/BasicMarket.sol#325-329),"
      "BasicMarket.withdrawVerificationReward(uint256,bool) (contracts/protocol/markets/basic/BasicMarket.sol#305-363) ignores return value by foreToken.transferFrom(address(this),address(foreVerifiers),toVerifier) (contracts/protocol/markets/basic/BasicMarket.sol#334-338)",
      "BasicMarket.withdrawVerificationReward(uint256,bool) (contracts/protocol/markets/basic/BasicMarket.sol#305-363) ignores return value by foreToken.transferFrom(address(foreVerifiers),m.disputeCreator,toDisputeCreator) (contracts/protocol/markets/basic/BasicMarket.sol#342-346)",
      "BasicMarket.withdrawVerificationReward(uint256,bool) (contracts/protocol/markets/basic/BasicMarket.sol#305-363) ignores return value by foreToken.transferFrom(address(foreVerifiers),protocolConfig.highGuard(),toHighGuard) (contracts/protocol/markets/basic/BasicMarket.sol#347-351)"]
    - slither_detect: 1

35. Absence of ReentrancyGuard for ERC721 Functions in [Fore Protocol](./foreProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/ForeProtocol_SC-Audit-ReportSA-1667_update-1.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 280,
    - vulnerability_class: "Reentrancy",
    - vulnerability_subclass: "Missing Mitigations",
    - vulnerable_functions:`BasicMarket.sol::` [vulnerable](/foreProtocol00/vulnerable/contracts/contracts/protocol/markets/basic/BasicMarket.sol), [patched](/foreProtocol00/patched/contracts/contracts/protocol/markets/basic/BasicMarket.sol),
    - description: "The project's contracts do not utilize the ReentrancyGuard for functions that interact with ERC721 tokens. Although the project adheres to the Checks-Effects-Interactions (CEI) pattern, which can help prevent reentrancy attacks, it remains best practice to implement ReentrancyGuard as an additional security layer. Without the explicit use of ReentrancyGuard, functions are potentially more exposed to reentrancy attacks even if the CEI pattern is followed. Not using the ReentrancyGuard is a deviation from accepted smart contract development best practices."
    - slither_output: ["Reentrancy in BasicMarket.openDispute(bytes32) (contracts/protocol/markets/basic/BasicMarket.sol#163-185)",
      "Reentrancy in BasicMarket.marketCreatorFeeWithdraw() (contracts/protocol/markets/basic/BasicMarket.sol#366-387)",
      "Reentrancy in BasicMarket.resolveDispute(MarketLib.ResultType) (contracts/protocol/markets/basic/BasicMarket.sol#190-200"]
    - slither_detect: 1

36. Denial of Service in [Emdx-dex](./emdx-dex00/).

    - [report](https://github.com/InPlusLab/DAppSCAN/blob/main/DAppSCAN-source/audit_report/Coinfabrik-EMDX%20%E2%80%93%20Protocol%20Audit/perpetual-protocol-emdx-main/audit/2021-12%20EMDX%20Protocol%20Audit.final.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 400,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Resource Exhaustion",
    - vulnerable_functions:`Ark.sol::withdrawForLoss()` [vulnerable](/emdx-dex00/vulnerable/perpetual-protocol/src/Ark.sol), [patched](/emdx-dex00/patched/perpetual-protocol/src/Ark.sol),
    - description: "In the withdrawForLoss() function, it is possible to withdraw the total balance of the token. There is a require statement to prevent this, but after the require, there is a line that increases the decimals. This can cause problems with tokens having more than 18 decimals, potentially leading to a denial of service condition"
    - slither_output: [""]
    - slither_detect: 0

37. Denial of Service Vulnerability in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "high",
    - cwe_classification": 190,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Overflow",
    - vulnerable_functions:`Funnel.sol::allowance(), _remainingAllowance(), transferFrom()` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol#L222), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol),
    - description: "The internal function \_remainingAllowance() will revert with overflow in situations where the approveRenewable() or permitRenewable() functions are used to approve a max uint256 value with a recoveryRate > 0. The overflow can occur with different edge cases: ddapproveRenewable(, type(uint256).max - type(uint192).max + 1, type(uint192).max); approveRenewable(, type(uint256).max - type(uint64).max + 1, type(uint64).max) The \_remainingAllowance() function is used by allowance() and transferFrom(). These functions will be unusable after such approval"
    - slither_output: [""]
    - slither_detect: 0

38. Inefficient Gas Model in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "medium",
    - cwe_classification": 409,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "",
    - vulnerable_functions:`Funnel.sol::` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol),
    - description: "The Funnel smart contract imports and uses the ERC20 contract directly for the \_baseToken storage variable. It is best practice to use interfaces when interacting with external contracts. Importing and using an ERC20 smart contract directly may lead to higher deployment Gas expenses when deploying new funnels."
    - slither_output: [""]
    - slither_detect: 0

39. Inefficient Gas Model in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "medium",
    - cwe_classification": 409,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "",
    - vulnerable_functions:`FunnelFactory.sol::` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/FunnelFactory.sol), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/FunnelFactory.sol),
    - description: "The FunnelFactory smart contract imports the Funnel contract directly to use it in the initialization process. It is best practice to use interfaces when interacting with external contracts. Importing contracts directly increases the bytecode size of the deployed smart contract."
    - slither_output: [""]
    - slither_detect: 0

40. Unchecked Transfer in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "medium",
    - cwe_classification": 703,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Error handling",
    - vulnerable_functions:`Funnel.sol::transfer()` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol),
    - description: "An unchecked transferFrom() function is used in the transfer() function. Tokens that do not follow the ERC20 standard (such as USDT) may return false in the case of a transfer failure, or they may not return any value at all. This may lead to denial of service vulnerabilities when interacting with non-standard ERC20 tokens."
    - slither_output: [""]
    - slither_detect: 0

41. Violated Checks-Effects-Interactions Pattern in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "medium",
    - cwe_classification": 691,
    - vulnerability_class: "Reentrancy",
    - vulnerability_subclass: "",
    - vulnerable_functions:`FunnelFactory.sol::deployFunnelForToken()` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol#L36), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol),
    - description: "During the function execution, some state variables are updated after the external calls. This may lead to reentrancies, race conditions, and denial of service vulnerabilities during implementation of new functionality."
    - slither_output: ["Reentrancy in FunnelFactory.deployFunnelForToken(address) (src/FunnelFactory.sol#26-39)"]
    - slither_detect: 1

42. Floating Pragma in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Unlocked pragma version",
    - vulnerable_functions:"",
    - description: "Locking the pragma helps to ensure that contracts are not accidentally deployed using an outdated compiler version that might introduce bugs that affect the contract system negatively."
    - slither_output: ["Different versions of Solidity are used: ['>=0.8.0', '^0.8.0', '^0.8.1', '^0.8.15', '^0.8.2']"]
    - slither_detect: 1

43. State Variables that Could Be Declared as Constant in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Gas Usage",
    - vulnerable_functions:`Funnel.sol::` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol),
    - description: "There are variables in the contract that can be declared as constants to save Gas."
    - slither_output: [""]
    - slither_detect: 0

44. Missing Zero Address Validation in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "low",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Zero Address Validation",
    - vulnerable_functions:`Funnel.sol::initialize()` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol#L60), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol),
      `FunnelFactory.sol::constructor(), deployFunnelForToken()` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/FunnelFactory.sol#L26), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/FunnelFactory.sol),
    - description: "Address parameters are used without checking against the possibility of being 0x0. This can lead to unwanted external calls to 0x0"
    - slither_output: ["FunnelFactory.constructor(address)._funnelImplementation (src/FunnelFactory.sol#18) lacks a zero-check on"]
    - slither_detect: 0.5

45. Functions that Can Be Declared External in [Sha2](./sha2-funnel-contracts00/).

    - [report](https://storage.googleapis.com/audits-old/pdf/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "",
    - vulnerable_functions:`Funnel.sol::initialize(), permit(), permitRenewable(), approve(), approveRenewable(), renewableAllowance(), supportsInterface()` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol),
      `FunnelFactory.sol::ifFunnel(), deployFunnelForToken()` [vulnerable](/sha2-funnel-contracts00/vulnerable/funnel-contracts/src/FunnelFactory.sol), [patched](/sha2-funnel-contracts00/patched/funnel-contracts/src/FunnelFactory.sol),
    - description: "In order to save Gas, public functions that are never called in the contract should be declared as external."
    - slither_output: [""]
    - slither_detect: 0

46. Flashloan Attack, Front Running Attack in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Critical",
    - cwe_classification": 362,
    - vulnerability_class: "MEV",
    - vulnerability_subclass: "Front Running",
    - vulnerable_functions:`UniswapV2PathFinder.sol::getUniV2PathWithPriceOut(), getUniV2PathWithPriceIn()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/libs/price-feed/UniswapV2PathFinder.sol), [patched](/DeXe00/patched/DeXe/contracts/libs/price-feed/UniswapV2PathFinder.sol),
    - description: "The library uses Uniswaps getAmountsOut and getAmountsIn functions to determine the exchange rate for the assets. Those functions provide the price based on the current state of a liquidity pool that may be easily manipulated by flasholans."
    - slither_output: [""]
    - slither_detect: 0

    46. Flashloan Attack, Front Running Attack in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Critical",
    - cwe_classification": 362,
    - vulnerability_class: "MEV",
    - vulnerability_subclass: "Front Running",
    - vulnerable_functions:`UniswapV2PathFinder.sol::getUniV2PathWithPriceOut(), getUniV2PathWithPriceIn()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/libs/price-feed/UniswapV2PathFinder.sol), [patched](/DeXe00/patched/DeXe/contracts/libs/price-feed/UniswapV2PathFinder.sol),
    - description: "The library uses Uniswaps getAmountsOut and getAmountsIn functions to determine the exchange rate for the assets. Those functions provide the price based on the current state of a liquidity pool that may be easily manipulated by flasholans."
    - slither_output: [""]
    - slither_detect: 0

47. Denial of Service Vulnerability in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "High",
    - cwe_classification": 400,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Uncontrolled Resource Consumption",
    - vulnerable_functions:`GovValidators.sol::duration()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/validators/GovValidators.sol#L51), [patched](/DeXe00/patched/DeXe/contracts/gov/validators/GovValidators.sol),
    - description: "The voting duration should be greater than a minimal value. This may lead to not reaching a quorum as the proposal quickly comes to a Defeated state. The affected lines are: 51, 59, 64, 77, 96, 117, 124, 182, 186."
    - slither_output: [""]
    - slither_detect: 0

48. Integer Overflow in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "High",
    - cwe_classification": 190,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Integer Overflow",
    - vulnerable_functions:`GovUserKeeper.sol::_setERC721Address()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/user-keeper/GovUserKeeper.sol#L643), [patched](/DeXe00/patched/DeXe/contracts/gov/user-keeper/GovUserKeeper.sol),
    - description: "The function \_setERC721Address has the require(nftsTotalSupply > 0) check implemented. However, due to downcasting of nftsTotalSupply to uint128, this condition could be bypassed."
    - slither_output: [""]
    - slither_detect: 0

49. Denial of Service Vulnerability in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "High",
    - cwe_classification": 190,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Integer Overflow",
    - vulnerable_functions:`GovValidators.sol::createExternalProposal(), createInternalProposal()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/validators/GovValidators.sol#L70), [patched](/DeXe00/patched/DeXe/contracts/gov/validators/GovValidators.sol),
      `GovPoolCreate.sol::createProposal()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/validators/GovValidators.sol#L30), [patched](/DeXe00/patched/DeXe/contracts/gov/validators/GovValidators.sol),
    - description: "In case of setting voting duration close to the uint64 max value, voteEnd voting field may be overflowed and newly created votings can come to a Defeated state."
    - slither_output: ["Reentrancy in GovValidators.createExternalProposal(uint256,uint64,uint128) (contracts/gov/validators/GovValidators.sol#115-133)",
      "Reentrancy in GovValidators.createInternalProposal(IGovValidators.ProposalType,string,uint256[],address[]) (contracts/gov/validators/GovValidators.sol#70-113)"]
    - slither_detect: 0

50. Denial of Service Vulnerability in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "High",
    - cwe_classification": 190,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Integer Overflow",
    - vulnerable_functions:`GovValidators.sol::createInternalProposal()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/validators/GovValidators.sol#L70), [patched](/DeXe00/patched/DeXe/contracts/gov/validators/GovValidators.sol),
    - description: "Each new proposal creates a new structure with snapshotId as its unique identifier. snapshotId is capped by a uint32 type, which has a max value of 4294967295. The potential attacker may max out this value in the event of a potential gas price drop."
    - slither_output: ["Reentrancy in GovValidators.createInternalProposal(IGovValidators.ProposalType,string,uint256[],address[]) (contracts/gov/validators/GovValidators.sol#70-113)"]
    - slither_detect: 0

51. Best Practice Violation - Unfinalized Functionality in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 190,
    - vulnerability_class: "Best practices",
    - vulnerability_subclass: "Improper Enforcement of Behavioral Workflow",
    - vulnerable_functions:`GovValidators.sol::createInternalProposal()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/validators/GovValidators.sol#L70), [patched](/DeXe00/patched/DeXe/contracts/gov/validators/GovValidators.sol),
    - description: "It is not possible to execute an external proposal even if a quorum is reached. This may lead to double execution of the proposal off-chain as the proposal state could not be updated."
    - slither_output: ["Reentrancy in GovValidators.createInternalProposal(IGovValidators.ProposalType,string,uint256[],address[]) (contracts/gov/validators/GovValidators.sol#70-113)"]
    - slither_detect: 0

52. Upgradeability Issues in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "High",
    - cwe_classification": 1006,
    - vulnerability_class: "Best practices",
    - vulnerability_subclass: "Upgradeability",
    - vulnerable_functions:`TraderPool.sol::` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/TraderPool.sol), [patched](/DeXe00/patched/DeXe/contracts/trader/TraderPool.sol),
      `TraderPoolProposal.sol::` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/TraderPoolProposal.sol), [patched](/DeXe00/patched/DeXe/contracts/trader/TraderPoolProposal.sol),
    - description: "The contracts do not follow the upgradability best practices by not adding a gap in the contract storage."
    - slither_output: [""]
    - slither_detect: 0

53. Best Practice Violation - CEI Pattern Violation in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 696,
    - vulnerability_class: "Reentrancy",
    - vulnerability_subclass: "Incorrect Behavior Order",
    - vulnerable_functions:`TraderPoolInvestProposal.sol::create(), invest()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/TraderPoolInvestProposal.sol#L63), [patched](/DeXe00/patched/DeXe/contracts/trader/TraderPoolInvestProposal.sol),
      `TraderPoolRiskyProposal.sol::create(), invest(), _investActivePortfolio()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/TraderPoolRiskyProposal.sol#L116), [patched](/DeXe00/patched/DeXe/contracts/trader/TraderPoolRiskyProposal.sol),
    - description: "The Checks-Effects-Interactions pattern is violated. In some functions, the state variables are modified after doing external calls"
    - slither_output: ["Reentrancy in TraderPoolRiskyProposal.create(string,address,ITraderPoolRiskyProposal.ProposalLimits,uint256,uint256,uint256,uint256,address[]) (contracts/trader/TraderPoolRiskyProposal.sol#67-114)",
      "Reentrancy in TraderPoolRiskyProposal.invest(uint256,address,uint256,uint256,uint256) (contracts/trader/TraderPoolRiskyProposal.sol#116-175)",
      "Reentrancy in TraderPoolInvestProposal.create(string,ITraderPoolInvestProposal.ProposalLimits,uint256,uint256) (contracts/trader/TraderPoolInvestProposal.sol#63-93)"]
    - slither_detect: 1

54. Unindexed Events in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Low",
    - cwe_classification": 696,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Improper Adherence to Coding Standards",
    - vulnerable_functions:`PoolFactory.sol::` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/factory/PoolFactory.sol), [patched](/DeXe00/patched/DeXe/contracts/factory/PoolFactory.sol),
      `TraderPool.sol::` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/TraderPool.sol), [patched](/DeXe00/patched/DeXe/contracts/trader/TraderPool.sol),
    - description: "Having indexed parameters in the events makes it easier to search for these events using indexed parameters as filters."
    - slither_output: [""]
    - slither_detect: 0

55. Missing Zero Address Validation in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Low",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Zero Address Validation",
    - vulnerable_functions:`GovPool.sol::__GovPool_init()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/GovPool.sol#L104), [patched](/DeXe00/patched/DeXe/contracts/gov/GovPool.sol),
      `GovSettings.sol::__GovSettings_init()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/settings/GovSettings.sol#L19), [patched](/DeXe00/patched/DeXe/contracts/gov/settings/GovSettings.sol),
      `BasicTraderPool.sol::__BasicTraderPool_init()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/BasicTraderPool.sol#L30), [patched](/DeXe00/patched/DeXe/contracts/trader/BasicTraderPool.sol),
      `InvestTraderPool.sol::__InvestTraderPool_init()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/InvestTraderPool.sol#L33), [patched](/DeXe00/patched/DeXe/contracts/trader/InvestTraderPool.sol)
    - description: "Address parameters are used without checking against the possibility of 0x0"
    - slither_output: [""]
    - slither_detect: 0

56. Shadowing State Variables in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Low",
    - cwe_classification": 710,
    - vulnerability_class: "Best practices",
    - vulnerability_subclass: "Improper Adherence to Coding Standards",
    - vulnerable_functions:``TraderPool.sol::__TraderPool_init` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/TraderPool.sol#L89), [patched](/DeXe00/patched/DeXe/contracts/trader/TraderPool.sol),
      `BasicTraderPool.sol::__BasicTraderPool_init()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/BasicTraderPool.sol#L30), [patched](/DeXe00/patched/DeXe/contracts/trader/BasicTraderPool.sol),
      `InvestTraderPool.sol::__InvestTraderPool_init()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/trader/InvestTraderPool.sol#L33), [patched](/DeXe00/patched/DeXe/contracts/trader/InvestTraderPool.sol),
      `GovValidatorsToken.sol::constructor()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/validators/GovValidatorsToken.sol#L48), [patched](/DeXe00/patched/DeXe/contracts/gov/validators/GovValidatorsToken.sol),
      `ERC721Power.sol::constructor()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/ERC721/ERC721Power.sol#L46), [patched](/DeXe00/patched/DeXe/contracts/gov/ERC721/ERC721Power.sol),
      `ERC721Multiplier.sol::constructor()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/ERC721/ERC721Multiplier.sol#L23), [patched](/DeXe00/patched/DeXe/contracts/gov/ERC721/ERC721Multiplier.sol),
    - description: "State variables should not be shadowed in order to keep abstraction levels clear."
    - slither_output: ["TraderPool.__TraderPool_init(string,string,ITraderPool.PoolParameters).name (contracts/trader/TraderPool.sol#90) shadows",
      "BasicTraderPool.__BasicTraderPool_init(string,string,ITraderPool.PoolParameters,address).name (contracts/trader/BasicTraderPool.sol#31) shadows",
      "InvestTraderPool.__InvestTraderPool_init(string,string,ITraderPool.PoolParameters,address).name (contracts/trader/InvestTraderPool.sol#34) shadows",
      "GovValidatorsToken.constructor(string,string).name (contracts/gov/validators/GovValidatorsToken.sol#16) shadows",
      "ERC721Power.constructor(string,string,uint64,address,uint256,uint256,uint256).name (contracts/gov/ERC721/ERC721Power.sol#47) shadows",
      "ERC721Multiplier.constructor(string,string).name (contracts/gov/ERC721/ERC721Multiplier.sol#23) shadows",
      ]
    - slither_detect: 1

57. Inconsistent Data - Unused Return Value in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 252,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Unchecked Return Value",
    - vulnerable_functions:`Insurance.sol::buyInsurance(), _payout(), withdraw()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/factory/PoolFactory.sol#L54), [patched](/DeXe00/patched/DeXe/contracts/factory/PoolFactory.sol),
    - description: "Multiple functions perform transfer calls on the \_dexe token but ignore the return value."
    - slither_output: ["Insurance.buyInsurance(uint256) (contracts/insurance/Insurance.sol#54-68) ignores return value by _dexe.transferFrom(msg.sender,address(this),deposit) (contracts/insurance/Insurance.sol#65)
      Insurance.withdraw(uint256) (contracts/insurance/Insurance.sol#70-87) ignores return value by _dexe.transfer(msg.sender,amountToWithdraw) (contracts/insurance/Insurance.sol#84)
      Insurance._payout(address,uint256) (contracts/insurance/Insurance.sol#151-166) ignores return value by _dexe.transfer(user,payout) (contracts/insurance/Insurance.sol#163)"]
    - slither_detect: 1

58. Contradiction - Invalid Return Action in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 703,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Improper Check or Handling of Exceptional Conditions",
    - vulnerable_functions:`PoolFactory.sol::predictGovAddress(), _payout(), withdraw()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/factory/PoolFactory.sol#L231), [patched](/DeXe00/patched/DeXe/contracts/factory/PoolFactory.sol),
    - description: "The function contains the check (bytes(poolName).length == 0) which returns address(0). This might cause a logic error, because the relying code might not expect a zero address. Instead, an error should be thrown clearly marking that the input parameter is invalid."
    - slither_output: [""]
    - slither_detect: 0

59. Best Practice Violation - Unstable Import in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 1104,
    - vulnerability_class: "Best practices",
    - vulnerability_subclass: "Use of Unmaintained Third Party Components",
    - vulnerable_functions:"",
    - description: "The project allows different versions of a custom import @dlsl/dev-modules: ^1.8.1. This may lead to unexpected and untested code being deployed."
    - slither_output: ["Pragma version^0.8.4 (node_modules/@dlsl/dev-modules/contracts-registry/AbstractDependant.sol#2) allows old versions
      Pragma version^0.8.4 (node_modules/@dlsl/dev-modules/libs/arrays/Paginator.sol#2) allows old versions
      Pragma version^0.8.4 (node_modules/@dlsl/dev-modules/libs/data-structures/StringSet.sol#2) allows old versions
      Pragma version^0.8.4 (node_modules/@dlsl/dev-modules/libs/decimals/DecimalsConverter.sol#2) allows old versions"]
    - slither_detect: 1

60. Floating Pragma in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "Medium",
    - cwe_classification": 0,
    - vulnerability_class: "Best practices",
    - vulnerability_subclass: "Unlocked pragma version",
    - vulnerable_functions:"",
    - description: "Locking the pragma helps ensure that contracts do not accidentally get deployed using an outdated compiler version"
    - slither_output: ["Pragma version^0.8.4 (node_modules/@dlsl/dev-modules/contracts-registry/AbstractDependant.sol#2) allows old versions"]
    - slither_detect: 1

61. Redundant Import in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "low",
    - cwe_classification": 1164,
    - vulnerability_class: "Best practices",
    - vulnerability_subclass: "Irrelevant Code",
    - vulnerable_functions:"",
    - description: "Unused imports should be removed from the contracts."
    - slither_output: ["Math.average(uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#28-31) is never used and should be removed"]
    - slither_detect: 1

62. Missing Events in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "low",
    - cwe_classification": 710,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Improper Adherence to Coding Standards",
    - vulnerable_functions:`PriceFeed.sol::addPathTokens(), removePathTokens()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/core/PriceFeed.sol), [patched](/DeXe00/patched/DeXe/contracts/core/PriceFeed.sol),
      `CoreProperties.sol::` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/core/CoreProperties.sol), [patched](/DeXe00/patched/DeXe/contracts/core/CoreProperties.sol),
    - description: "Events for critical state changes should be emitted for tracking things off-chain"
    - slither_output: ["PriceFeed.addPathTokens(address[]) (contracts/core/PriceFeed.sol#56-58) ignores return value by \_pathTokens.add(pathTokens) (contracts/core/PriceFeed.sol#57)
      PriceFeed.removePathTokens(address[]) (contracts/core/PriceFeed.sol#60-62) ignores return value by \_pathTokens.remove(pathTokens) (contracts/core/PriceFeed.sol#61)"]
    - slither_detect: 0

63. Function Which May Be Declared Private in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "low",
    - cwe_classification": 710,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Improper Adherence to Coding Standards",
    - vulnerable_functions:`PoolFactory.sol::` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/factory/PoolFactory.sol#L231), [patched](/DeXe00/patched/DeXe/contracts/factory/PoolFactory.sol),
    - description: "There is no added value in declaring non-public functions as internal in a non-inherited contract.",
    - slither_output: [""]
    - slither_detect: 0

64. Redundant Statement in [Dexe](./DeXe00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf),
    - reported_impact: "low",
    - cwe_classification": 1164,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Irrelevant Code",
    - vulnerable_functions:`GovValidatorsToken.sol::mint(), burn()` [vulnerable](/DeXe00/vulnerable/DeXe/contracts/gov/validators/GovValidatorsToken.sol#L20), [patched](/DeXe00/patched/DeXe/contracts/gov/validators/GovValidatorsToken.sol),
    - description: "The onlyValidator check on the functions is redundant as the functions call \_beforeTokenTransfer functions internally, which is under the modifier",
    - slither_output: [""]
    - slither_detect: 0

65. Missing Zero Address Validation in [Dexalot](./Dexalot00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Dexalot_SC-Audit-Report_24102023_SA-1803-2.pdf),
    - reported_impact: "medium",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Zero Address Validation",
    - vulnerable_functions:`MainnetRFQ.sol::initialize(), addAdmin(), addTrustedContract()` [vulnerable](/Dexalot00/vulnerable/Dexalot/contracts/MainnetRFQ.sol#L81), [patched](/Dexalot00/patched/Dexalot/contracts/MainnetRFQ.sol),
    - description: "Address parameters are being used without checking against the possibility of 0x0",
    - slither_output: ["MainnetRFQ.initialize(address)._swapSigner (contracts/MainnetRFQ.sol#81) lacks a zero-check on"]
    - slither_detect: 0.5

66. Upgradeability Issues in [Dexalot](./Dexalot00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Dexalot_SC-Audit-Report_24102023_SA-1803-2.pdf),
    - reported_impact: "medium",
    - cwe_classification": 1006,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Upgradeability",
    - vulnerable_functions:"",
    - description: "The contract is upgradable but does not follow the upgradability best practices by not adding a gap in the contract storage. This may lead to contract storage layout corruption during an upgrade. The contract inherits EIP712Upgradeable that contains a **gap variable, but it is a best practice to create a new **gap variable that will be more accessible due to variables order.",
    - slither_output: [""]
    - slither_detect: 0

67. No Safe Transfer in [Snackclub](./SnackClub00/).

    - [report](https://docs.google.com/document/d/1_fluL1Fpn5U1g7l5y3bu-UsamGG-jZRRvoDSQwJF4Dc/edit#heading=h.95rs2thccxh2),
    - reported_impact: "Medium",
    - cwe_classification": 703,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Improper check or handling of exceptional conditions",
    - vulnerable_functions:`SnackclubTournamentsPayout.sol::transfer(), transferFrom()` [vulnerable](SnackClub00/vulnerable/contracts/SnackclubTournamentsPayout.sol#L25), [patched](SnackClub00/patched/contracts/SnackclubTournamentsPayout.sol),
    - description: "It is risky to use ERC20 transfer() and transferFrom() functions directly as some ERC20 tokens do not return a true value when invoked.",
    - slither_output: ["Reentrancy in SnackclubTournamentsPayout.claimReward(string) (SnackClub00/vulnerable/contracts/SnackclubTournamentsPayout.sol#10-29)"]
    - slither_detect: 0

68. Solidity Version Pinning in [Snackclub](./SnackClub00/).

    - [report](https://docs.google.com/document/d/1_fluL1Fpn5U1g7l5y3bu-UsamGG-jZRRvoDSQwJF4Dc/edit#heading=h.95rs2thccxh2),
    - reported_impact: "Low",
    - cwe_classification": 1104,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Use of Unmaintained Third Party Components",
    - vulnerable_functions:"",
    - description: "The pragma solidity statement used allows the contracts to be compiled with newer versions of the compiler. This may introduce unintended bugs when new compilers are released",
    - slither_output: ["Pragma version^0.8.11 (SnackClub00/vulnerable/contracts/RewardControl.sol#2) allows old versions",
      "Pragma version^0.8.11 (SnackClub00/vulnerable/contracts/RoleControl.sol#2) allows old versions",
      "Pragma version^0.8.11 (SnackClub00/vulnerable/contracts/SnackclubTournamentsPayout.sol#2) allows old versions"]
    - slither_detect: 1

69. Possible Reentrancy Attack with Vulnerable ERC20 in [Snackclub](./SnackClub00/).

    - [report](https://docs.google.com/document/d/1_fluL1Fpn5U1g7l5y3bu-UsamGG-jZRRvoDSQwJF4Dc/edit#heading=h.95rs2thccxh2),
    - reported_impact: "Low",
    - cwe_classification": 841,
    - vulnerability_class: "Reentrancy",
    - vulnerability_subclass: "Improper Enforcement of Behavioral Workflow",
    - vulnerable_functions:`SnackclubTournamentsPayout.sol::constructor()` [vulnerable](SnackClub00/vulnerable/contracts/SnackclubTournamentsPayout.sol#L25), [patched](SnackClub00/patched/contracts/SnackclubTournamentsPayout.sol),
    - description: "If the ERC20 token of the reward allows the receiver or a third party to execute some code when a transfer is being made, a reentrancy attack can be made to claim the same reward multiple times.",
    - slither_output: ["Reentrancy in SnackclubTournamentsPayout.claimReward(string) (SnackClub00/vulnerable/contracts/SnackclubTournamentsPayout.sol#10-29):"]
    - slither_detect: 1

70. Missing Storage Gaps in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 1293,
    - vulnerability_class: "Upgradability",
    - vulnerability_subclass: "Storage Extension",
    - vulnerable_functions:
      - `LiquidityGaugePoolController.sol` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePoolController.sol), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePoolController.sol)
      - `LiquidityGaugePoolState.sol` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePoolState.sol), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePoolState.sol)
      - `LiquidityGaugePoolReward.sol` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePoolReward.sol), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePoolReward.sol)
      - `TokenRecovery.sol` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/util/TokenRecovery.sol), [patched](./Neptune00/patched/Neptune/periphery/src/util/TokenRecovery.sol)
      - `WithPausability.sol` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/util/WithPausability.sol), [patched](./Neptune00/patched/Neptune/periphery/src/util/WithPausability.sol)
    - description: "When working with upgradeable contracts, it is necessary to introduce storage gaps to allow for storage extension during upgrades. Storage gaps are a convention for reserving storage slots in a base contract, allowing future versions of that contract to use up those slots without affecting the storage layout of child contracts.",
    - slither_output: []
    - slither_detect: 0

71. Race Condition in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "Low",
    - cwe_classification": 362,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Race Condition",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol::exit()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#140), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#168)
      - `LiquidityGaugePool.sol::withdrawRewards()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#136), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#164)
    - description: "The \_withdrawRewards function calculates the platformFee based on the current state of the \_poolInfo.platformFee variable. Given the dynamic nature of blockchain states, it is possible that the platformFee variable could be changed by an admin between when a user initiates a transaction and when it gets mined, leading to unexpected fee deductions. A user intending to withdraw their rewards may be subjected to a different platform fee than anticipated. This can result in unexpected deductions, which could erode user trust in the system and lead to potential financial loss for the user.",
    - slither_output: [
      "Reentrancy in LiquidityGaugePool.exit() (examples/neptune/gauge-pool/LiquidityGaugePool.sol#196-199): External calls: - \_withdraw(\_lockedByMe[_msgSender()]) (examples/neptune/gauge-pool/LiquidityGaugePool.sol#197) - returndata = address(token).functionCall(data,SafeERC20: low-level call failed) (node_modules/@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol#122) - (success,returndata) = target.call{value: value}(data) (node_modules/@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol#135) - IERC20Upgradeable(\_poolInfo.stakingToken).safeTransfer(\_msgSender(),amount) (examples/neptune/gauge-pool/LiquidityGaugePool.sol#137-140) - \_withdrawRewards() (examples/neptune/gauge-pool/LiquidityGaugePool.sol#198) - returndata = address(token).functionCall(data,SafeERC20: low-level call failed) (node_modules/@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol#122) etc"
      ]
    - slither_detect: 0.5

72. CEI Pattern Violation in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "Low",
    - reported_likelihood": "Low",
    - cwe_classification": 703,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Insufficient Control Flow Management",
    - vulnerable_functions:
    - `LiquidityGaugePool.sol::deposit()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#67), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#99)
    - description: "In the deposit function, a CEI pattern violation has been detected, although it doesn't immediately present a reentrancy risk. The amount to be deposited is taken after the corresponding state(variables/mappings) is updated. To resolve this issue, it is advisable to refactor the affected code to conform to the CEI pattern, thereby enhancing code readability and alignment with recognized coding standards.",
    - slither_output: []
    - slither_detect: 0

73. Insufficient Parameter Validation in addVestingSchedule() Function of Vesting Contract in [Farcana] (./Farcana00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/01/Hacken_Farcana_SCA-Farcana_Token_Dec2024_P-2023-063_1_20240102-08_50.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Low",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Incorrect Input Validation",
    - vulnerable_functions:
    - `FarcanaVesting.sol::addVestingSchedule()` [vulnerable](./Farcana00/vulnerable/smart-contracts/FarcanaVesting.sol#60), [patched](./Farcana00/patched/smart-contracts/FarcanaVesting.sol#60)
    - description: "The addVestingSchedule function in the TokenVesting contract is responsible for creating new vesting schedules for beneficiaries. However, the function does not perform adequate checks on the input parameters such as cliff, duration, start, and their relationship to each other and to tgeTime.",
    - slither_output: []
    - slither_detect: 0

74. Single-Step Ownership Transfer in [Farcana] (./Farcana00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/01/Hacken_Farcana_SCA-Farcana_Token_Dec2024_P-2023-063_1_20240102-08_50.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Unsafe Approval",
    - vulnerable_functions:
      - `FarcanaVesting.sol::changeBeneficiaryAddress()` [vulnerable](./Farcana00/vulnerable/smart-contracts/FarcanaVesting.sol#9), [patched](./Farcana00/patched/smart-contracts/FarcanaVesting.sol#11)
      - `FarcanaToken.sol::changeBeneficiaryAddress()` [vulnerable](./Farcana00/vulnerable/smart-contracts/FarcanaToken.sol#9), [patched](./Farcana00/patched/smart-contracts/FarcanaToken.sol#7)
    - description: "This approach, while straightforward, does not include a verification step for the new owner address before finalizing the transfer. The absence of such precautionary measure can lead to significant security and operational risks, particularly if an incorrect address is provided during the ownership transfer process",
    - slither_output: [
      "Parameter TokenVesting.changeBeneficiaryAddress(address,address).lost_address (examples/Farcana00/FarcanaToken.sol#153) is not in mixedCase",
      "Parameter TokenVesting.changeBeneficiaryAddress(address,address).new_address (examples/Farcana00/FarcanaToken.sol#153) is not in mixedCase"]
    - slither_detect: 0

75. Non-Utilization of SafeERC20 for Token Transfers in Vesting Contract in [Farcana] (./Farcana00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/01/Hacken_Farcana_SCA-Farcana_Token_Dec2024_P-2023-063_1_20240102-08_50.pdf),
    - reported_impact: "Low",
    - reported_likelihood": "Low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "External Libraries",
    - vulnerable_functions:
      - `FarcanaVesting.sol::claim` [vulnerable](./Farcana00/vulnerable/smart-contracts/FarcanaVesting.sol#64), [patched](./Farcana00/patched/smart-contracts/FarcanaVesting.sol#95)
    - description: "The TokenVesting contract correctly imports and declares the use of OpenZeppelin's SafeERC20 library for safer ERC20 token interactions. However, the implementation inconsistently applies these safety measures. Specifically, the claim function executes a token transfer using the standard transfer method of the ERC20 token, bypassing the safety checks provided by SafeERC20.",
    - slither_output: [
      "TokenVesting.claim() (examples/Farcana00/FarcanaVesting.sol#64-71) ignores return value by token.transfer(msg.sender,unreleased) (examples/Farcana00/FarcanaVesting.sol#70) Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unchecked-transfer"
      ]
    - slither_detect: 1

76. Incorrect Calculation of maxESE Due to Bitwise XOR Operator in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "High",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:
      - `Eesee::_createLot()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/marketplace/Eesee.sol#484), [patched](./Eesee00/patched/Eesee/contracts/marketplace/Eesee.sol#550)
    - description: "the caret symbol (^) is mistakenly used instead of the double asterisk (\*\*) which is the correct operator for exponentiation in Solidity. The caret symbol in Solidity is a bitwise XOR operator, not an exponentiation operator.",
    - slither_output: ["Error: Stack too deep"]
    - slither_detect: 0

77. Lack of Event Emissions in Key Functions in [Farcana] (./Farcana00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/01/Hacken_Farcana_SCA-Farcana_Token_Dec2024_P-2023-063_1_20240102-08_50.pdf),
    - reported_impact: "Low",
    - reported_likelihood": "Low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Missing Event Emissions",
    - vulnerable_functions:
    - `FarcanaVesting.sol::` [vulnerable](./Farcana00/vulnerable/smart-contracts/FarcanaVesting.sol), [patched](./Farcana00/patched/smart-contracts/FarcanaVesting.sol)
    - description: "The addVestingSchedule and changeBeneficiaryAddress functions in the vesting contract are crucial for managing vesting schedules and beneficiaries. However, both functions lack event emissions, which is a significant oversight. Events in smart contracts are essential for tracking changes on the blockchain, especially for key administrative actions",
    - slither_output: []
    - slither_detect: 0

78. Race Condition in [Neptune] (./neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "low",
    - reported_likelihood": "Low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Unlocked pragma version",
    - vulnerable_functions: ""
    - description: "The project uses floating pragmas ^0.8.0. This may result in the contracts being deployed using the wrong pragma version, which is different from the one they were tested with. For example, they might be deployed using an outdated pragma version which may include bugs that affect the system negatively",
    - slither_output: []
    - slither_detect: 0

79. Missing Zero Address Validation in [manilla](./manillaFinance-manilla-token00/).

    - [report](./manillaFinance-manilla-token00/Manilla_Finance_SC-Audit-Report_17_07_23_SA-1655.pdf),
    - reported_impact: "low",
    - cwe_classification": 20,
    - vulnerability_class: "Validations and error handling",
    - vulnerability_subclass: "Authorization",
    - vulnerable_functions:
      `Manilla::transferOwnership()` [vulnerable](./manillaFinance-manilla-token00/vulnerable/manilla-token/contracts/manilla.sol), [patched](./manillaFinance-manilla-token00/patched/manilla-token/contracts/manilla.sol)
    - description: "Address parameters are being used without checking against the possibility of 0x0. This can lead to unwanted external calls to 0x0"
    - slither_output: []
    - slither_detect: 0

80. Zero Reward Rate Setting in updateRewardRates() Function Can Nullify Staking Yields in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Low",
    - cwe_classification": 20,
    - vulnerability_class: "Missing Validation",
    - vulnerability_subclass: "Improper Input Validation",
    - vulnerable_functions:
      - `EeseeStaking::updateRewardRates()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/periphery/routers/EeseeRaribleRouter.sol#L291), [patched](./Eesee00/patched/Eesee/contracts/periphery/routers/EeseeRaribleRouter.sol)
    - description: "Although the function validates the length of the arrays and the progression of rates, it does not prevent setting a rate to zero, which can halt the reward accumulation process",
    - slither_output: []
    - slither_detect: 0
