// Copyright (c) 2023 Apple Inc. Licensed under MIT License.

import { NumberValidator } from "./Validator.ts";

/**
 * A value that indicates whether the app successfully delivered an in-app purchase that works properly.
 *
 * {@link https://developer.apple.com/documentation/appstoreserverapi/deliverystatus deliveryStatus}
 */
export enum DeliveryStatus {
    DELIVERED_AND_WORKING_PROPERLY = 0,
    DID_NOT_DELIVER_DUE_TO_QUALITY_ISSUE = 1,
    DELIVERED_WRONG_ITEM = 2,
    DID_NOT_DELIVER_DUE_TO_SERVER_OUTAGE = 3,
    DID_NOT_DELIVER_DUE_TO_IN_GAME_CURRENCY_CHANGE = 4,
    DID_NOT_DELIVER_FOR_OTHER_REASON = 5,
}

export class DeliveryStatusValidator extends NumberValidator {}