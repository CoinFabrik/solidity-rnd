# EeseeFeeSplitter

_This contract can be used when payments need to be received by a group
of contracts and split proportionately to some number of shares they own.
Addapted from Openzeppelin's PaymentSplitter._


## ESE

```solidity
contract IERC20 ESE
```

_ESE token._

## totalShares

```solidity
uint256 totalShares
```

_Total shares from all payees._

## totalReleased

```solidity
uint256 totalReleased
```

_Total ESE tokens released._

## shares

```solidity
mapping(address => uint256) shares
```

_Payees' shares._

## released

```solidity
mapping(address => uint256) released
```

_Payees' released ESE tokens._

## payees

```solidity
address[] payees
```

_Payee accounts._

## release

```solidity
function release(address account) external returns (uint256 payment)
```

_Release one of the payee's proportional payment._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | Whose payments will be released. |


# Inherited from IEeseeFeeSplitter

## ESE

```solidity
function ESE() external view returns (contract IERC20)
```

## totalShares

```solidity
function totalShares() external view returns (uint256)
```

## totalReleased

```solidity
function totalReleased() external view returns (uint256)
```

## shares

```solidity
function shares(address) external view returns (uint256)
```

## released

```solidity
function released(address) external view returns (uint256)
```

## payees

```solidity
function payees(uint256) external view returns (address)
```


## PaymentReleased

```solidity
event PaymentReleased(address to, uint256 amount)
```


