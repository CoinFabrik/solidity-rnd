// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@opengsn/contracts/src/BasePaymaster.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "../interfaces/IEeseeAccessManager.sol";

/**
 * A paymaster allowing addresses holding ESE tokens to pay for a GSN transaction.
 */
contract EeseePaymaster is BasePaymaster, EIP712 {
    using SafeERC20 for IERC20;

    ///@dev ESE token this contract uses.
    IERC20 public immutable ESE;
    ///@dev Nonces for each address.
    mapping(address => uint256) public nonces;
    bytes32 private constant PRICE_TYPEHASH = keccak256("Price(address sender,uint256 priceQuote,uint256 discount,uint256 nonce,uint256 deadline)");
    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Signer role in {accessManager}.
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    ///@dev Admin role af defined in {accessManager}.
    bytes32 public immutable ADMIN_ROLE;
    ///@dev Contracts approved for use.
    mapping(address => bool) public approvedContracts;

    uint256 private constant _POST_RELAYED_CALL_GAS_LIMIT = 140000;

    event Refilled(address indexed sender, uint256 eth);
    event TokensCharged(address indexed payer, uint256 indexed nonce, uint256 gasUseWithPost, uint256 tokenActualCharge, uint256 ethActualCharge, uint256 actualDiscount);
    event Withdrawn(address indexed to, uint256 amount);
    event ApproveContract(address indexed _contract);
    event RevokeContractApproval(address indexed _contract);

    error InvalidConstructor();
    error ExpiredDeadline();
    error InvalidSender();
    error InvalidSignature();
    error ActualChargeHigher();
    error CallerNotAuthorized();
    error AddressNotApproved();
    error AlreadyApproved();

    receive() external override payable {
        relayHub.depositFor{value: msg.value}(address(this));
        emit Refilled(msg.sender, msg.value);
    }

    constructor(
        IERC20 _ESE,
        IRelayHub _relayHub,
        address _trustedForwarder,
        IEeseeAccessManager _accessManager
    ) EIP712("EeseePaymaster", "1") {
        if(
            address(_ESE) == address(0) ||
            address(_accessManager) == address(0)
        ) revert InvalidConstructor();

        ESE = _ESE;

        accessManager = _accessManager;
        ADMIN_ROLE = _accessManager.ADMIN_ROLE();

        setRelayHub(_relayHub);
        setTrustedForwarder(_trustedForwarder);
    }

    /**
     * @dev Checks ESE price signature and calls permit function on ESE.
     * @param approvalData - Must contain full price data + full ESE permit data.
     */
    function _preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    ) internal override returns (bytes memory, bool) {
        if(!approvedContracts[relayRequest.request.to]) revert AddressNotApproved();
        (bytes memory price, bytes memory permit) = abi.decode(approvalData, (bytes, bytes));

        address payer = relayRequest.request.from;
        uint256 priceQuote;
        uint256 discount;
        uint256 nonce;
        {
        (address sender, uint256 _priceQuote, uint256 _discount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) = abi.decode(price, (address, uint256, uint256, uint256, uint8, bytes32, bytes32));
        if(block.timestamp > deadline) revert ExpiredDeadline();
        if(payer != sender) revert InvalidSender();
        
        nonce = nonces[sender];
        bytes32 structHash = keccak256(abi.encode(PRICE_TYPEHASH, sender, _priceQuote, _discount, nonce, deadline));
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, v, r, s);
        if(!accessManager.hasRole(SIGNER_ROLE, signer)) revert InvalidSignature();

        nonces[sender] = nonce + 1;
        priceQuote = _priceQuote;
        discount = _discount;
        }

        if(permit.length != 0){
            (
                address owner, 
                address spender, 
                uint256 value, 
                uint256 deadline, 
                uint8 v, 
                bytes32 r, 
                bytes32 s
            ) = abi.decode(permit, (address, address, uint256, uint256, uint8, bytes32, bytes32));
            IERC20Permit(address(ESE)).permit(owner, spender, value, deadline, v, r, s);
        }

        (uint256 tokenPreCharge,,) = _calculateCharge(relayRequest.relayData, maxPossibleGas, priceQuote, discount);
        if(tokenPreCharge != 0){
            ESE.safeTransferFrom(payer, address(this), tokenPreCharge);
        }
        return (abi.encode(payer, nonce, priceQuote, discount, tokenPreCharge), false);
    }

    /**
     * @dev Emits TokensCharged event which can be listened to by backend and identified by payer and nonce.
     */
    function _postRelayedCall(
        bytes calldata context,
        bool,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) internal override {
        (address payer, uint256 nonce, uint256 priceQuote, uint256 discount, uint256 tokenPreCharge) = abi.decode(context, (address, uint256, uint256, uint256, uint256));
        
        uint256 gasUseWithPost = gasUseWithoutPost + _POST_RELAYED_CALL_GAS_LIMIT;
        (uint256 tokenActualCharge, uint256 ethActualCharge, uint256 actualDiscount) = _calculateCharge(relayData, gasUseWithPost, priceQuote, discount);
        if(tokenActualCharge > tokenPreCharge) revert ActualChargeHigher();
        if(tokenPreCharge != tokenActualCharge){
            unchecked{
                ESE.safeTransfer(payer, tokenPreCharge - tokenActualCharge);
            }
        }

        emit TokensCharged(payer, nonce, gasUseWithPost, tokenActualCharge, ethActualCharge, actualDiscount);
    }

    function _calculateCharge(
        GsnTypes.RelayData calldata relayData,
        uint256 gasUsed,
        uint256 priceQuote,
        uint256 discount
    ) internal view returns (uint256 tokenCharge, uint256 ethCharge, uint256 actualDiscount) {
        ethCharge = relayHub.calculateCharge(gasUsed, relayData);
        tokenCharge = (ethCharge * priceQuote / 1 ether);
        if(discount >= tokenCharge){
            tokenCharge = 0;
            actualDiscount = tokenCharge;
        }else{
            unchecked {
                tokenCharge -= discount;
            }
            actualDiscount = discount;
        }
    }

    function _verifyApprovalData(bytes calldata approvalData) internal override view {}

    /**
     * @dev Withdraws ESE collected from users.
     * @param target - Recipient address.

     * @return amount - amount of ESE transfered to {target}.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function withdrawTokens(address target) external onlyOwner returns(uint256 amount){
        amount = ESE.balanceOf(address(this));
        ESE.safeTransfer(target, amount);

        emit Withdrawn(target, amount);
    }

    function getGasAndDataLimits() public override pure returns (IPaymaster.GasAndDataLimits memory limits) {
        uint256 preRelayedCallGasLimit = 200000;
        return IPaymaster.GasAndDataLimits(
            preRelayedCallGasLimit + FORWARDER_HUB_OVERHEAD,
            preRelayedCallGasLimit,
            _POST_RELAYED_CALL_GAS_LIMIT, 
            CALLDATA_SIZE_LIMIT
        );
    }

    function versionPaymaster() external override pure returns (string memory){
        return "3.0.0-beta.3+eesee.ipaymaster";
    }

    //Note: Because we use custom accessManager instead of Ownable, all of Ownable's functions such as transferOwnership are now useless.
    function _checkOwner() internal view override {
        if(!accessManager.hasRole(ADMIN_ROLE, msg.sender)) revert CallerNotAuthorized();
    } 

    /**
     * @dev Approves contract for use. Emits {ApproveContract} event.
     * @param _address - New approvedContract.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function approveContract(address _address) external onlyOwner {
        if(approvedContracts[_address]) revert AlreadyApproved();
        approvedContracts[_address] = true;
        emit ApproveContract(_address);
    }

    /**
     * @dev Revokes rights to update volume from {_address}. Emits {RevokeVolumeUpdater} event.
     * @param _address - Address to revoke volumeUpdater from.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function revokeContractApproval(address _address) external onlyOwner {
        if(!approvedContracts[_address]) revert AddressNotApproved();
        approvedContracts[_address] = false;
        emit RevokeContractApproval(_address);
    }
}