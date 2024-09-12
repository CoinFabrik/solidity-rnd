# ESE

_Implementation of the {IERC20} interface with automatic vesting mechanism and EIP-2612 permit._


## Beneficiary

```solidity
struct Beneficiary {
  uint256 amount;
  address addr;
}
```
## VestingParams

```solidity
struct VestingParams {
  uint256 amount;
  uint128 cliff;
  uint128 duration;
  mapping(address => uint256) amounts;
}
```
## ConstructorVestingParams

```solidity
struct ConstructorVestingParams {
  uint32 cliff;
  uint32 duration;
  uint16 TGEMintShare;
}
```
## vestingStages

```solidity
mapping(uint256 => struct ESE.VestingParams) vestingStages
```

_Vesting parameters. Mappings are more gas efficient than arrays._

## vestingStagesLength

```solidity
uint256 vestingStagesLength
```

_Info on how many vesting stages there are in total._

## TGE

```solidity
uint256 TGE
```

_Token generation event._

## Initialize

```solidity
event Initialize(uint256 TGE)
```

## addVestingBeneficiaries

```solidity
function addVestingBeneficiaries(uint256 stage, struct ESE.Beneficiary[] beneficiaries) external
```

_Adds new vesting beneficiaries to {vestingStages}. Mints new tokens according to {_TGEMintShares} variable._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| stage | uint256 | - vestingStages index to add beneficiaries for. |
| beneficiaries | struct ESE.Beneficiary[] | - Beneficiary structs containing beneficiaries's addresses and vesting amounts.  Note: Can only be called in an unitialized state by {_initializer}. |

## initialize

```solidity
function initialize() external
```

_Initializes this contract. Token transfers are not available until this function is called. Emits {Initialize} event.
Note: Can only be called in an unitialized state by {_initializer}._

## totalSupply

```solidity
function totalSupply() public view returns (uint256)
```

_See {IERC20-totalSupply}._

## balanceOf

```solidity
function balanceOf(address account) public view returns (uint256)
```

_See {IERC20-balanceOf}._

## totalVestedAmount

```solidity
function totalVestedAmount(uint256 stage) external view returns (uint256)
```

_Info on how many tokens have already been vested during 3 vesting periods in total._

## vestedAmount

```solidity
function vestedAmount(uint256 stage, address account) external view returns (uint256)
```

_Info on how many tokens have already been vested during 3 vesting periods for account._


# Inherited from ERC20Burnable

## burn

```solidity
function burn(uint256 amount) public virtual
```

_Destroys `amount` tokens from the caller.

See {ERC20-_burn}._

## burnFrom

```solidity
function burnFrom(address account, uint256 amount) public virtual
```

_Destroys `amount` tokens from `account`, deducting from the caller's
allowance.

See {ERC20-_burn} and {ERC20-allowance}.

Requirements:

- the caller must have allowance for ``accounts``'s tokens of at least
`amount`._



# Inherited from ERC20Permit

## permit

```solidity
function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public virtual
```

_See {IERC20Permit-permit}._

## nonces

```solidity
function nonces(address owner) public view virtual returns (uint256)
```

_See {IERC20Permit-nonces}._

## DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

_See {IERC20Permit-DOMAIN_SEPARATOR}._



# Inherited from EIP712

## eip712Domain

```solidity
function eip712Domain() public view virtual returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)
```

_See {EIP-5267}.

_Available since v4.9.__



# Inherited from IERC5267


## EIP712DomainChanged

```solidity
event EIP712DomainChanged()
```

_MAY be emitted to signal that the domain could have changed._


# Inherited from ERC20

## name

```solidity
function name() public view virtual returns (string)
```

_Returns the name of the token._

## symbol

```solidity
function symbol() public view virtual returns (string)
```

_Returns the symbol of the token, usually a shorter version of the
name._

## decimals

```solidity
function decimals() public view virtual returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).

Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei. This is the default value returned by this function, unless
it's overridden.

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

## transfer

```solidity
function transfer(address to, uint256 amount) public virtual returns (bool)
```

_See {IERC20-transfer}.

Requirements:

- `to` cannot be the zero address.
- the caller must have a balance of at least `amount`._

## allowance

```solidity
function allowance(address owner, address spender) public view virtual returns (uint256)
```

_See {IERC20-allowance}._

## approve

```solidity
function approve(address spender, uint256 amount) public virtual returns (bool)
```

_See {IERC20-approve}.

NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
`transferFrom`. This is semantically equivalent to an infinite approval.

Requirements:

- `spender` cannot be the zero address._

## transferFrom

```solidity
function transferFrom(address from, address to, uint256 amount) public virtual returns (bool)
```

_See {IERC20-transferFrom}.

Emits an {Approval} event indicating the updated allowance. This is not
required by the EIP. See the note at the beginning of {ERC20}.

NOTE: Does not update the allowance if the current allowance
is the maximum `uint256`.

Requirements:

- `from` and `to` cannot be the zero address.
- `from` must have a balance of at least `amount`.
- the caller must have allowance for ``from``'s tokens of at least
`amount`._

## increaseAllowance

```solidity
function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool)
```

_Atomically increases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address._

## decreaseAllowance

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool)
```

_Atomically decreases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address.
- `spender` must have allowance for the caller of at least
`subtractedValue`._



# Inherited from IERC20


## Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

_Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero._

## Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

_Emitted when the allowance of a `spender` for an `owner` is set by
a call to {approve}. `value` is the new allowance._


