// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

library LibDirectTransfer { //LibDirectTransfers
    /*All buy parameters need for creating buyOrder and sellOrder*/
    struct Purchase {
        address sellOrderMaker;
        uint256 sellOrderNftAmount;
        bytes4 nftAssetClass;
        bytes nftData;
        uint256 sellOrderPaymentAmount;
        address paymentToken;
        uint256 sellOrderSalt;
        uint sellOrderStart;
        uint sellOrderEnd;
        bytes4 sellOrderDataType;
        bytes sellOrderData;
        bytes sellOrderSignature;

        uint256 buyOrderPaymentAmount;
        uint256 buyOrderNftAmount;
        bytes buyOrderData;
    }

    struct Part {
        address payable account;
        uint96 value;
    }

    struct DataV1 {
        Part[] payouts;
        Part[] originFees;
    }

    struct DataV2 {
        Part[] payouts;
        Part[] originFees;
        bool isMakeFill;
    }

    struct DataV3_BUY {
        uint payouts;
        uint originFeeFirst;
        uint originFeeSecond;
        bytes32 marketplaceMarker;
    }

    struct DataV3_SELL {
        uint payouts;
        uint originFeeFirst;
        uint originFeeSecond;
        uint maxFeesBasePoint;
        bytes32 marketplaceMarker;
    }
}