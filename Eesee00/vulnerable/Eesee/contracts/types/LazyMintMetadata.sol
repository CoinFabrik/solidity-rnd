// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

struct LazyMintCollectionMetadata {
    string name;
    string symbol;
    string contractURI;
}

struct LazyMintTokenMetadata {
    string URI;
    address royaltyReceiver;
    uint96 royaltyFeeNumerator;
}