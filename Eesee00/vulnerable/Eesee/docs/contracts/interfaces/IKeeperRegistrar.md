# IKeeperRegistrar


## AutoApproveType

```solidity
enum AutoApproveType {
  DISABLED,
  ENABLED_SENDER_ALLOWLIST,
  ENABLED_ALL
}
```
## register

```solidity
function register(string name, bytes encryptedEmail, address upkeepContract, uint32 gasLimit, address adminAddress, bytes checkData, uint96 amount, uint8 source, address sender) external
```

## getRegistrationConfig

```solidity
function getRegistrationConfig() external view returns (enum IKeeperRegistrar.AutoApproveType autoApproveConfigType, uint32 autoApproveMaxAllowed, uint32 approvedCount, address keeperRegistry, uint256 minLINKJuels)
```


