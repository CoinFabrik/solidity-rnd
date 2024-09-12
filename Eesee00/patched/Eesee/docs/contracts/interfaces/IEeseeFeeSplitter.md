# IEeseeFeeSplitter


## PaymentReleased

```solidity
event PaymentReleased(address to, uint256 amount)
```

## InvalidESE

```solidity
error InvalidESE()
```

## InvalidLength

```solidity
error InvalidLength()
```

## InvalidPayee

```solidity
error InvalidPayee()
```

## InvalidShare

```solidity
error InvalidShare()
```

## PayeeAlreadyInitialized

```solidity
error PayeeAlreadyInitialized()
```

## NoShares

```solidity
error NoShares()
```

## InvalidShares

```solidity
error InvalidShares()
```

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

## release

```solidity
function release(address account) external returns (uint256 payment)
```


