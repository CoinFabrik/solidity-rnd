# Multicall


## CallReverted

```solidity
error CallReverted()
```

## multicall

```solidity
function multicall(bytes[] data) external payable returns (bytes[] results)
```

_Allows calling multiple contract functions in a single call:_

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes[] | - ABI-encoded data describing the call. |


