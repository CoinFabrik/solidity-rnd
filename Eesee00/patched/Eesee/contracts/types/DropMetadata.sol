// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

struct DropMetadata {
    string name;
    string symbol;
    string baseURI;
    string revealedURI;
    string contractURI;
    address royaltyReceiver;
    uint96 royaltyFeeNumerator;
}