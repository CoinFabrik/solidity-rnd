# Solidity RnD: Solidity Vulnerability Dataset

![https://img.shields.io/badge/license-MIT-green](https://img.shields.io/badge/license-MIT-green)

This is a filesystem containing audited smart contracts which have been annotated for benchmarking security bug finding tools.

- For each project there is a copy of both the vulnerable and patched version of the GitHub repository from the audit report. In the `/vulnerable` folder you'll find the associated report and the `findings.json` file. This file contains all the vulnerabilities detected in the audit report in JSON format, including the description, impact, classification, class, and function of each vulnerability.
- The results of the dataset analisys are stored in the `README` and `README_GENERICS` file. These files provide information about all the vulnerabilities found in the entire dataset, including all the data provided in each `finding.json`, along with the corresponding links to the patched and vulnerable versions of the vulnerability. Additionally, they contain information about the slither output for the related function, indicating whether the tool detects the vulnerability or not.
- `check_slither_results` and `filter_slither_results` are scripts that assist users in running Slither on each repository and saving the output results in JSON files (`slither-vuln.json` & `slither-patched.json`). Afterward, the `slither-vuln.json` file is combined with the `findings.json` file. In `findings-slither-vuln-filtered.json` you'll find a new field for each element in the `findings.json` file that contains the results Slither detects **only** in the functions described in the _vulnerable_functions_ field.

### Slither results

- The `README` and `README_GENERICS` files provide information about the performance of the Slither tool on each vulnerability reported in the audits, indicating whether there is a True Positive (TP, detected by Slither) or False Negative (FN, not detected by Slither).
- The False Positive (FP) rate can be determined by analyzing the `findings-slither-vuln.json` file. For each element, if Slither produces a result that is not reported in the audit, it can be considered a False Positive.

## Listing

1. Virtuswap tokenomics. Audited by Hacken.
2. DeezCoin. Audited by Hacken .
3. Diverse. Audited by Hacken .
4. emdx-dex. Audited by CoinFabrik .
5. farcana. Audited by Hacken .
6. foreProtocol. Audited by Hacken .
7. litLab. Audited by Hacken .
8. neptune. Audited by Hacken .
9. venusProtocol. Audited by Hacken .
10. WarpedGames. Audited by Hacken .
11. enjinstarter. Audited by Hacken .
12. Manilla. Audited by Hacken .
13. Sha2. Audited by Hacken .
14. SnackClub. Audited by Coinfabrik .
15. DeXe. Audited by Hacken .
16. Dexalot. Audited by Hacken .
17. Eesee. Audited by Hacken

## Security Issues

### Logical

1. Highly permissive owner access in [enjinstarter](./enjinstarter-ejs-tokenomics-contracts00/).

   - [report](./enjinstarter-ejs-tokenomics-contracts00/audit-report.pdf),,
   - reported_impact: "high",
   - cwe_classification": 284,
   - vulnerability_class: "Access Control",
   - vulnerability_subclass: "Excessive Privilege",
   - vulnerable_functions:
     `StakingService.sol` [vulnerable](./enjinstarter-ejs-tokenomics-contracts00/vulnerable/ejs-staking-contracts/contracts/StakingService.sol), [patched] (./enjinstarter-ejs-tokenomics-contracts00/patched/ejs-staking-contracts/contracts/StakingService.sol)
     `StakingPool.sol` [vulnerable](./enjinstarter-ejs-tokenomics-contracts00/vulnerable/ejs-staking-contracts/contracts/StakingPool.sol), [patched](./enjinstarter-ejs-tokenomics-contracts00/patched/ejs-staking-contracts/contracts/StakingPool.sol)
   - description: "The owner can change the staking pool contract address, change the admin wallet, pause and unpause the contract, close staking pools, suspend and resume staking pools and stakes. Such functionality is critical and should be publicly described, so the users will be notified about it."
   - slither_output: []
   - slither_detect: 0

2. Highly Permissive Role Access [Diverse](./Diverse00/)..

   - [report](./Diverse00/vulnerable/report.pdf),
   - reported_impact: "Critical",
   - reported_likelihood": "High",
   - cwe_classification": 284,
   - vulnerability_class: "Access Control",
   - vulnerability_subclass: "Excessive Privilege",
   - vulnerable_functions:
     - `"XARDMStaking.sol::deposit()` [vulnerable](./Diverse00/vulnerable/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#L76), [patched](./Diverse00/patched/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#L101)
   - description: "The owner of the XARDMStaking contract can change the penalty deadline and penalty fee values after users have deposited ARDM tokens based on the previous penalty values. Changing the penalty and fine deadline will affect users who have stakes in the system and will make them pay different fines than promised.",
   - slither_output: ["XARDMStaking.deposit(uint256) (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#76-96) ignores return value by ARDM.transferFrom(msg.sender,address(this),\_amount) (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#91)", "XARDMStaking.deposit(uint256) (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#76-96) uses a dangerous strict equality:
     - totalxARDM == 0 || totalARDM == 0 (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#83)"]
   - slither_detect: 0

3. Highly Permissive Role Access [Diverse](./Diverse00/)..

   - [report](./Diverse00/vulnerable/report.pdf),
   - reported_impact: "Critical",
   - reported_likelihood": "High",
   - cwe_classification": 284,
   - vulnerability_class: "Access Control",
   - vulnerability_subclass: "Excessive Privilege",
   - vulnerable_functions:
     - `"XARDMStaking.sol::resetRewards()` [vulnerable](./Diverse00/vulnerable/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#L122), [patched](./Diverse00/patched/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol)
   - description: "The owner of the XARDMS Taking contract can withdraw ARDM tokens deposited by users using the resetRewards() function. When the total ARDM balance in the XARDMS take contract is greater than the total supply of xARDM, the owner can withdraw this difference as ARDM tokens. Although this difference occurs due to an external ARDM transfer to the contract in the form of rewards, share calculations for deposits made after the transfer will be calculated according to the new rate. This leads to a situation where any user who deposits ARDM tokens after the rewards transfer may suffer losses after the owner requests a rewards reset",
   - slither_output: ["XARDMStaking.resetRewards(address) (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#126-138) ignores return value by ARDM.transfer(to,amount) (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#137)"]
   - slither_detect: 0

4. Coarse-Grained Authorization Model in [litLab](./litLab00/)..

   - [report](./litLab00/vulnerable/report.pdf),
   - reported_impact: "High",
   - reported_likelihood": "High",
   - cwe_classification": 284,
   - vulnerability_class: "Access Control",
   - vulnerability_subclass: "Excessive Privilege",
   - vulnerable_functions:
     - `CyberTitansGame.sol::changeWallets()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol#L56), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol#L86)
   - description: "The function changeWallets() in both CyberTitansGames.sol and CyberTitansTournament.sol sets three critical state variables at once, which can lead to dangerous situations. A project should have a fine-grained access control system if it has multiple layers of auth-related functionality. In this case, the variable wallet is the company wallet receiving the fees; the manager has a critical access control role; and litlabToken corresponds to the token. Additionally, this design is not efficient in terms of Gas expense, since three storage variables must be accessed every time, even if only one of them has to be set. The code should not contain undocumented functionality.",
   - slither_output: ["CyberTitansGame.changeWallets(address,address,address)._manager (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol#63) lacks a zero-check o,"Parameter CyberTitansGame.changeWallets(address,address,address)._manager (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol#63) is not in mixedCase"]
   - slither_detect: 0

5. Highly Permissive Role Access in [DeXe](./DeXe00/)

   - report: https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf
   - reported_impact: "High"
   - reported_likelihood: "High"
   - cwe_classification: 284
   - vulnerability_class: "Access Control"
   - vulnerability_subclass: "Excessive Privilege"
   - vulnerable_functions:
     - `CoreProperties.sol::setDEXECommissionPercentages()` [vulnerable] (./DeXe00/contracts/core/CoreProperties.sol#90)
     - `CoreProperties.sol::setTraderCommissionPercentages()()` [vulnerable] (./DeXe00/contracts/core/CoreProperties.sol#102)
   - description: "The owner of the contract could change commissions at any period of time. The upper bound limit for the commission is not set up. This may lead to the manipulation of fees."
   - slither_output: []
   - slither_detect: 0

6. Highly Permissive Role Access in [DeXe](./DeXe00/)

   - report: https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf
   - reported_impact: "High"
   - reported_likelihood: "High"
   - cwe_classification: 284
   - vulnerability_class: "Access Control"
   - vulnerability_subclass: "Excessive Privilege"
   - vulnerable_functions: `ERC20Sale.sol::burn()` [vulnerable](./DeXe00/contracts/gov/ERC20/ERC20Sale.sol#90)
   - description: "The owner of the contract may burn any user funds"
   - slither_output: []
   - slither_detect: 0

7. Highly Permissive Role Access in [DeXe](./DeXe00/)

   - report: https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf
   - reported_impact: "High"
   - reported_likelihood: "High"
   - cwe_classification: 284
   - vulnerability_class: "Access Control"
   - vulnerability_subclass: "Excessive Privilege"
   - vulnerable_functions: `GovValidators.sol::changeBalances()` [vulnerable](./DeXe00/contracts/gov/validators/GovValidators.sol#135)
   - description: "The owner of the contract may change validators at any moment"
   - slither_output: []
   - slither_detect: 0

8. Highly Permissive Role Access in [DeXe](./DeXe00/)

   - report: https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf
   - reported_impact: "High"
   - reported_likelihood: "High"
   - cwe_classification: 284
   - vulnerability_class: "Access Control"
   - vulnerability_subclass: "Excessive Privilege"
   - vulnerable_functions: `Insurance.sol::setDependencies()` [vulnerable](./DeXe00/contracts/insurance/Insurance.sol#47)
   - description: "The injector is able to change the DeXe token address on the contract. This may lead to users being unable to withdraw their deposits and the injector may take control over the insurance pool."
   - slither_output: []
   - slither_detect: 0

   43. Coarse-grained Access Control; Data Inconsistency in [Neptune] (./Neptune00/).

   - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
   - reported_impact: "High",
   - reported_likelihood": "Medium",
   - cwe_classification": 284,
   - vulnerability_class: "Access Control",
   - vulnerability_subclass: "Excessive Privilege",
   - vulnerable_functions:
     - `LiquidityGaugePool.sol::setPool()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#45), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#73)
   - description: "The setPool function in the LiquidityGaugePool contract grants entities with the DEFAULT_ADMIN_ROLE extensive power to modify vital parameters of the \_poolInfo struct, including but not limited to stakingToken, veToken, and rewardToken. Unrestricted modifications can potentially lead to unauthorized alterations at any moment, posing severe risks like asset freezing, economic imbalances, and unintended reward manipulations. Furthermore, during the initialization of the LiquidityGaugePool.sol contract, the \_setPool function gets invoked for the first time without adequately checking its input values for invalid or default data. Given the importance of these variables to the contract's functionality, uninitialized or default values might introduce unpredictability and erratic behavior. ",
   - slither_output: []
   - slither_detect: 0

9. Denial Of Service; Highly Permissive Owner Access in [Neptune] (./Neptune00/).

   - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
   - reported_impact: "High",
   - reported_likelihood": "Medium",
   - cwe_classification": 284,
   - vulnerability_class: "Access Control",
   - vulnerability_subclass: "Excessive Privilege",
   - vulnerable_functions:
     - `LiquidityGaugePool.sol::setPool()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#45), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#73)
     - `LiquidityGaugePool.sol::withdrawRewards()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#136), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#164)
   - description: "The current implementation of the platform fee lacks constraints, permitting it to be set to any value, including values exceeding 100%. This oversight poses a critical risk as fees exceeding 100% would lead to a scenario where the system locks users' tokens. This will result in reversion with PlatformFeeTooHighError error and cause Denial of Service. Such lockups occur because the withdraw function will inevitably fail due to insufficient balances, causing the contract to be unable to return more than what users initially deposited",
   - slither_output: []
   - slither_detect: 0

10. Undocumented Functionality in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Medium",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excessive Privilege",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol::setPool()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#45), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#73)
    - description: "The DEFAULT_ADMIN_ROLE can alter vital parameters such as platformFee, veBoostRatio, veToken, registry address, key, name, and info. The implications and necessity of these changes are not documented, leading to potential unintended consequences. Adjustments to these settings can disrupt the normal operations of the platform. Changes, especially to parameters like veBoostRatio and veToken, can affect the rewards of the users. The platform fee mechanism, a crucial part of user interactions with the platform, remains unmentioned in the provided documentation.",
    - slither_output: []
    - slither_detect: 0

11. Highly Permissive Owner Access in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Medium",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excessive Privilege",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol::setPool()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#45), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#73)
    - description: "Entities with DEFAULT_ADMIN_ROLE permissions can modify crucial variables, such as stakingToken and rewardToken, even after users have made deposits into the pool.If the stakingToken is changed after deposits, users might become unable to withdraw their original staked assets. Changing the rewardToken might result in users receiving rewards in a token they did not anticipate or desire, potentially altering the economic value of their rewards.",
    - slither_output: []
    - slither_detect: 0

12. Highly Permissive Owner Access in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Medium",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excessive Privilege",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol::setPool()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#45), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#73)
    - description: "Entities possessing DEFAULT_ADMIN_ROLE permissions can change the lockupPeriodInBlocks, potentially trapping user funds by extending the withdrawal lockup period unexpectedly. An extension of lockupPeriodInBlocks could lead to users' funds being inaccessible for longer than anticipated, disrupting their financial plans. Users may lose trust in the platform due to unpredictable changes in withdrawal timelines.",
    - slither_output: []
    - slither_detect: 0

13. Unrestricted Token Recovery in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Medium",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excessive Privilege",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol::recoverToken()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#186), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#218)
    - description: "The Medium recoverToken function grants entities with the \_NS_ROLES_RECOVERY_AGENT role the power to withdraw any token from the contract. This includes critical tokens such as staking and reward tokens. Entities with the \_NS_ROLES_RECOVERY_AGENT role could potentially misuse this function to siphon off staking or reward tokens. This may result in financial losses for users and erode trust in the platform.",
    - slither_output: []
    - slither_detect: 0

14. Highly Permissive Owner Access in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "Medium",
    - cwe_classification": 285,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excessive Privilege",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol::exit()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#140), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#168)
      - `LiquidityGaugePool.sol::withdrawRewards()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#136), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#164)
      - `LiquidityGaugePool.sol::withdraw()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#109), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#141)
    - description: "The LiquidityGaugePool contract's pause functionality impacts not only deposits but also withdrawals, including both token withdrawals and reward withdrawals. Pausing withdrawals, especially in emergencies or uncertain situations, can raise panic and mistrust among users. It denies users access to their staked assets and earned rewards, potentially causing financial and reputational damage to the platform.",
    - slither_output: [
      "Reentrancy in LiquidityGaugePool.exit() (examples/neptune/gauge-pool/LiquidityGaugePool.sol#196-199): External calls: - \_withdraw(\_lockedByMe[_msgSender()]) (examples/neptune/gauge-pool/LiquidityGaugePool.sol#197) - returndata = address(token).functionCall(data,SafeERC20: low-level call failed) (node_modules/@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol#122) - (success,returndata) = target.call{value: value}(data) (node_modules/@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol#135) - IERC20Upgradeable(\_poolInfo.stakingToken).safeTransfer(\_msgSender(),amount) (examples/neptune/gauge-pool/LiquidityGaugePool.sol#137-140) - \_withdrawRewards() (examples/neptune/gauge-pool/LiquidityGaugePool.sol#198) - returndata = address(token).functionCall(data,SafeERC20: low-level call failed) (node_modules/@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol#122) etc"
      ]
    - slither_detect: 0

15. Unrestricted Authority to Alter Vesting Beneficiary Addresses in [Farcana] (./Farcana00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/01/Hacken_Farcana_SCA-Farcana_Token_Dec2024_P-2023-063_1_20240102-08_50.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Low",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excessive Privilege",
    - vulnerable_functions:
      - `FarcanaVesting.sol::changeBeneficiaryAddress()` [vulnerable](./Farcana00/vulnerable/smart-contracts/FarcanaVesting.sol#190), [patched](./Farcana00/patched/smart-contracts/FarcanaVesting.sol#190)
    - description: "The TokenVesting contract includes a function changeBeneficiaryAddress, which allows the contract owner to alter the beneficiary address of any vesting schedule. This function grants the owner unchecked power to transfer the claim rights of vested tokens from one address to another at any point, without any constraints or oversight mechanisms",
    - slither_output: [
      "Parameter TokenVesting.changeBeneficiaryAddress(address,address).lost_address (examples/Farcana00/FarcanaVesting.sol#153) is not in mixedCase",
      "Parameter TokenVesting.changeBeneficiaryAddress(address,address).new_address (examples/Farcana00/FarcanaVesting.sol#153) is not in mixedCase"
      ]
    - slither_detect: 0

16. Inappropriate Mutability of tgeTime in Vesting Contract in [Farcana] (./Farcana00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/01/Hacken_Farcana_SCA-Farcana_Token_Dec2024_P-2023-063_1_20240102-08_50.pdf),
    - reported_impact: "Low",
    - reported_likelihood": "Low",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excessive Privilege",
    - vulnerable_functions:
      - `FarcanaVesting.sol::tgeTime` [vulnerable](./Farcana00/vulnerable/smart-contracts/FarcanaVesting.sol#24), [patched](./Farcana00/patched/smart-contracts/FarcanaVesting.sol#23)
    - description: "The vesting contract initializes a tgeTime variable in its constructor and provides a setter function setTGEtime that allows the owner to modify this time. Given that tgeTime represents the Token Generation Event time, a fundamental contract parameter, its ability to be altered post-deployment poses a risk of misuse or errors. Although currently unused in calculations, if tgeTime is intended for future critical functionalities, its mutable nature could compromise the contract's integrity.",
    - slither_output: [
      "Parameter TokenVesting.setTGEtime(uint256).new_tge_time (examples/Farcana00/FarcanaToken.sol#34) is not in mixedCase",
      "TokenVesting.setTGEtime(uint256) (examples/Farcana00/FarcanaVesting.sol#34-36) should emit an event for: - tgetime = new_tge_time (examples/Farcana00/FarcanaVesting.sol#35) Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#missing-events-arithmetic"
      ]
    - slither_detect: 0

17. Unauthorized Access To Critical Functions in [ForeProtocol](./foreProtocol00/).

    - [report](./foreProtocol00/vulnerable/report.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "High",
    - cwe_classification": 285,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Authorization",
    - vulnerable_functions:
      - `BasicMarket.sol::withdrawVerificationReward()` [vulnerable](./foreProtocol00/vulnerable/contracts/contracts/protocol/markets/basic/BasicMarket.sol#305), [patched](./foreProtocol00/patched/contracts/contracts/contracts/protocol/markets/basic/BasicMarket.sol#368)
    - description: "The function lacks proper access controls, allowing any external party to dictate how verifier rewards are withdrawn. This design flaw can be exploited by a malicious actor to control the distribution of power between NFT verifiers, potentially gaining undue advantages in future markets.",
    - slither_output: [],
    - slither_detect: 0

18. Data Consistency in [litLab](./litLab00/)..

    - [report](./litLab00/vulnerable/report.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "Critical",
    - cwe_classification": 285,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Authorization",
    - vulnerable_functions:
      - `LITTAdvisorsTeam.sol::setListingDate()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol#L47), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L61)
    - description: "The listingDate function should only be callable once, but this check is not implemented. This allows it to be called multiple times and modified, which could enable undesired future transfers to other addresses.",
    - slither_output: ["LITTAdvisorsTeam.setListingDate(uint256) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol#51-53) should emit an event for:", "Parameter LITTAdvisorsTeam.setListingDate(uint256)._listingDate (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol#51) is not in mixedCase"]
    - slither_detect: 0

19. Data Consistency in [manilla](./manillaFinance-manilla-token00/).

    - [report](./manillaFinance-manilla-token00/Manilla_Finance_SC-Audit-Report_17_07_23_SA-1655.pdf),
    - reported_impact: "high",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Authorization",
    - vulnerable_functions:
      `Manilla.sol` [vulnerable](./manillaFinance-manilla-token00/vulnerable/manilla-token/contracts/manilla.sol), [patched](./manillaFinance-manilla-token00/patched/manilla-token/contracts/manilla.sol)
    - description: "The constructor mints tokens to a user-supplied address, adminAccount. This address can be different from the caller. This can lead to minting more tokens than intended"
    - slither_output: []
    - slither_detect: 0

20. Access Control Violation; Race Conditions in [DeXe](./DeXe00/)

    - report: https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf
    - reported_impact: "High"
    - reported_likelihood: "High"
    - cwe_classification: 284
    - vulnerability_class: "Access Control"
    - vulnerability_subclass: "Authorization"
    - vulnerable_functions:
      - `CoreProperties::setDependencies()` [vulnerable](./DeXe00/contracts/core/CoreProperties.sol#39),
      - `PriceFeed::setDependencies()` [vulnerable](./DeXe00/contracts/core/PriceFeed.sol#46),
      - `GovPool::setDependencies()` [vulnerable](./DeXe00/contracts/gov/GovPool.sol#134),
      - `Insurance::setDependencies()` [vulnerable](./DeXe00/contracts/insurance/Insurance.sol#47),
      - `BasicTraderPool::setDependencies()` [vulnerable](./DeXe00/contracts/trader/BasicTraderPool.sol#43),
      - `InvestTraderPool::setDependencies()` [vulnerable](./DeXe00/contracts/trader/InvestTraderPool.sol#46),
      - `TraderPool::setDependencies()` [vulnerable](./DeXe00/contracts/trader/TraderPool.sol#100),
      - `TraderPoolProposal::setDependencies()` [vulnerable](./DeXe00/contracts/trader/TraderPoolProposal.sol#96),
    - description: "Since, for the first time, the setter functions could be called by anyone, there is a risk of race conditions that may result in the inconsistent state of the contract. This may lead to access to critical state variables by an unauthorized user."
    - slither_output: []
    - slither_detect: 0

21. Overwritten rewards in [SnackClub](./SnackClub00/)

    - report: https://docs.google.com/document/d/1_fluL1Fpn5U1g7l5y3bu-UsamGG-jZRRvoDSQwJF4Dc/edit
    - reported_impact: "High"
    - reported_likelihood: "High"
    - cwe_classification: 284
    - vulnerability_class: "Access Control"
    - vulnerability_subclass: "Unprotected Funds Withdrawal"
    - vulnerable_functions:
      - `RoleControl.sol::storeReward()` [vulnerable](./SnackClub00/vulnerable/SnackClub/contracts/RewardControl.sol#28), [patched](./SnackClub00/vulnerable/SnackClub/contracts/RoleControl.sol#28)
      - `RoleControl.sol::storeRewards()` [vulnerable](./SnackClub00/vulnerable/SnackClub/contracts/RewardControl.sol#45), [patched](./SnackClub00/vulnerable/SnackClub/contracts/RoleControl.sol#51)
    - description: "An admin or operator may overwrite a reward with a new one by invoking the RewardControl.storeReward() or RewardControl.storeRewards() functions passing the same receiver and secret used in a previous reward. This may be used to replace a reward with another one with 0 amount, effectively removing it."
    - slither_output:
    - slither_detect:

22. Unprotected Funds Withdrawal in [SnackClub](./SnackClub00/)

    - report: https://docs.google.com/document/d/1_fluL1Fpn5U1g7l5y3bu-UsamGG-jZRRvoDSQwJF4Dc/edit
    - reported_impact: "High"
    - reported_likelihood: "High"
    - cwe_classification: 284
    - vulnerability_class: "Access Control"
    - vulnerability_subclass: "Unprotected Funds Withdrawal"
    - vulnerable_functions: `SnackclubTournamentsPayout.sol::withdraw()` [vulnerable](./SnackClub00/vulnerable/SnackClub/contracts/SnackclubTournamentsPayout.sol#36), [patched](./SnackClub00/vulnerable/SnackClub/contracts/SnackclubTournamentsPayout.sol#48)
    - description: "Any account may withdraw the funds handled by the SnackclubTournamentsPayout contract by invoking the withdraw() function."
    - slither_output: []
    - slither_detect: 0

23. Data Consistency in [ForeProtocol](./foreProtocol00/).

    - [report](./foreProtocol00/vulnerable/report.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "High",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Input Validation",
    - vulnerable_functions:
      - `ForeProtocol.sol::upgradeTier()` [vulnerable](./foreProtocol00/vulnerable/contracts/contracts/protocol/ForeProtocol.sol#L136), [patched](./foreProtocol00/patched/contracts/contracts/contracts/protocol/ForeProtocol.sol#L145)
    - description: "The function upgradeTier enables a user to upgrade their NFT tier if they meet the verificationsDone requirement. However, the function does not check if the tier they are upgrading to actually exists in the \_tiers mapping. As a result, a user might upgrade their NFT to a non-existent tier. If the owner later defines new tiers, this could result in data inconsistency where some users have upgraded to tiers they should not have been able to",
    - slither_output:
      ["Reentrancy in ForeProtocol.upgradeTier(uint256) (examples/ForeProtocol/contracts/protocol/ForeProtocol.sol#145-168)",
      "Event emitted after the call(s): UpgradeTier(id,minted,actualTier + 1,verificationsDone) (examples/ForeProtocol/contracts/protocol/ForeProtocol.sol#167)"
      ],
    - slither_detect: 0

24. Requirement Violation; Data Consistency in [ForeProtocol](./foreProtocol00/).

    - [report](./foreProtocol00/vulnerable/report.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Input Validation",
    - vulnerable_functions:
      - `ProtocolConfig.sol::editTier()` [vulnerable](./foreProtocol00/vulnerable/contracts/contracts/protocol/config/ProtocolConfig.sol#L181), [patched](./foreProtocol00/patched/contracts/contracts/contracts//protocol/config/ProtocolConfig.sol#L211)
    - description: "The editTier function lacks comprehensive checks to maintain the ordered and hierarchical structure of minVerifications and multipliers across tiers, potentially allowing for inconsistent tier configurations.There is a possibility of setting minVerifications for a tier to a value greater than its subsequent tier or lesser than its previous tier, leading to inconsistency in tier structuring",
    - slither_output: []
    - slither_detect: 0

25. Missing Validation in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "low",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Input Validation",
    - vulnerable_functions:
      `vGlobalMinter.sol::constructor()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vGlobalMinter.sol), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vGlobalMinter.sol)
    - description: "It is considered that the project should be consistent and contain no self-contradictions. Lack of validation of the \_emissionStartTs argument in vGlobalMinter.sol constructor(). Emission should not start in the past. emissionStartTs should be in the future. This may lead to unexpected value processed by the contract."
    - slither_output: []
    - slither_detect: 0

26. Data Consistency in [litLab](./litLab00/)..

    - [report](./litLab00/vulnerable/report.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "Critical",
    - cwe_classification": 0,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Validation",
    - vulnerable_functions:
      - `CyberTitansTournament.sol::startTournament()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L169), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L175)
    - description: "The function startTournament() incorrectly compares \_cttPlayers with LITTPlayers in the check: require(\_cttPlayers == tournament.numOfTokenPlayers, BadLITTPlayers) This will lead to incorrect data management since the checked variable is not the correct one. As a consequence, this function does not work as intended.",
    - slither_output: [
      "CyberTitansTournament.startTournament(uint256,uint24,uint24) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#250-263) compares to a boolean constant:",
      "Parameter CyberTitansTournament.startTournament(uint256,uint24,uint24)._id (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#251) is not in mixedCase"]
    - slither_detect: 0

27. Requirements Violation in [manilla](./manillaFinance-manilla-token00/).

    - [report](./manillaFinance-manilla-token00/Manilla_Finance_SC-Audit-Report_17_07_23_SA-1655.pdf),
    - reported_impact: "high",
    - cwe_classification": 0,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing validation",
    - vulnerable_functions:
      `Manilla.sol` [vulnerable](./manillaFinance-manilla-token00/vulnerable/manilla-token/contracts/manilla.sol), [patched](./manillaFinance-manilla-token00/patched/manilla-token/contracts/manilla.sol)
    - description: "The implementation of the system or function does not adhere to the high-level, broad system, technical, or functional requirements. The provided documentation states that the total token supply is 1 billion. However, the implementation has no limitation implemented to make sure this number is not exceeded. This can lead to minting more tokens than intended"
    - slither_output: []
    - slither_detect: 0

28. Reusable msg.value Allows Multiple Lot Creation with Single Payment in [Eesee](./Eesee00/)

    - report: https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf
    - reported_impact: High
    - reported_likelihood: High
    - cwe_classification: 703
    - vulnerability_class: "Validation"
    - vulnerability_subclass: "Missing Validation"
    - vulnerable_functions:
      - `Eesee.sol::createLots()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/marketplace/Eesee.sol#102), [patched](./Eesee00/patched/Eesee/contracts/marketplace/Eesee.sol#487)
      - `Eesee.sol::createLotsAndBuyTickets()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/marketplace/Eesee.sol#169), [patched](./Eesee00/patched/Eesee/contracts/marketplace/Eesee.sol#117)
    - description: "The multicall function does not account for the cumulative msg.value when processing multiple delegate calls to the createLots function."
    - slither_output: []
    - slither_detect: 0

    24. Premature Asset Claim in receiveAssets() Function due to Missing Closure Check in [Eesee](./Eesee00/)

    - report: https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf
    - reported_impact: "High"
    - reported_likelihood: "High"
    - cwe_classification: 703
    - vulnerability_class: "Validation"
    - vulnerability_subclass: "Missing Validation"
    - vulnerable_functions: `Eesee.sol::receiveAssets()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/marketplace/Eesee.sol#187), [patched](./Eesee00/patched/Eesee/contracts/marketplace/Eesee.sol#136)
    - description: "The receiveAssets function of the Eesee smart contract exhibits a logical flaw where it lacks the necessary validation to ensure that a lot is fully closed (i.e., all tickets were sold) before allowing assets to be claimed."
    - slither_output: []
    - slither_detect: 0

29. Data Consistency in [litLab](./litLab00/)..

    - [report](./litLab00/vulnerable/report.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 642,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Incorrect State Update",
    - vulnerable_functions:
      - `LITTAdvisorsTeam.sol::removeAdvisor()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol#L57), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L79)
    - description: "The listingDate function should only be callable once, but this check is not implemented. This allows it to be called multiple times and modified, which could enable undesired future transfers to other addresses.",
    - slither_output: ["Parameter LITTAdvisorsTeam.removeAdvisor(address)._wallet (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol#61) is not in mixedCase"]
    - slither_detect: 0

30. EIP Standard Violation: Missing Value Check in [Dexalot](./Dexalot00)

    - report: https://wp.hacken.io/wp-content/uploads/2023/11/Dexalot_SC-Audit-Report_24102023_SA-1803-2.pdf
    - reported_impact: "High"
    - reported_likelihood: "Low"
    - cwe_classification: 347
    - vulnerability_class: "Validation"
    - vulnerability_subclass: "Improper verification of signature"
    - vulnerable_functions:
      - `MainnetRFQ.sol::_recoverSigner()` [vulnerable](./Dexalot00/vulnerable/Dexalot/contracts/MainnetRFQ.sol#165), [patched](./Dexalot00/vulnerable/Dexalot/contracts/MainnetRFQ.sol#324)
    - description: "According to the EIP-1271 implementation, the s value in the signature verification process should be checked against an upper value. The function \_recoverSigner() does not implement an upper bound check for the variable s."
    - slither_output: [
      "MainnetRFQ._recoverSigner(bytes32,bytes) (examples/Dexalot/MainnetRFQ.sol#165-189) uses assembly"
      ]
    - slither_detect: 0

31. Missing Array Length Check in [Dexalot](./Dexalot00)

    - report: https://wp.hacken.io/wp-content/uploads/2023/11/Dexalot_SC-Audit-Report_24102023_SA-1803-2.pdf
    - reported_impact: "Low"
    - reported_likelihood: "Medium"
    - cwe_classification: 129
    - vulnerability_class: "Validation"
    - vulnerability_subclass: "Improper Validation of array index"
    - vulnerable_functions:
      - `MainnetRFQ.sol::batchClaimBalance()` [vulnerable](./Dexalot00/vulnerable/Dexalot/contracts/MainnetRFQ.sol#279), [patched](./Dexalot00/vulnerable/Dexalot/contracts/MainnetRFQ.sol#294)
    - description: "The function batchClaimBalance() lacks the array length equality checks, which will lead to unexpected behavior if the length of arrays is different."
    - slither_output: [
      "MainnetRFQ.batchClaimBalance(address[],uint256[]) (examples/Dexalot/MainnetRFQ.sol#484-503) sends eth to arbitrary user",
      "MainnetRFQ.batchClaimBalance(address[],uint256[]) (examples/Dexalot/MainnetRFQ.sol#484-503) has external calls inside a loop: (success,None) = address(msg.sender).call{value: \_amounts[i]}() (examples/Dexalot/MainnetRFQ.sol#493)",
      "Low level call in MainnetRFQ.batchClaimBalance(address[],uint256[]) (examples/Dexalot/MainnetRFQ.sol#484-503): - (success,None) = address(msg.sender).call{value: \_amounts[i]}() (examples/Dexalot/MainnetRFQ.sol#493)",
      "Parameter MainnetRFQ.batchClaimBalance(address[],uint256[]).\_assets (examples/Dexalot/MainnetRFQ.sol#485) is not in mixedCase",
      "Parameter MainnetRFQ.batchClaimBalance(address[],uint256[]).\_amounts (examples/Dexalot/MainnetRFQ.sol#486) is not in mixedCase"
      ]
    - slither_detect: 0

32. Inadequate msg.value Validation in createLots() Allows Multiple Lot Creation with Single Payment in [Eesee](./Eesee00/)

    - report: https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf
    - reported_impact: "High"
    - reported_likelihood: "High"
    - cwe_classification: 703
    - vulnerability_class: "Validation"
    - vulnerability_subclass: "Missing Validation"
    - vulnerable_functions: `Eesee.sol::createLots()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/marketplace/Eesee.sol#102), [patched](./Eesee00/patched/Eesee/contracts/marketplace/Eesee.sol#487)
    - description:"The createLots function iterates over an array of assets and corresponding params, creating lots based on these inputs. During this process, the function checks if msg.value is equal to the asset.amount for each iteration. Since msg.value remains constant throughout a transaction, this check should be cumulative to prevent the same msg.value from being counted multiple times"
    - slither_output: []
    - slither_detect: 0

33. Unverified Interaction in [DeXe](./DeXe00/)

    - report: https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf
    - reported_impact: "High"
    - reported_likelihood: "High"
    - cwe_classification: 703
    - vulnerability_class: "Validation"
    - vulnerability_subclass: "Missing Validation"
    - vulnerable_functions: `TraderPoolRiskyProposal.sol::invest()` [vulnerable] (./DeXe00/contracts/trader/TraderPoolRiskyProposal.sol#116)
    - description: "IIt is possible for a trader to implement and provide a token with the possibility to change decimals at any period in time. As the DeXe system relies on decimals during price calculation, internal logic may be corrupted"
    - slither_output: [
      "TraderPoolRiskyProposal.invest(uint256,address,uint256,uint256,uint256) (examples/DeXe/trader/TraderPoolRiskyProposal.sol#116-175)",
      "Reentrancy in TraderPoolRiskyProposal.exchange(uint256,address,uint256,uint256,address[],ITraderPoolRiskyProposal.ExchangeType) (examples/DeXe/trader/TraderPoolRiskyProposal.sol#201-266):
      External calls: - amountGot = priceFeed.normExchangeFromExact(from,to,amount,optionalPath,amountBound) (examples/DeXe/trader/TraderPoolRiskyProposal.sol#234-240) - amountGot = priceFeed.normExchangeToExact(from,to,amount,optionalPath,amountBound) (examples/DeXe/trader/TraderPoolRiskyProposal.sol#248)
      Event emitted after the call(s): - ProposalExchanged(proposalId,msg.sender,from,to,amount,amountGot) (examples/DeXe/trader/TraderPoolRiskyProposal.sol#253) - ProposalPositionClosed(proposalId,from) (examples/DeXe/trader/TraderPoolRiskyProposal.sol#263)"
      ]
    - slither_detect: 0

34. Invalid Calculations in [litLab](./litLab00/).

    - [report](./litLab00/vulnerable/report.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "Critical",
    - cwe_classification": 640,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "State Update Error",
    - vulnerable_functions:
      - `LitlabPreStakingBox.sol::withdrawRewards()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L100), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L103)
        `LitlabPreStakingBox`.sol::withdraw()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L115), [patched](./litLab00/pached/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L146),
    - description: "The withdraw function removes the staked tokens and, if certain conditions are met, also removes the rewards. The withdrawRewards function only claims the rewards. The issue here is that withdrawRewards() does not update the value of PendingRewards. If withdrawRewards is used before withdraw, the totalRewards value will not be accurately updated to reflect the changed PendingRewards value, potentially leading to claiming more than intended.",
    - slither_output: [
      "Reentrancy in LitlabPreStakingBox.withdraw() (examples/litLab/vulnerable/contract.sol#115-142)",
      "Reentrancy in LitlabPreStakingBox.withdrawRewards() (examples/litLab/vulnerable/contract.sol#100-112)",
      "LitlabPreStakingBox.withdrawRewards() (examples/litLab/vulnerable/contract.sol#100-112) uses timestamp for comparisons"
      ]
    - slither_detect: 0

35. Invalid Calculations in [litLab](./litLab00/)..

    - [report](./litLab00/vulnerable/report.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "Critical",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:
      - `LITTVestingContract.sol::_executeVesting()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#L185), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#L173)
    - description: "In the \_executeVesting() function, the tokensPerSecond value is being counted incorrectly. This is because the calculation does not take into account the portion of the tokens that are released on the TGE.This leads to situations in which tokens are released too quickly.",
    - slither_output: ["LITTVestingContract.\_executeVesting(LITTVestingContract.VestingType) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#174-205) performs a multiplication on the result of a division:
      - tokensPerSecond = data.\_amount / (end - start) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#195)
      - amountToWithdraw_scope_0 = (to - from) \* tokensPerSecond (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#197)", "LITTVestingContract.\_executeVesting(LITTVestingContract.VestingType) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#174-205) uses a dangerous strict equality:
      - (data.\_TGEPercentage > 0) && (withdrawnBalances[_vestingType] == 0) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#183)",LITTVestingContract.\_executeVesting(LITTVestingContract.VestingType) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#174-205) uses a dangerous strict equality:
      - lastWithdraw[_vestingType] == 0 (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#191-193) ]
      - slither_detect: 1

36. Invalid Calculations in [litLab](./litLab00/)..

    - [report](./litLab00/vulnerable/report.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "Critical",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:
      - `LitlabPreStakingBox.sol::_calculateVestingTokens()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L195), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L194)
    - description: "In the \_calculateVestingTokens() function, the tokensPerSecond value is being counted incorrectly. This is because the calculation does not take into account the portion of the tokens that can be released on the TGE.This leads to situations in which more tokens can be released than the vested amount. Users can wait the whole vesting period and call withdraw() first and withdrawInitial() afterward to extract 115% of the vested amount.",
    - slither_output: ["LitlabPreStakingBox.\_calculateVestingTokens(address) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#190-216) performs a multiplication on the result of a division:
      - tokensPerSec = amountMinusFirstWithdraw / vestingDays (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#202)
      - tokens = diffTime \* tokensPerSec (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#211)", "LitlabPreStakingBox.\_calculateVestingTokens(address) (examples/litLab/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#190-216) uses timestamp for comparisons"]
    - slither_detect: 1

37. Token Supply Manipulation in [virtuswap] (./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "high",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:
      `vGlobalMinter.sol::setEpochParams()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vGlobalMinter.sol#L125), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vGlobalMinter.sol)
      `vGlobalMinter::nextEpochTransfer()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vGlobalMinter.sol#L87), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vGlobalMinter.sol)
    - description: "Calling the setEpochParams() function with block.timestamp which makes the check block.timestamp >= startEpochTime + epochDuration pass will cause a partial lock of the rewards paid when calling nextEpochTransfer(). This is driven by the fact that \_epochTransition() is triggered and param startEpochTime used for reward calculation is forwarded to a new timestamp"
    - slither_output: ["vGlobalMinter.setEpochParams(uint256,uint256) (examples/virtusSwap/vGlobalMinter.sol#107-125) uses timestamp for comparisons"]
    - slither_detect: 1

38. Invalid Calculations in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "high",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:
      `vChainMinter.sol::_availableTokens()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vChainMinter.sol#L294), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vChainMinter.sol)
      `vChainMinter::_availableTokensForNextEpoch()` [vulnerable] (virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vChainMinter.sol#L308), [patched] (virtuswap-tokenomics00/patched/tokenomics/contracts/vChainMinter.sol)
    - description: "In the `_availableTokens()` and `_availableTokensForNextEpoch()` functions, calculations are done incorrectly.Both functions are not taking into account that calculations from the block.timestamp can be greater than the divisor in the function equations.This can lead to a situation where the amount of tokens calculated is greater than the actual amount of rewards provided if the prepareForNextEpoch() function is not used correctly.In the `_availableTokensForNextEpoch()` function, the `epochDuration` variable is used incorrectly in the dividend in case when the `nextEpochDuration > 0`."
    - slither_output: []
    - slither_detect: 0

39. Invalid Calculations in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "high",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:
      `vGlobalMinter.sol::nextEpochTransfer()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vGlobalMinter.sol#L87), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vGlobalMinter.sol)
    - description: "In the nextEpochTransfer() function, there is a flaw in the logic of the epoch transition. In case of calling the nextEpochTransfer() for the first time after the emissionStartTs, the rewards for epoch 0 will be locked inside the contract"
    - slither_output: ["vGlobalMinter.nextEpochTransfer() (examples/virtusSwap/vGlobalMinter.sol#87-104) uses timestamp for comparisons"]
    - slither_detect: 0

40. Front-Running Attack; Inflation Attack in [Diverse](./Diverse00/)..

    - [report](./Diverse00/vulnerable/report.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "High",
    - cwe_classification": 190,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Integer Overflow",
    - vulnerable_functions:
      - `"XARDMStaking.sol::deposit()` [vulnerable](./Diverse00/vulnerable/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#L76), [patched](./Diverse00/patched/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#L101)
    - description: "The vulnerability is related to a rounding issue in the deposit() function, as illustrated by the following equation: uint256 mintAmount = (\_amount • totalxARDM) / totalARDM; An attacker can manipulate the denominator and cause the victim to receive zero or a portion of the vault",
    - slither_output: ["XARDMStaking.deposit(uint256) (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#76-96) ignores return value by ARDM.transferFrom(msg.sender,address(this),\_amount) (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#91)", "XARDMStaking.deposit(uint256) (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#76-96) uses a dangerous strict equality:
      - totalxARDM == 0 || totalARDM == 0 (examples/Diverse00/vulnerable/FirstCommit/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol#83)"]
    - slither_detect: 0

41. Mishandled Edge Case in [Neptune](./neptune00/)..

    - [report](./neptune00/vulnerable/report.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 0,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Data inconsistency",
    - vulnerable_functions:
      - `"LiquidityGaugePool.sol::deposit()` [vulnerable](./neptune00/vulnerable/periphery/src/gauge-pool/LiquidityGaugePool.sol#L67), [patched](./neptune00/patched/periphery/src/gauge-pool/LiquidityGaugePool.sol#L99)
    - description: "The deposit function in the contract updates the \_lastDepositHeights for a user every time they deposit tokens. This mechanism unintentionally extends the withdrawal lockup period for users who make consecutive deposits. Users who want to top up their deposits or make regular contributions can inadvertently extend their lockup period. This could lead to a scenario where users might not be able to access their funds when needed, especially if they are unaware of this behavior",
    - slither_output: []
    - slither_detect: 0

42. Data Consistency in [sha2](./sha2-funnel-contracts00/).

    - [report](./sha2-funnel-contracts00/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "high",
    - cwe_classification": 0,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Data inconsistency",
    - vulnerable_functions:
      `Funnel.sol::allowance()` [vulerable](./sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol#L207), [patched](./sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol#L246),
      `Funnel.sol::transfer()` [vulerable](./sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol#L400), [patched](./sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol#L222),
      `Funnel.sol::transferFrom()` [vulerable](./sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol#L243), [patched](./sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol#L188),
    - description: "The approvals performed in the Funnel contract are not connected with the approvals done in the baseToken tokens. The EIP-5827 should check if it has enough allowance in baseToken in functions allowance(), transferFrom(), and transfer(). In situations where the allowance in baseToken is less than the allowance calculated by Funnel, there will be data inconsistency and denial of service in transfer functions."
    - slither_output: [
      "Funnel.transferFrom(address,address,uint256) (src/Funnel.sol#243-260) uses arbitrary from in transferFrom: _baseToken.safeTransferFrom(from,to,amount) (src/Funnel.sol#258)",
      ]
    - slither_detect: 0

43. Denial of Service; Fund Lock in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "high",
    - cwe_classification": 362,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Race condition",
    - vulnerable_functions:
      `vChainMinter.sol::setStakerFactory()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vChainMinter.sol#L91), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vChainMinter.sol)
    - description: "In the setStakerFactory() function, the stakerFactory variable can be changed even when the current vStakerFactory has active vStaker contracts with deposited user funds.In the event of changing the stakerFactory variable, users of the old vStaker contracts will not be able to claim their earned rewards. All calculations done in the vStaker contracts will be incorrect.Additionally, the setAllocationPoints() function will be affected, as the totalAllocationPoints variable will contain the old allocation points from the old vStakerFactory vStaker contracts.Changing the stakeFactory after it is set and in use will lead to an unusable staking system"
    - slither_output: ["vChainMinter.setStakerFactory(address)._newStakerFactory (examples/virtusSwap/vChainMinter.sol#92) lacks a zero-check",
      "Parameter vChainMinter.setStakerFactory(address)._newStakerFactory (examples/virtusSwap/vChainMinter.sol#92) is not in mixedCase"]
    - slither_detect: 0

44. Contradiction - Denial of Service in [DeXe](./DeXe00/)

    - report: https://wp.hacken.io/wp-content/uploads/2023/08/DeXe-Network_SC-Audit-Report_22052023SA-962.pdf
    - reported_impact: Medium
    - reported_likelihood: Medium
    - cwe_classification: 691
    - vulnerability_class: "Denial of Service"
    - vulnerability_subclass: "Insufficient Control Flow Management"
    - vulnerable_functions: `GovValidators.sol::onlyValidator()` [vulnerable](./DeXe00/contracts/gov/validators/GovValidators.sol:#43)
    - description: "The onlyValidator modifier uses current user balances to identify validators. However, voting is only possible for those who have balances at the moment of proposal creation. This may lead to an inability to reach a quorum on proposals due to some validators not passing the modifier."
    - slither_output: []
    - slither_detect: 0

45. Token Supply Manipulation in [virtuswap] (./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "high",
    - cwe_classification": 691,
    - vulnerability_class: "MEV",
    - vulnerability_subclass: ""Insufficient Control Flow Management"",
    - vulnerable_functions:
      `vGlobalMinter.sol::newVesting()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vGlobalMinter#L62) , [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vGlobalMinter)
      `vGlobalMinter::arbitraryTransfer()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vGlobalMinter), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vGlobalMinter)
    - description: "In the newVesting() and arbitraryTransfer() functions, the requirement to only release unlocked tokens is being executed incorrectly. The require(amount <= unlockedBalance) statement only checks that the amount is less than the unlockedBalance variable, but both functions should also reduce the remaining unlocked token balance.Lack of the unlockedBalance variable reduction can lead to a situation where more VRSW tokens are released than described in the tokenomy."
    - slither_output: ["Reentrancy in vGlobalMinter.newVesting(address,uint256,uint256,uint256) (examples/virtusSwap/vGlobalMinter.sol#55-74)"]
    - slither_detect: 0

46. Best Practice Violation - Lock of Native Tokens in [sha2](./sha2-funnel-contracts00/).

    - [report](./sha2-funnel-contracts00/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "medium",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Insufficient Control Flow Management",
    - vulnerable_functions: `NativeMetaTransaction.sol::executeMetaTransaction()` [vulnerable](./sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol#L0), [patched](./sha2-funnel-contracts00/patched/funnel-contracts/src/Funnel.sol#L0)
    - description: "It is considered following best practices to avoid unclear situations and prevent common attack vectors. The contract accepts native tokens in the executeMetaTransaction() payable function, but there are no mechanisms for withdrawals. This may lead to native coins being locked in the contract."
    - slither_output: []
    - slither_detect: 0

47. Lack of Emergency Withdrawal Mechanism in [Neptune] (./Neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "High",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Insufficient Control Flow Management",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol)
    - description: "The LiquidityGaugePool contract does not feature a mechanism for emergency withdrawals, excluding rewards. Users may be left unable to access their assets if issues arise with reward calculation. In the event of failures or unforeseen issues with the reward calculation (part of rewards calculation logic is in out-of-scope contracts), users would be unable to withdraw their primary deposited assets. This situation can lead to panic, potential financial losses for users, and erode trust in the platform.",
    - slither_output: []
    - slither_detect: 0

48. Inconsistent Usage of External Libraries in [sha2](./sha2-funnel-contracts00/).

    - [report](./sha2-funnel-contracts00/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "External Libraries",
    - vulnerable_functions: "",
    - description: "All contracts use OpenZeppelin external libraries heavily. However, the Funnel contract imports the solmate ERC20 and SafeTransferLib libraries. This is inconsistent with overall external library usage."
    - slither_output: []
    - slither_detect: 0

49. Unclear Use of the Virtual Specifier in [sha2](./sha2-funnel-contracts00/).

    - [report](./sha2-funnel-contracts00/SHA2_Labs_Pte._Ltd._SC-Audit-Report_03022023_SA-669.pdf),
    - reported_impact: "low",
    - cwe_classification": 0,
    - vulnerability_class: "Best Practices",
    - vulnerability_subclass: "Redundant Code",
    - vulnerable_functions:
      `Funnel.sol()` [vulerable](./sha2-funnel-contracts00/vulnerable/funnel-contracts/src/Funnel.sol), [patched](),
    - description: "There are functions in the contracts that are declared with the virtual specifier. These functions are not expected to be overridden, so the use of the virtual specifier is redundant."
    - slither_output: []
    - slither_detect: 0

50. Unsafe Approval in [Dexalot](./Dexalot00)

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Dexalot_SC-Audit-Report_24102023_SA-1803-2.pdf),
    - reported_impact: "High"
    - reported_likelihood: "High"
    - cwe_classification: 0
    - vulnerability_class: "Best practices"
    - vulnerability_subclass: "Unsafe Approval"
    - vulnerable_functions:
      - `MainnetRFQ.sol::_executeSwap()` [vulnerable](./Dexalot00/vulnerable/Dexalot/contracts/MainnetRFQ.sol#275), [patched](./Dexalot00/vulnerable/Dexalot/contracts/MainnetRFQ.sol#416)
    - description: The contract MainnetRFQ uses the approve() function inside of the \_executeSwap(), which does not update the allowance, but replaces it. This creates a problem when a taker, which is a smart-contract, makes several swaps, and does not withdraw the previous approval.
    - slither_output: []
    - slither_detect: 0

51. Fixed Fee Calculation in EeseeRaribleRouter Incompatible with Rarible's Dynamic Fee Structure in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "High",
    - cwe_classification": 573,
    - vulnerability_class: "Logic Flaw",
    - vulnerability_subclass: "",
    - vulnerable_functions:
      - `EeseeRaribleRouter::purchaseAsset()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/periphery/routers/EeseeRaribleRouter.sol#36), [patched](./Eesee00/patched/Eesee/contracts/periphery/routers/EeseeRaribleRouter.sol#58)
    - description: "The function purchaseAsset is designed to interact with the Rarible marketplace for buying NFTs. However, this fixed fee calculation is incompatible with Rarible's dynamic fee structure",
    - slither_output: [ "EeseeRaribleRouter.purchaseAsset(bytes,address) (contracts/periphery/routers/EeseeRaribleRouter.sol#36-61) sends eth to arbitrary user Dangerous calls: - exchangeV2Core.directPurchase{value: spent}(purchase) (contracts/periphery/routers/EeseeRaribleRouter.sol#43)", "Low level call in EeseeRaribleRouter.purchaseAsset(bytes,address) (contracts/periphery/routers/EeseeRaribleRouter.sol#36-61): - (success,None) = msg.sender.call{value: msg.value - spent}() (contracts/periphery/routers/EeseeRaribleRouter.sol#47)"
      ]
    - slither_detect: 0

52. Front-Running and Indiscriminate Lock-Up Extensions Due to Untracked Deposit Durations in Staking Contract in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Medium",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excesive Privilege",
    - vulnerable_functions: ["EeseeStaking::deposit()", "EeseeStaking::changeDuration()"]
      - `EeseeStaking::deposit()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/rewards/EeseeStaking.sol#86), [patched](./Eesee00/patched/Eesee/contracts/rewards/EeseeStaking.sol#89)
      - `EeseeStaking::changeDuration()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/rewards/EeseeStaking.sol#326), [patched](./Eesee00/patched/Eesee/contracts/rewards/EeseeStaking.sol#291)
    - description: "There are no safeguards in place to prevent the admin from changing the duration while deposit transactions are pending, which can lead to unexpected lock-up times for users.",
    - slither_output: [
      "Reentrancy in EeseeStaking.deposit(bool,uint96,bytes) (contracts/rewards/EeseeStaking.sol#86-120): External calls: - IERC20Permit(address(_ESE)).permit(msgSender,address(this),approveAmount,deadline,v,r,s) (contracts/rewards/EeseeStaking.sol#91) - ESE.safeTransferFrom(msgSender,address(this),amount) (contracts/rewards/EeseeStaking.sol#108) State variables written after the call(s): - user.unlockTime etc",
      "Reentrancy in EeseeStaking.deposit(bool,uint96,bytes) (contracts/rewards/EeseeStaking.sol#86-120): External calls: - IERC20Permit(address(_ESE)).permit(msgSender,address(this),approveAmount,deadline,v,r,s) (contracts/rewards/EeseeStaking.sol#91) State variables written after the call(s): - _updatePool(isLocked,_tier) (contracts/rewards/EeseeStaking.sol#95) etc Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-2",
      "Reentrancy in EeseeStaking.deposit(bool,uint96,bytes) (contracts/rewards/EeseeStaking.sol#86-120): External calls: - IERC20Permit(address(_ESE)).permit(msgSender,address(this),approveAmount,deadline,v,r,s) (contracts/rewards/EeseeStaking.sol#91) - ESE.safeTransferFrom(msgSender,address(this),amount) (contracts/rewards/EeseeStaking.sol#108) Event emitted after the call(s): - DepositFlexible(msgSender,amount) (contracts/rewards/EeseeStaking.sol#115) - DepositLocked(msgSender,amount,unlockTime) (contracts/rewards/EeseeStaking.sol#113) Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-3",
      "Parameter EeseeStaking.changeDuration(uint64)._duration (contracts/rewards/EeseeStaking.sol#326) is not in mixedCase"
      ]
    - slither_detect: 0

53. Zero Reward Rate Setting in updateRewardRates() Function Can Nullify Staking Yields in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Low",
    - cwe_classification": 20,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Input Validation",
    - vulnerable_functions:
      - `EeseeStaking::updateRewardRates()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/rewards/EeseeStaking.sol#291), [patched](./Eesee00/patched/Eesee/contracts/rewards/EeseeStaking.sol#248)
    - description: "Although the function validates the length of the arrays and the progression of rates, it does not prevent setting a rate to zero, which can halt the reward accumulation process",
    - slither_output: [ "EeseeStaking.updateRewardRates(uint64[],uint64[]) (contracts/rewards/EeseeStaking.sol#291-319) uses a Boolean constant improperly: -tierData[i_scope_0].rewardRate[false] = rewardRatesFlexible[i_scope_0] (contracts/rewards/EeseeStaking.sol#313)",
      "EeseeStaking.updateRewardRates(uint64[],uint64[]) (contracts/rewards/EeseeStaking.sol#291-319) uses a Boolean constant improperly: -tierData[i_scope_0].rewardRate[true] = rewardRatesLocked[i_scope_0] (contracts/rewards/EeseeStaking.sol#314 Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#misuse-of-a-boolean-constant)"
      ]
    - slither_detect: 0

54. ESE Token Supply Cap Inconsistency with Tokenomics in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Low",
    - cwe_classification": 1068,
    - vulnerability_class: "Logic Flaw",
    - vulnerability_subclass: "Documentation",
    - vulnerable_functions:
      - `ESE::addVestingBeneficiaries()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/token/ESE.sol#87), [patched](./Eesee00/patched/Eesee/contracts/token/ESE.sol#89)
    - description: "the function's current logic only checks for overflow against the maximum value of a uint96 data type, rather than adhering to the tokenomic's specified cap of 1 billion tokens.",
    - slither_output: [ "ESE.addVestingBeneficiaries(uint256,ESE.Beneficiary[]) (contracts/token/ESE.sol#87-115) uses timestamp for comparisons Dangerous comparisons: - super.totalSupply() + \_totalVesting > type()(uint96).max (contracts/token/ESE.sol#114)"
      ]
    - slither_detect: 0

55. Immutable callbackGasLimit in Chainlink VRF Consumer Restricts Adaptability to Gas Fluctuations in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Low",
    - cwe_classification": 410,
    - vulnerability_class: "Gas Usage",
    - vulnerability_subclass: "Insufficient Resource Pool",
    - vulnerable_functions:
      - `EeseeRandom::callbackGasLimit` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/random/EeseeRandom.sol#35), [patched](./Eesee00/patched/Eesee/contracts/random/EeseeRandom.sol#32)
    - description: "The immutable private variable callbackGasLimit that sets the Gas limit for Chainlink VRF callbacks restricts the contract ability to adapt to fluctuating Gas prices on the Ethereum network.",
    - slither_output: []
    - slither_detect: 0

56. Immutable Payee Information in EeseeFeeSplitter Contract May Lead to Funds Misallocation in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "Low",
    - cwe_classification": 640,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Logic Flaw",
    - vulnerable_functions:
      - `EeseeFeeSplitter::*` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/admin/EeseeFeeSplitter.sol), [patched](./Eesee00/patched/Eesee/contracts/EeseeFeeSplitter.sol)
    - description: "the contract lacks the functionality to update payee information post-deployment. This immutability can lead to a scenario where funds become locked or misallocated due to changes in business structure or payee addresses",
    - slither_output: []
    - slither_detect: 0

57. Absence of Pausable Mechanisms in Eesee Contracts Risks Uncontrolled Exposure to External Vulnerabilities in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "Low",
    - reported_likelihood": "Medium",
    - cwe_classification": 703,
    - vulnerability_class: "Logic Flaw",
    - vulnerability_subclass: "Improper Check or Handling of Exceptional Conditions",
    - vulnerable_functions:
      - `EeseeOpenseaRouter::*` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/periphery/routers/EeseeOpesearouter.sol), [patched](./Eesee00/patched/Eesee/contracts/periphery/routers/EeseeOpesearouter.sol)
      - `EeseeRaribleRouter::*` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/periphery/routers/EeseeRaribleRouter.sol), [patched](./Eesee00/patched/Eesee/contracts/periphery/routers/EeseeRaribleRouter.sol)
      - `EeseePeriphery::*` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/periphery/EeseePeriphery.sol), [patched](./Eesee00/patched/Eesee/contracts/periphery/EeseePeriphery.sol)
      - `EeseeSwap::*` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/periphery/EeseeSwap.sol), [patched](./Eesee00/patched/Eesee/contracts/periphery/EeseeSwap.sol)
    - description: "The Eesee ecosystem lacks emergency halting mechanisms or circuit breakers. In the absence of such controls, the inability to pause operations in response to detected vulnerabilities or external protocol upgrades can lead to exploitation",
    - slither_output: []
    - slither_detect: 0

58. Potential Front-Run with changeFee() for Eesee.sol and EeseeDrops.sol in [Eesee](./Eesee00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2024/02/Eesee_SC-Audit-Report_02022024_SA-2010.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "Low",
    - cwe_classification": 362,
    - vulnerability_class: "Logic Flaw",
    - vulnerability_subclass: "Race Condition",
    - vulnerable_functions:
      - `Eesee::changeFee()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/marketplace/Eesee.sol#637), [patched](./Eesee00/vulnerable/Eesee/contracts/marketplace/Eesee.sol#397)
      - `EeseeDrops::changeFee()` [vulnerable](./Eesee00/vulnerable/Eesee/contracts/marketplace/EeseeDrops.sol#216), [patched](./Eesee00/vulnerable/Eesee/contracts/marketplace/EeseeDrops.sol#181)
    - description: "If an admin transaction that calls changeFee is included in a block before a user transaction that calls listDrop or createLots, the user could end up paying a different fee than expected",
    - slither_output: ["Error: Stack too deep"]
    - slither_detect: 0

59. Mishandled Edge Case; Data Consistency in [ForeProtocol](./foreProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/ForeProtocol_SC-Audit-ReportSA-1667_update-1.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "Critical",
    - cwe_classification": 703,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Validation",
    - vulnerable_functions:
      - `MarketLib::_isVerified()` [vulnerable](./foreProtocol00/vulnerable/contracts/contracts/protocol/markets/basic/library/MarketLib.sol#L75), [patched](./foreProtocol00/patched/contracts/contracts/protocol/markets/basic/library/MarketLib.sol)
    - description: "In the prediction market verification system, the market is considered `verified` if the verified amount of the major side is equal to the total amount of the minor side. This method can be easily manipulated, especially when there is a significant difference between the sides. It can lead to a loss of confidence in the fairness of the prediction market, economic misalignment, and the potential for manipulation.",
    - slither_output: []
    - slither_detect: 0

60. Denial of Service Vulnerability; Invalid Calculations in [ForeProtocol](./foreProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/ForeProtocol_SC-Audit-ReportSA-1667_update-1.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "High",
    - cwe_classification": 682,
    - vulnerability_class: "Arithmetic",
    - vulnerability_subclass: "Incorrect Calculation",
    - vulnerable_functions:
      - `BasicMarket::withdrawVerificationReward()` [vulnerable](./foreProtocol00/vulnerable/contracts/contracts/protocol/markets/basic/BasicMarket.sol#L305), [patched](./foreProtocol00/patched/contracts/contracts/protocol/markets/basic/library/MarketLib.sol)
    - description: "In cases where a verifier votes for the wrong side and is therefore eligible for a penalty, the function designed to calculate the amounts of toDisputeCreator and toHighGuard incorrectly uses the multipliedPowerOf function instead of the powerOf function to calculate the amounts to transfer. This discrepancy becomes pronounced in scenarios where the NFT ID multiplier exceeds 100%. This difference can cause a denial of service (DoS) on the line: foreVerifiers.marketBurn(power • toDisputeCreator • toHighGuard).",
    - slither_output: []
    - slither_detect: 0

61. Coarse-Grained Access Control in [ForeProtocol](./foreProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/ForeProtocol_SC-Audit-ReportSA-1667_update-1.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "High",
    - cwe_classification": 285,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Authorization",
    - vulnerable_functions:
      - `ForeVerifiers::isApprovedForAll(), _transfer` [vulnerable](./foreProtocol00/vulnerable/contracts/contracts/verifiers/ForeVerifiers.sol), [patched](./foreProtocol00/patched/contracts/contracts/verifiers/ForeVerifiers.sol),
    - description: "The project's design gives sole privilege to the highGuard address to resolve disputes. While the protocolConfig contract's owner can change the highGuard, the exclusive reliance on a single address poses significant security risks. If control over the highGuard private key is compromised, an attacker could manipulate prediction market results for their advantage. An attacker with control over the highGuard address could unilaterally resolve disputes in their favor, potentially manipulating market outcomes and compromising the integrity of the entire system",
    - slither_output: []
    - slither_detect: 0

62. Denial of Service Vulnerability in [ForeProtocol](./foreProtocol00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/12/ForeProtocol_SC-Audit-ReportSA-1667_update-1.pdf),
    - reported_impact: "Critical",
    - reported_likelihood": "High",
    - cwe_classification": 400,
    - vulnerability_class: "Denial of Service",
    - vulnerability_subclass: "Unauthorized or Excessive Resource Claim",
    - vulnerable_functions:
      - `BasicMarket::withdrawVerificationReward()` [vulnerable](./foreProtocol00/vulnerable/contracts/contracts/protocol/markets/basic/BasicMarket.sol#L305), [patched](./foreProtocol00/patched/contracts/contracts/protocol/markets/basic/BasicMarket.sol#L305)
    - description: "The withdrawVerificationReward function tries to execute transfers and burns using the foreVerifiers contract's tokens, but the foreVerifiers contract lacks the ability to grant allowances, resulting in denial-of-service (DoS) vulnerabilities. Key platform functionalities can become paralyzed due to this oversight, leading to operational disruptions.",
    - slither_output: []
    - slither_detect: 0

63. Denial of Service Vulnerability in [LitLab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 703,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Missing Validation",
    - vulnerable_functions:
      - `LitlabPreStakingBox.sol::stake()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol#L57), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol)
    - description: "The function stake() should be called after the deployment of the contract only once. However, there is no check that makes sure that this is the case.Additionally, the stake() function can be called after the end of staking date, which leads to the fact that rewards can be received instantly.",
    - slither_output: []
    - slither_detect: 0

64. Denial of Service Vulnerability in [LitLab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 824,
    - vulnerability_class: "State Management",
    - vulnerability_subclass: "Invalid State",
    - vulnerable_functions:
      - `CyberTitansTournament.sol::finalizeTournament()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol.sol#L177), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol#L86)
    - description: "In the finalizeTournament() function, there is no check to prevent finalizing an already finalized tournament. This can lead to a situation where rewards are being paid multiple times for the same tournament",
    - slither_output: []
    - slither_detect: 0

65. Requirements Violation in [LitLab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 285,
    - vulnerability_class: "Validation",
    - vulnerability_subclass: "Input Validation Error",
    - vulnerable_functions:
      - `LITTVestingContract.sol::_executeVesting()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#L151), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/vesting/LITTVestingContract.sol#L151)
    - description: "In the \_executeVesting() function, there is an invalid validation that prevents users from claiming TGE tokens before the cliff time. require(block.timestamp >= listing_date + (data.\_cliffMonths \* 30 days), 'TooEarly'); This leads to a situation where the TGE tokens will not be claimable at the listing date.",
    - slither_output: []
    - slither_detect: 0

66. Data Consistency in [LitLab](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 670,
    - vulnerability_class: "State Management",
    - vulnerability_subclass: "Invalid State",
    - vulnerable_functions:
      - `LitlabPreStakingBox.sol::withdraw()` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol)
    - description: "During the withdrawInitial() function execution data used in rewards calculation is not updated. Resulting in a situation where users who did not withdraw their TGE tokens are rewarded equally as those who had withdrawn.",
    - slither_output: []
    - slither_detect: 0

67. Unrestricted Token Recovery in [Neptune](./litLab00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/05/LitLab_Games_SC-Audit-Report_05052023_SA-1078-1-1.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "Medium",
    - cwe_classification": 352,
    - vulnerability_class: "Event Emission",
    - vulnerability_subclass: "Missing Critical Events",
    - vulnerable_functions:
      - `CyberTitansGame.sol` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansGame.sol)
      - `CyberTitansTournament.sol` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/game/CyberTitansTournament.sol)
      - `LitlabPreStakingBox.sol` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol)
      - `LITTAdvisorsTeam.sol` [vulnerable](./litLab00/vulnerable/LitLabGames/smartcontracts/contracts/vesting/LITTAdvisorsTeam.sol), [patched](./litLab00/patched/LitLabGames/smartcontracts/contracts/staking/LitlabPreStakingBox.sol)
    - description: "The following functions do not emit relevant events after executing the sensitive actions of setting the fundingRate, updateTime and proposalTime, and transferring the rewards.",
    - slither_output: []
    - slither_detect: 0

68. Unrestricted Token Recovery in [Neptune] (./neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "High",
    - reported_likelihood": "Medium",
    - cwe_classification": 284,
    - vulnerability_class: "Access Control",
    - vulnerability_subclass: "Excessive Privilege",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol::recoverToken()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#45), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol#73)
    - description: "The Medium recoverToken function grants entities with the \_NS_ROLES_RECOVERY_AGENT role the power to withdraw any token from the contract. This includes critical tokens such as staking and reward tokens. Entities with the \_NS_ROLES_RECOVERY_AGENT role could potentially misuse this function to siphon off staking or reward tokens. This may result in financial losses for users and erode trust in the platform.",
    - slither_output: []
    - slither_detect: 0

69. Race Condition in [Neptune] (./neptune00/).

    - [report](https://wp.hacken.io/wp-content/uploads/2023/11/Neptune_Mutual_SC-Audit-Report_23102023_SA-1834.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "Low",
    - cwe_classification": 362,
    - vulnerability_class: "Denial of Serive",
    - vulnerability_subclass: "Race condition",
    - vulnerable_functions:
      - `LiquidityGaugePool.sol::withdrawRewards(),exit()()` [vulnerable](./Neptune00/vulnerable/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol), [patched](./Neptune00/patched/Neptune/periphery/src/gauge-pool/LiquidityGaugePool.sol)
    - description: "The \_withdrawRewards function calculates the platformFee based on the current state of the \_poolInfo.platformFee variable. Given the dynamic nature of blockchain states, it is possible that the platformFee variable could be changed by an admin between when a user initiates a transaction and when it gets mined, leading to unexpected fee deductions. A user intending to withdraw their rewards may be subjected to a different platform fee than anticipated. This can result in unexpected deductions, which could erode user trust in the system and lead to potential financial loss for the user",
    - slither_output: []
    - slither_detect: 0

70. Unauthorized Access in [virtuswap](./virtuswap-tokenomics00/).

    - [report](./virtuswap-tokenomics00/audit-report.pdf),
    - reported_impact: "Low",
    - reported_likelihood": "Low",
    - cwe_classification": 284,
    - vulnerability_class: "Access control",
    - vulnerability_subclass: "Authorization",
    - vulnerable_functions:
      - `vVestingWallet.sol::release()` [vulnerable](virtuswap-tokenomics00/vulnerable/tokenomics/contracts/vVestingWallet.sol#L81), [patched](virtuswap-tokenomics00/patched/tokenomics/contracts/vVestingWallet.sol)
    - description: "The release() function can be called by anyone, allowing external users to release tokens on behalf of the beneficiary",
    - slither_output: []
    - slither_detect: 0

71. Requirements Violation; Race Condition [Diverse](./Diverse00/)..

    - [report](./Diverse00/vulnerable/report.pdf),
    - reported_impact: "High",
    - reported_likelihood": "High",
    - cwe_classification": 367,
    - vulnerability_class: "Denial of Serive",
    - vulnerability_subclass: "Race Condition",
    - vulnerable_functions:
      - `"XARDMStaking.sol::deposit(), withdraw()` [vulnerable](./Diverse00/vulnerable/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol), [patched](./Diverse00/patched/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol)
    - description: "User deadlines are not modified when they make a deposit, as long as the deadline to pay the penalty has not yet arrived, and new deposits made are recorded to be processed with the same deadline. Users can wait until the last stage of the deadline by depositing a very small amount of tokens and then deposit the desired amount at the last minute to collect their rewards a few minutes later.",
    - slither_output: []
    - slither_detect: 0

72. Highly Permissive Role Access [Diverse](./Diverse00/)..

    - [report](./Diverse00/vulnerable/report.pdf),
    - reported_impact: "Medium",
    - reported_likelihood": "High",
    - cwe_classification": 284,
    - vulnerability_class: "Authorization",
    - vulnerability_subclass: "Excesive Privilege",
    - vulnerable_functions:
      - `"XARDMStaking.sol::pause(), unpause()` [vulnerable](./Diverse00/vulnerable/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol), [patched](./Diverse00/patched/ardmoney-sARDM-staking-contract/contracts/XARDMStaking.sol)
    - description: "Highly Permissive Role Access Account with PAUSER_ROLE can pause the transferability of the XARDM token. This leads to a situation where the deposit() and withdrawal() functions of the XARDMStaking contract are affected by a denial of service vulnerability. As both systems are closely connected and there is functionality to pause deposits and withdrawals directly in XARDMStaking, the pausable nature of the XARDM token seems redundant",
    - slither_output: []
    - slither_detect: 0
