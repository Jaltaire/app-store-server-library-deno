// Copyright (c) 2023 Apple Inc. Licensed under MIT License.

import { NumberValidator } from "./Validator.ts";

/**
 * A value that indicates the extent to which the customer consumed the in-app purchase.
 *
 * {@link https://developer.apple.com/documentation/appstoreserverapi/consumptionstatus consumptionStatus}
 */
export enum ConsumptionStatus {
    UNDECLARED = 0,
    NOT_CONSUMED = 1,
    PARTIALLY_CONSUMED = 2,
    FULLY_CONSUMED = 3,
}

export class ConsumptionStatusValidator extends NumberValidator {}