// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IEeseeAccessManager.sol";

contract EeseeMining is ERC2771Recipient {
    using SafeERC20 for IERC20;
    /**
     * @dev Claim:
     * {rewardID} - RewardID the tokens are claimed for.
     * {balance} - Amount of tokens to claim. 
     * {merkleProof} - Merkle proof to verify claim.
     */
    struct Claim {
        uint128 rewardID;
        uint128 balance;
        bytes32[] merkleProof;
    }

    ///@dev ESE token.
    IERC20 public immutable ESE;
    ///@dev Current reward ID.
    uint128 public rewardID;
    ///@dev Maps {rewardID} to its merkle root.
    mapping(uint128 => bytes32) public rewardRoot;
    ///@dev Has address claimed reward for {rewardID}.
    mapping(address => mapping(uint128 => bool)) public isClaimed;

    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Merkle root updater role in {accessManager}.
    bytes32 public constant MERKLE_ROOT_UPDATER_ROLE = keccak256("MERKLE_ROOT_UPDATER_ROLE");

    event RewardAdded(
        uint128 indexed rewardID,
        bytes32 merkleRoot
    );
    
    event RewardClaimed(
        uint128 indexed rewardID,
        address indexed claimer,
        uint128 amount
    );

    error InvalidMerkleProof();
    error AlreadyClaimed();
    error CallerNotAuthorized();
    error InvalidConstructor();
    error MerkleRootNotExists();

    constructor(IERC20 _ESE, IEeseeAccessManager _accessManager, address trustedForwarder) {
        if(
            address(_ESE) == address(0) ||
            address(_accessManager) == address(0)
        ) revert InvalidConstructor();
        
        ESE = _ESE;
        accessManager = _accessManager;

        _setTrustedForwarder(trustedForwarder);
    }

    // ============ External Write Functions ============
    
    /**
     * @dev Claims rewards for multiple {rewardID}s. Emits {RewardClaimed} event for each reward claimed.
     * @param claims - Claim structs.
     * @param claimer - Address to claim rewards for.
     */
    function claimRewards(Claim[] calldata claims, address claimer) external returns(uint256 rewards){
        for (uint256 i; i < claims.length;) {
            Claim calldata claim = claims[i];
            if(rewardRoot[claim.rewardID] == bytes32(0)) revert MerkleRootNotExists();
            if(isClaimed[claimer][claim.rewardID]) revert AlreadyClaimed();
            if(!verifyClaim(claimer, claim)) revert InvalidMerkleProof();
            
            isClaimed[claimer][claim.rewardID] = true; 
            rewards += claim.balance;

            emit RewardClaimed(
                claim.rewardID,
                claimer,
                claim.balance
            );
            unchecked{ ++i; }
        }
        ESE.safeTransfer(claimer, rewards);
    }

    /**
     * @dev Adds new merkle root and advances to the next {rewardID}. Emits {RewardAdded} event.
     * @param merkleRoot - Merkle root.
     * Note: This function can only be called by the MERKLE_ROOT_UPDATER_ROLE.
     */
    function addReward(bytes32 merkleRoot) external {
        if(!accessManager.hasRole(MERKLE_ROOT_UPDATER_ROLE, _msgSender())) revert CallerNotAuthorized();

        rewardRoot[rewardID] = merkleRoot;
        emit RewardAdded(rewardID, merkleRoot);
        unchecked{ ++rewardID; }
    }

    // ============ External View Functions ============

    /**
     * @dev Verifies {claims} and returns rewards to be claimed from {claims}.
     * @param claimer - Address to check.
     * @param claims - Claims to check.

     * @return rewards - Rewards to be claimed.
     */
    function getRewards(address claimer, Claim[] calldata claims) external view returns (uint128 rewards) {
        for (uint256 i; i < claims.length;) {
            Claim calldata claim = claims[i];
            if(!verifyClaim(claimer, claim)) revert InvalidMerkleProof();
            if(isClaimed[claimer][claim.rewardID]) revert AlreadyClaimed();
            
            rewards += claim.balance;
            unchecked{ ++i; }
        }
    }

    // ============ Public View Functions ============

    /**
     * @dev Verifies {claim} for {claimer}.
     * @param claimer - Address to verify claim for.
     * @param claim - Claim to verify.

     * @return bool - Does {claim} exist in merkle root.
     */
    function verifyClaim(address claimer, Claim calldata claim) public view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(claimer, claim.balance))));
        return MerkleProof.verify(claim.merkleProof, rewardRoot[claim.rewardID], leaf);
    }
}