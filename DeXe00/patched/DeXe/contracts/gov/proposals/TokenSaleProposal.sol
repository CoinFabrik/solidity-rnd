// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "@dlsl/dev-modules/libs/decimals/DecimalsConverter.sol";

import "../../interfaces/gov/proposals/ITokenSaleProposal.sol";

import "../../libs/math/MathHelper.sol";

import "../../core/Globals.sol";

contract TokenSaleProposal is ITokenSaleProposal, ERC1155SupplyUpgradeable {
    using MathHelper for uint256;
    using Math for uint256;
    using SafeERC20 for ERC20;
    using DecimalsConverter for uint256;

    address public govAddress;

    uint256 public override latestTierId;

    mapping(uint256 => Tier) internal _tiers;

    event TierCreated(uint256 tierId, address saleToken);
    event Bought(uint256 tierId, address buyer);
    event Whitelisted(uint256 tierId, address user);

    modifier onlyGov() {
        _onlyGov();
        _;
    }

    modifier ifTierExists(uint256 tierId) {
        require(
            _tiers[tierId].tierView.saleTokenAddress != address(0),
            "TSP: tier does not exist"
        );
        _;
    }

    modifier ifTierIsNotOff(uint256 tierId) {
        require(!_tiers[tierId].tierInfo.tierInfoView.isOff, "TSP: tier is off");
        _;
    }

    function __TokenSaleProposal_init(address _govAddress) external initializer {
        require(_govAddress != address(0), "TSP: zero gov address");

        govAddress = _govAddress;
    }

    function createTiers(TierView[] calldata tiers) external override onlyGov {
        for (uint256 i = 0; i < tiers.length; i++) {
            _createTier(tiers[i]);
        }
    }

    function addToWhitelist(WhitelistingRequest[] calldata requests) external override onlyGov {
        for (uint256 i = 0; i < requests.length; i++) {
            _addToWhitelist(requests[i]);
        }
    }

    function offTiers(uint256[] calldata tierIds) external override onlyGov {
        for (uint256 i = 0; i < tierIds.length; i++) {
            _offTier(tierIds[i]);
        }
    }

    function recover(uint256[] calldata tierIds) external onlyGov {
        for (uint256 i = 0; i < tierIds.length; i++) {
            uint256 recoveringAmount = _getRecoverAmount(tierIds[i]);

            require(recoveringAmount > 0, "TSP: zero recovery");

            Tier storage tier = _tiers[tierIds[i]];

            tier.tierInfo.tierInfoView.totalSold += recoveringAmount;

            address saleTokenAddress = tier.tierView.saleTokenAddress;
            ERC20(saleTokenAddress).safeTransfer(
                msg.sender,
                recoveringAmount.from18(ERC20(saleTokenAddress).decimals())
            );
        }
    }

    function vestingWithdraw(uint256[] calldata tierIds) external override {
        for (uint256 i = 0; i < tierIds.length; i++) {
            uint256 vestingWithdrawAmount = _getVestingWithdrawAmount(msg.sender, tierIds[i]);
            require(vestingWithdrawAmount > 0, "TSP: zero withdrawal");

            Tier storage tier = _tiers[tierIds[i]];
            Purchase storage purchase = tier.tierInfo.customers[msg.sender];

            purchase.latestVestingWithdraw = uint64(block.timestamp);
            purchase.vestingWithdrawnAmount += vestingWithdrawAmount;

            address saleTokenAddress = tier.tierView.saleTokenAddress;
            ERC20(saleTokenAddress).safeTransfer(
                msg.sender,
                vestingWithdrawAmount.from18(ERC20(saleTokenAddress).decimals())
            );
        }
    }

    function buy(uint256 tierId, address tokenToBuyWith, uint256 amount) external payable {
        bool isNativeCurrency = tokenToBuyWith == ETHEREUM_ADDRESS;
        uint256 saleTokenAmount = getSaleTokenAmount(
            msg.sender,
            tierId,
            tokenToBuyWith,
            isNativeCurrency ? msg.value : amount
        );

        Tier storage tier = _tiers[tierId];
        TierInfo storage tierInfo = tier.tierInfo;

        TierView memory tierView = tier.tierView;

        uint256 vestingTotalAmount = saleTokenAmount.percentage(
            tierView.vestingSettings.vestingPercentage
        );
        ERC20(tierView.saleTokenAddress).safeTransfer(
            msg.sender,
            (saleTokenAmount - vestingTotalAmount).from18(
                ERC20(tierView.saleTokenAddress).decimals()
            )
        );

        tierInfo.tierInfoView.totalSold += saleTokenAmount;

        tierInfo.customers[msg.sender] = Purchase({
            purchaseTime: uint64(block.timestamp),
            latestVestingWithdraw: 0,
            tokenBoughtWith: tokenToBuyWith,
            amountBought: saleTokenAmount,
            vestingTotalAmount: vestingTotalAmount,
            vestingWithdrawnAmount: 0
        });

        if (isNativeCurrency) {
            (bool success, ) = govAddress.call{value: msg.value}("");
            require(success, "TSP: failed to transfer ether");
        } else {
            ERC20(tokenToBuyWith).safeTransferFrom(
                msg.sender,
                govAddress,
                amount.from18(ERC20(tokenToBuyWith).decimals())
            );
        }

        emit Bought(tierId, msg.sender);
    }

    function getSaleTokenAmount(
        address user,
        uint256 tierId,
        address tokenToBuyWith,
        uint256 amount
    ) public view ifTierExists(tierId) ifTierIsNotOff(tierId) returns (uint256) {
        require(amount > 0, "TSP: zero amount");
        require(_canParticipate(user, tierId), "TSP: not whitelisted");

        Tier storage tier = _tiers[tierId];
        TierInfo storage tierInfo = tier.tierInfo;

        TierView memory tierView = tier.tierView;

        require(
            tierView.saleStartTime <= block.timestamp && block.timestamp <= tierView.saleEndTime,
            "TSP: cannot buy now"
        );
        require(tierInfo.customers[user].purchaseTime == 0, "TSP: cannot buy twice");

        uint256 exchangeRate = tierInfo.rates[tokenToBuyWith];
        uint256 saleTokenAmount = amount.ratio(exchangeRate, PRECISION);

        require(exchangeRate != 0, "TSP: incorrect token");
        require(
            tierView.maxAllocationPerUser == 0 ||
                (tierView.minAllocationPerUser <= saleTokenAmount &&
                    saleTokenAmount <= tierView.maxAllocationPerUser),
            "TSP: wrong allocation"
        );
        require(
            tierInfo.tierInfoView.totalSold + saleTokenAmount <= tierView.totalTokenProvided,
            "TSP: insufficient sale token amount"
        );
        require(
            ERC20(tierView.saleTokenAddress).balanceOf(address(this)).to18(
                ERC20(tierView.saleTokenAddress).decimals()
            ) >= saleTokenAmount,
            "TSP: insufficient contract balance"
        );

        return saleTokenAmount;
    }

    function getVestingWithdrawAmounts(
        address user,
        uint256[] calldata tierIds
    ) public view returns (uint256[] memory vestingWithdrawAmounts) {
        vestingWithdrawAmounts = new uint256[](tierIds.length);

        for (uint256 i = 0; i < tierIds.length; i++) {
            vestingWithdrawAmounts[i] = _getVestingWithdrawAmount(user, tierIds[i]);
        }
    }

    function getRecoverAmounts(
        uint256[] calldata tierIds
    ) public view returns (uint256[] memory recoveringAmounts) {
        recoveringAmounts = new uint256[](tierIds.length);

        for (uint256 i = 0; i < recoveringAmounts.length; i++) {
            recoveringAmounts[i] = _getRecoverAmount(tierIds[i]);
        }
    }

    function getTiers(
        uint256 offset,
        uint256 limit
    ) external view returns (TierView[] memory tierViews, TierInfoView[] memory tierInfoViews) {
        uint256 to = (offset + limit).min(latestTierId).max(offset);

        tierViews = new TierView[](to - offset);
        tierInfoViews = new TierInfoView[](to - offset);

        for (uint256 i = offset; i < to; i++) {
            Tier storage tier = _tiers[i + 1];
            TierInfoView memory tierInfoView = tier.tierInfo.tierInfoView;

            tierInfoView.whitelisted = totalSupply(i + 1) > 0;

            tierViews[i - offset] = tier.tierView;
            tierInfoViews[i - offset] = tierInfoView;
        }
    }

    function getUserInfos(
        address user,
        uint256[] calldata tierIds
    ) external view returns (UserInfo[] memory userInfos) {
        userInfos = new UserInfo[](tierIds.length);

        for (uint256 i = 0; i < userInfos.length; i++) {
            Tier storage tier = _tiers[tierIds[i]];
            Purchase memory purchase = tier.tierInfo.customers[user];

            userInfos[i].canParticipate = _canParticipate(user, tierIds[i]);
            userInfos[i].purchase = purchase;

            if (purchase.vestingTotalAmount == 0) {
                continue;
            }

            VestingSettings memory vestingSettings = tier.tierView.vestingSettings;
            VestingView memory vestingView;

            uint256 currentPrefixVestingAmount = _countPrefixVestingAmount(
                block.timestamp,
                purchase,
                vestingSettings
            );

            vestingView.cliffEndTime = purchase.purchaseTime + vestingSettings.cliffPeriod;
            vestingView.vestingEndTime = purchase.purchaseTime + vestingSettings.vestingDuration;
            vestingView.amountToWithdraw =
                currentPrefixVestingAmount -
                purchase.vestingWithdrawnAmount;
            vestingView.lockedAmount = purchase.vestingTotalAmount - currentPrefixVestingAmount;

            if (block.timestamp < vestingView.cliffEndTime) {
                vestingView.nextUnlockTime =
                    purchase.purchaseTime +
                    uint64(uint256(vestingSettings.cliffPeriod).max(vestingSettings.unlockStep));
            } else if (block.timestamp < vestingView.vestingEndTime) {
                vestingView.nextUnlockTime = uint64(block.timestamp) + vestingSettings.unlockStep;
                vestingView.nextUnlockTime -=
                    (vestingView.nextUnlockTime - purchase.purchaseTime) %
                    vestingSettings.unlockStep;
                vestingView.nextUnlockTime = uint64(
                    uint256(vestingView.nextUnlockTime).min(vestingView.vestingEndTime)
                );
            }

            if (vestingView.nextUnlockTime != 0) {
                vestingView.nextUnlockAmount =
                    _countPrefixVestingAmount(
                        vestingView.nextUnlockTime,
                        purchase,
                        vestingSettings
                    ) -
                    currentPrefixVestingAmount;
            }

            userInfos[i].vestingView = vestingView;
        }
    }

    function uri(uint256 tierId) public view override returns (string memory) {
        return _tiers[tierId].tierInfo.tierInfoView.uri;
    }

    function _createTier(TierView memory tierView) internal {
        require(tierView.saleTokenAddress != address(0), "TSP: sale token cannot be zero");
        require(tierView.saleTokenAddress != ETHEREUM_ADDRESS, "TSP: cannot sale native currency");
        require(tierView.totalTokenProvided != 0, "TSP: sale token is not provided");
        require(
            tierView.saleStartTime <= tierView.saleEndTime,
            "TSP: saleEndTime is less than saleStartTime"
        );
        require(
            tierView.minAllocationPerUser <= tierView.maxAllocationPerUser,
            "TSP: wrong allocation"
        );
        require(
            _validateVestingSettings(tierView.vestingSettings),
            "TSP: vesting settings validation failed"
        );
        require(
            tierView.purchaseTokenAddresses.length != 0,
            "TSP: purchase tokens are not provided"
        );
        require(
            tierView.purchaseTokenAddresses.length == tierView.exchangeRates.length,
            "TSP: tokens and rates lengths mismatch"
        );

        uint256 saleTokenDecimals = ERC20(tierView.saleTokenAddress).decimals();

        tierView.minAllocationPerUser = tierView.minAllocationPerUser.to18(saleTokenDecimals);
        tierView.maxAllocationPerUser = tierView.maxAllocationPerUser.to18(saleTokenDecimals);
        tierView.totalTokenProvided = tierView.totalTokenProvided.to18(saleTokenDecimals);

        Tier storage tier = _tiers[++latestTierId];
        TierInfo storage tierInfo = tier.tierInfo;

        for (uint256 i = 0; i < tierView.purchaseTokenAddresses.length; i++) {
            require(tierView.exchangeRates[i] != 0, "TSP: rate cannot be zero");
            require(
                tierView.purchaseTokenAddresses[i] != address(0),
                "TSP: purchase token cannot be zero"
            );
            require(
                tierInfo.rates[tierView.purchaseTokenAddresses[i]] == 0,
                "TSP: purchase tokens are duplicated"
            );

            tierInfo.rates[tierView.purchaseTokenAddresses[i]] = tierView.exchangeRates[i];
        }

        tier.tierView = tierView;

        emit TierCreated(latestTierId, tierView.saleTokenAddress);
    }

    function _addToWhitelist(
        WhitelistingRequest calldata request
    ) internal ifTierExists(request.tierId) ifTierIsNotOff(request.tierId) {
        uint256 tierId = request.tierId;

        _tiers[tierId].tierInfo.tierInfoView.uri = request.uri;

        for (uint256 i = 0; i < request.users.length; i++) {
            address user = request.users[i];

            _mint(user, tierId, 1, "");

            emit Whitelisted(tierId, user);
        }
    }

    function _offTier(uint256 tierId) internal ifTierExists(tierId) ifTierIsNotOff(tierId) {
        _tiers[tierId].tierInfo.tierInfoView.isOff = true;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        require(from == address(0), "TSP: only for minting");

        for (uint256 i = 0; i < ids.length; i++) {
            require(balanceOf(to, ids[i]) == 0, "TSP: balance can be only 0 or 1");
        }
    }

    function _getVestingWithdrawAmount(
        address user,
        uint256 tierId
    ) internal view ifTierExists(tierId) returns (uint256) {
        Tier storage tier = _tiers[tierId];

        Purchase memory purchase = tier.tierInfo.customers[user];
        VestingSettings memory vestingSettings = tier.tierView.vestingSettings;

        return
            _countPrefixVestingAmount(block.timestamp, purchase, vestingSettings) -
            purchase.vestingWithdrawnAmount;
    }

    function _getRecoverAmount(
        uint256 tierId
    ) internal view ifTierExists(tierId) returns (uint256) {
        TierView storage tierView = _tiers[tierId].tierView;
        TierInfoView storage tierInfoView = _tiers[tierId].tierInfo.tierInfoView;

        if (!tierInfoView.isOff && block.timestamp <= tierView.saleEndTime) {
            return 0;
        }

        return tierView.totalTokenProvided - tierInfoView.totalSold;
    }

    function _canParticipate(address user, uint256 tierId) internal view returns (bool) {
        return totalSupply(tierId) == 0 || balanceOf(user, tierId) == 1;
    }

    function _onlyGov() internal view {
        require(govAddress == address(0) || msg.sender == govAddress, "TSP: not a Gov contract");
    }

    function _countPrefixVestingAmount(
        uint256 timestamp,
        Purchase memory purchase,
        VestingSettings memory vestingSettings
    ) private pure returns (uint256) {
        if (
            purchase.purchaseTime == 0 ||
            vestingSettings.vestingPercentage == 0 ||
            timestamp < purchase.purchaseTime + vestingSettings.cliffPeriod
        ) {
            return 0;
        }

        if (timestamp >= purchase.purchaseTime + vestingSettings.vestingDuration) {
            return purchase.vestingTotalAmount;
        }

        uint256 beforeLastSegmentAmount = purchase.vestingTotalAmount.ratio(
            vestingSettings.vestingDuration -
                (vestingSettings.vestingDuration % vestingSettings.unlockStep),
            vestingSettings.vestingDuration
        );
        uint256 segmentsTotal = vestingSettings.vestingDuration / vestingSettings.unlockStep;
        uint256 segmentsBefore = (timestamp - purchase.purchaseTime) / vestingSettings.unlockStep;

        return beforeLastSegmentAmount.ratio(segmentsBefore, segmentsTotal);
    }

    function _validateVestingSettings(
        VestingSettings memory vestingSettings
    ) private pure returns (bool) {
        if (
            vestingSettings.vestingPercentage == 0 &&
            vestingSettings.vestingDuration == 0 &&
            vestingSettings.unlockStep == 0 &&
            vestingSettings.cliffPeriod == 0
        ) {
            return true;
        }

        return
            vestingSettings.vestingDuration != 0 &&
            vestingSettings.vestingPercentage != 0 &&
            vestingSettings.unlockStep != 0 &&
            vestingSettings.vestingPercentage <= PERCENTAGE_100 &&
            vestingSettings.vestingDuration >= vestingSettings.unlockStep;
    }
}
