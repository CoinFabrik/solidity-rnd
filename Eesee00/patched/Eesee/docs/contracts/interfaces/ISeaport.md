# ISeaport


## fulfillBasicOrder

```solidity
function fulfillBasicOrder(struct OpenseaStructs.BasicOrderParameters parameters) external payable returns (bool fulfilled)
```

Fulfill an order offering an ERC20, ERC721, or ERC1155 item by
        supplying Ether (or other native tokens), ERC20 tokens, an ERC721
        item, or an ERC1155 item as consideration. Six permutations are
        supported: Native token to ERC721, Native token to ERC1155, ERC20
        to ERC721, ERC20 to ERC1155, ERC721 to ERC20, and ERC1155 to
        ERC20 (with native tokens supplied as msg.value). For an order to
        be eligible for fulfillment via this method, it must contain a
        single offer item (though that item may have a greater amount if
        the item is not an ERC721). An arbitrary number of "additional
        recipients" may also be supplied which will each receive native
        tokens or ERC20 items from the fulfiller as consideration. Refer
        to the documentation for a more comprehensive summary of how to
        utilize this method and what orders are compatible with it.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parameters | struct OpenseaStructs.BasicOrderParameters | Additional information on the fulfilled order. Note                   that the offerer and the fulfiller must first approve                   this contract (or their chosen conduit if indicated)                   before any tokens can be transferred. Also note that                   contract recipients of ERC1155 consideration items must                   implement `onERC1155Received` to receive those items. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| fulfilled | bool | A boolean indicating whether the order has been                   successfully fulfilled. |

## information

```solidity
function information() external view returns (string version, bytes32 domainSeparator, address conduitController)
```

Retrieve configuration information for this contract.

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| version | string | The contract version. |
| domainSeparator | bytes32 | The domain separator for this contract. |
| conduitController | address | The conduit Controller set for this contract. |


