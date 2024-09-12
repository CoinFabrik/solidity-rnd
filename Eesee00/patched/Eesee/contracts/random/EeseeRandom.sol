// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "../interfaces/IEeseeRandom.sol";
import "../libraries/RandomArray.sol";

contract EeseeRandom is IEeseeRandom, AutomationCompatibleInterface, VRFConsumerBaseV2 {
    using RandomArray for Random[];

    ///@dev Random words and timestamps received from Chainlink.
    Random[] public random;

    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Admin role af defined in {accessManager}.
    bytes32 private immutable ADMIN_ROLE;
    ///@dev PERFORM_UPKEEP_ROLE role af defined in {accessManager}.
    bytes32 private constant PERFORM_UPKEEP_ROLE = keccak256("PERFORM_UPKEEP_ROLE");

    ///@dev Last performUpkeep call timestamp.
    uint64 public performUpkeepTimestamp;
    ///@dev Chainlink VRF V2 subscription ID.
    uint64 immutable public subscriptionID;

    ///@dev Chainlink Keeper performUpkeep() call frequency.
    uint32 public automationInterval = 12 hours;
    ///@dev In case Chainlink VRF request fails to get delivered 24 hours after the lot was closed, unlock Reclaim functions.
    uint48 public constant RETURN_INTERVAL = 24 hours;
    ///@dev Chainlink VRF V2 gas limit to call fulfillRandomWords().
    uint32 public callbackGasLimit;
    ///@dev Chainlink VRF V2 request confirmations.
    uint16 immutable private minimumRequestConfirmations;

    ///@dev Chainlink VRF V2 coordinator.
    VRFCoordinatorV2Interface immutable public vrfCoordinator;
    ///@dev Chainlink VRF V2 key hash to call requestRandomWords() with.
    bytes32 immutable private keyHash;

    modifier onlyRole(bytes32 role){
        if(!accessManager.hasRole(role, msg.sender)) revert CallerNotAuthorized();
        _;
    }

    constructor(
        ChainlinkContructorArgs memory chainlinkArgs,
        IEeseeAccessManager _accessManager
    ) VRFConsumerBaseV2(chainlinkArgs.vrfCoordinator) {
        if(address(_accessManager) == address(0)) revert InvalidAccessManager();
        // ChainLink stuff. Create subscription for VRF V2.
        vrfCoordinator = VRFCoordinatorV2Interface(chainlinkArgs.vrfCoordinator);
        subscriptionID = vrfCoordinator.createSubscription();
        vrfCoordinator.addConsumer(subscriptionID, address(this));
        keyHash = chainlinkArgs.keyHash;
        minimumRequestConfirmations = chainlinkArgs.minimumRequestConfirmations;
        callbackGasLimit = chainlinkArgs.callbackGasLimit;

        accessManager = _accessManager;
        ADMIN_ROLE = _accessManager.ADMIN_ROLE();
    }

    // ============ External Write Functions ============

    /**
     * @dev Calls Chainlink's requestRandomWords.
     */
    function performUpkeep(bytes calldata /*performData*/) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if(!upkeepNeeded) revert UpkeepNotNeeded();

        _performUpkeep();
    }

    // ============ Admin Methods ============

    /**
     * @dev Calls Chainlink's requestRandomWords.
     * Note: This function can only be called by PERFORM_UPKEEP_ROLE.
     */
    function performUpkeep() external onlyRole(PERFORM_UPKEEP_ROLE) {
        _performUpkeep();
    }

    /**
     * @dev Changes callbackGasLimit. Emits {ChangeCallbackGasLimit} event.
     * @param _callbackGasLimit - New callbackGasLimit.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function changeCallbackGasLimit(uint32 _callbackGasLimit) external onlyRole(ADMIN_ROLE){
        emit ChangeCallbackGasLimit(callbackGasLimit, _callbackGasLimit);
        callbackGasLimit = _callbackGasLimit;
    }

    /**
     * @dev Changes automationInterval. Emits {ChangeAutomationInterval} event.
     * @param _automationInterval - New automationInterval.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function changeAutomationInterval(uint32 _automationInterval) external onlyRole(ADMIN_ROLE) {
        if(_automationInterval > RETURN_INTERVAL) revert InvalidAutomationInterval();

        emit ChangeAutomationInterval(automationInterval, _automationInterval);
        automationInterval = _automationInterval;
    }

    // ============ External View Functions ============

    function getRandomFromTimestamp(uint256 _timestamp) external view returns (uint256 word, uint256 timestamp){
        Random memory _random = random.findUpperBound(_timestamp);
        return (_random.word, _random.timestamp);
    }

    // ============ Public View Functions ============

    /**
     * @dev This function is called by Chainlink Keeper to determine if performUpkeep() needs to be called.
     */
    function checkUpkeep(bytes memory /* checkData */) public view override returns (bool upkeepNeeded, bytes memory /* performData */){
        unchecked { if(block.timestamp - performUpkeepTimestamp >= automationInterval) upkeepNeeded = true; }
    }

    // ============ Internal Write Functions ============

    /**
     * @dev This function is called by Chainlink. Writes random word to storage. Emits {FulfillRandomWords} event.
     * @param randomWords - Random values sent by Chainlink.
     */
    function fulfillRandomWords(uint256 /*requestID*/, uint256[] memory randomWords) internal override {
        uint256 randomLength = random.length;
        unchecked { if(randomLength > 0 && random[randomLength - 1].timestamp == block.timestamp) revert CallOnTheSameBlock(); }

        random.push(Random({
            word: randomWords[0],
            timestamp: block.timestamp
        }));

        emit FulfillRandomWords(randomWords[0]);
    }

    function _performUpkeep() internal {
        uint256 requestID = vrfCoordinator.requestRandomWords(keyHash, subscriptionID, minimumRequestConfirmations, callbackGasLimit, 1);
        performUpkeepTimestamp = uint64(block.timestamp);
        emit RequestWords(requestID);
    }
}