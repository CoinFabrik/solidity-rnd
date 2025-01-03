// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../../interfaces/gov/settings/IGovSettings.sol";

import "../../core/Globals.sol";

contract GovSettings is IGovSettings, OwnableUpgradeable {
    uint256 public newSettingsId;

    mapping(uint256 => ProposalSettings) public settings; // settingsId => info
    mapping(address => uint256) public executorToSettings; // executor => seetingsId

    event SettingsChanged(uint256 settingsId, string description);
    event ExecutorChanged(uint256 settingsId, address executor);

    function __GovSettings_init(
        address govPoolAddress,
        address distributionProposalAddress,
        address validatorsAddress,
        address govUserKeeperAddress,
        ProposalSettings[] calldata proposalSettings,
        address[] calldata additionalProposalExecutors
    ) external initializer {
        __Ownable_init();

        uint256 systemExecutors = uint256(ExecutorType.VALIDATORS);
        uint256 settingsId;

        for (uint256 i = 0; i < proposalSettings.length; i++) {
            ProposalSettings calldata executorSettings = proposalSettings[i];

            _validateProposalSettings(executorSettings);

            settings[settingsId] = executorSettings;

            if (settingsId == uint256(ExecutorType.INTERNAL)) {
                _setExecutor(address(this), settingsId);
                _setExecutor(govPoolAddress, settingsId);
                _setExecutor(govUserKeeperAddress, settingsId);
            } else if (settingsId == uint256(ExecutorType.DISTRIBUTION)) {
                require(
                    !executorSettings.delegatedVotingAllowed && !executorSettings.earlyCompletion,
                    "GovSettings: invalid distribution settings"
                );
                _setExecutor(distributionProposalAddress, settingsId);
            } else if (settingsId == uint256(ExecutorType.VALIDATORS)) {
                _setExecutor(validatorsAddress, settingsId);
            } else if (settingsId > systemExecutors) {
                _setExecutor(
                    additionalProposalExecutors[settingsId - systemExecutors - 1],
                    settingsId
                );
            }

            settingsId++;
        }
        newSettingsId = settingsId;
    }

    function addSettings(ProposalSettings[] calldata _settings) external override onlyOwner {
        uint256 settingsId = newSettingsId;

        for (uint256 i; i < _settings.length; i++) {
            _validateProposalSettings(_settings[i]);
            _setSettings(_settings[i], settingsId++);
        }

        newSettingsId = settingsId;
    }

    function editSettings(
        uint256[] calldata settingsIds,
        ProposalSettings[] calldata _settings
    ) external override onlyOwner {
        for (uint256 i; i < _settings.length; i++) {
            require(_settingsExist(settingsIds[i]), "GovSettings: settings do not exist");

            _validateProposalSettings(_settings[i]);
            _setSettings(_settings[i], settingsIds[i]);
        }
    }

    function changeExecutors(
        address[] calldata executors,
        uint256[] calldata settingsIds
    ) external override onlyOwner {
        for (uint256 i; i < executors.length; i++) {
            require(_settingsExist(settingsIds[i]), "GovSettings: settings do not exist");

            _setExecutor(executors[i], settingsIds[i]);
        }
    }

    function _validateProposalSettings(ProposalSettings calldata _settings) internal pure {
        require(_settings.duration > 0, "GovSettings: invalid vote duration value");
        require(_settings.quorum <= PERCENTAGE_100, "GovSettings: invalid quorum value");
        require(
            _settings.durationValidators > 0,
            "GovSettings: invalid validator vote duration value"
        );
        require(
            _settings.quorumValidators <= PERCENTAGE_100,
            "GovSettings: invalid validator quorum value"
        );
    }

    function _settingsExist(uint256 settingsId) internal view returns (bool) {
        return settings[settingsId].duration > 0;
    }

    function getDefaultSettings() external view override returns (ProposalSettings memory) {
        return settings[uint256(ExecutorType.DEFAULT)];
    }

    function getInternalSettings() external view override returns (ProposalSettings memory) {
        return settings[uint256(ExecutorType.INTERNAL)];
    }

    function getExecutorSettings(
        address executor
    ) external view override returns (ProposalSettings memory) {
        return settings[executorToSettings[executor]];
    }

    function _setExecutor(address executor, uint256 settingsId) internal {
        executorToSettings[executor] = settingsId;

        emit ExecutorChanged(settingsId, executor);
    }

    function _setSettings(ProposalSettings calldata _settings, uint256 settingsId) internal {
        settings[settingsId] = _settings;

        emit SettingsChanged(settingsId, _settings.executorDescription);
    }
}
