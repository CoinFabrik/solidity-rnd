# OpenseaStructs


## BasicOrderType

```solidity
enum BasicOrderType {
  ETH_TO_ERC721_FULL_OPEN,
  ETH_TO_ERC721_PARTIAL_OPEN,
  ETH_TO_ERC721_FULL_RESTRICTED,
  ETH_TO_ERC721_PARTIAL_RESTRICTED,
  ETH_TO_ERC1155_FULL_OPEN,
  ETH_TO_ERC1155_PARTIAL_OPEN,
  ETH_TO_ERC1155_FULL_RESTRICTED,
  ETH_TO_ERC1155_PARTIAL_RESTRICTED,
  ERC20_TO_ERC721_FULL_OPEN,
  ERC20_TO_ERC721_PARTIAL_OPEN,
  ERC20_TO_ERC721_FULL_RESTRICTED,
  ERC20_TO_ERC721_PARTIAL_RESTRICTED,
  ERC20_TO_ERC1155_FULL_OPEN,
  ERC20_TO_ERC1155_PARTIAL_OPEN,
  ERC20_TO_ERC1155_FULL_RESTRICTED,
  ERC20_TO_ERC1155_PARTIAL_RESTRICTED,
  ERC721_TO_ERC20_FULL_OPEN,
  ERC721_TO_ERC20_PARTIAL_OPEN,
  ERC721_TO_ERC20_FULL_RESTRICTED,
  ERC721_TO_ERC20_PARTIAL_RESTRICTED,
  ERC1155_TO_ERC20_FULL_OPEN,
  ERC1155_TO_ERC20_PARTIAL_OPEN,
  ERC1155_TO_ERC20_FULL_RESTRICTED,
  ERC1155_TO_ERC20_PARTIAL_RESTRICTED
}
```
## BasicOrderParameters

_For basic orders involving ETH / native / ERC20 <=> ERC721 / ERC1155
     matching, a group of six functions may be called that only requires a
     subset of the usual order arguments. Note the use of a "basicOrderType"
     enum; this represents both the usual order type as well as the "route"
     of the basic order (a simple derivation function for the basic order
     type is `basicOrderType = orderType + (4 * basicOrderRoute)`.)_

```solidity
struct BasicOrderParameters {
  address considerationToken;
  uint256 considerationIdentifier;
  uint256 considerationAmount;
  address payable offerer;
  address zone;
  address offerToken;
  uint256 offerIdentifier;
  uint256 offerAmount;
  enum OpenseaStructs.BasicOrderType basicOrderType;
  uint256 startTime;
  uint256 endTime;
  bytes32 zoneHash;
  uint256 salt;
  bytes32 offererConduitKey;
  bytes32 fulfillerConduitKey;
  uint256 totalOriginalAdditionalRecipients;
  struct OpenseaStructs.AdditionalRecipient[] additionalRecipients;
  bytes signature;
}
```
## AdditionalRecipient

_Basic orders can supply any number of additional recipients, with the
     implied assumption that they are supplied from the offered ETH (or other
     native token) or ERC20 token for the order._

```solidity
struct AdditionalRecipient {
  uint256 amount;
  address payable recipient;
}
```

