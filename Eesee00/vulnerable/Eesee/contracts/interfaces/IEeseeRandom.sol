// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import {AutomationRegistryInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationRegistryInterface1_2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./IEeseeAccessManager.sol";
import "../types/Random.sol";

interface IEeseeRandom {
    ///@dev Because of the Stack too deep error, we combine some constructor arguments into a single stuct
    struct ChainlinkContructorArgs{
        address vrfCoordinator;
        bytes32 keyHash;
        uint16 minimumRequestConfirmations;
        uint32 callbackGasLimit;
    }

    event RequestWords(
        uint256 indexed requestID
    );

    event FulfillRandomWords(
        uint256 indexed randomWord
    );

    event ChangeAutomationInterval(
        uint32 indexed previosAutomationInterval,
        uint32 indexed newAutomationInterval
    );

    event ApproveContract(address indexed _contract);

    error CallerNotAuthorized();
    error InvalidAutomationInterval();
    error UpkeepNotNeeded();
    error CallOnTheSameBlock();
    error InvalidAccessManager();

    function returnInterval() external view returns(uint48);

    function vrfCoordinator() external view returns(VRFCoordinatorV2Interface);

    function accessManager() external view returns(IEeseeAccessManager);

    function performUpkeepTimestamp() external view returns (uint64);
    function automationInterval() external view returns(uint32);
    function subscriptionID() external view returns(uint64);

    function random(uint256) external view returns(uint256 word, uint256 timestamp);
    function getRandomFromTimestamp(uint256 _timestamp) external view returns (uint256 word, uint256 timestamp);

    function changeAutomationInterval(uint32 _automationInterval) external;
}