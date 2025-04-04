// Copyright (c) 2023 Apple Inc. Licensed under MIT License.

import { Data, DataValidator } from "./Data.ts";
import { DecodedSignedData } from "./DecodedSignedData.ts";
import { ExternalPurchaseToken, ExternalPurchaseTokenValidator } from "./ExternalPurchaseToken.ts";
import { NotificationTypeV2, NotificationTypeV2Validator } from "./NotificationTypeV2.ts";
import { Subtype, SubtypeValidator } from "./Subtype.ts";
import { Summary, SummaryValidator } from "./Summary.ts";
import { Validator } from "./Validator.ts";

/**
 * A decoded payload containing the version 2 notification data.
 *
 * {@link https://developer.apple.com/documentation/appstoreservernotifications/responsebodyv2decodedpayload ResponseBodyV2DecodedPayload}
 */
export interface ResponseBodyV2DecodedPayload extends DecodedSignedData {
        
    /**
     * The in-app purchase event for which the App Store sends this version 2 notification.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/notificationtype notificationType}
     **/
    notificationType?: NotificationTypeV2 | string;
        
    /**
     * Additional information that identifies the notification event. The subtype field is present only for specific version 2 notifications.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/subtype subtype}
     **/
    subtype?: Subtype | string
        
    /**
     * A unique identifier for the notification.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/notificationuuid notificationUUID}
     **/
    notificationUUID?: string
        
    /**
     * The object that contains the app metadata and signed renewal and transaction information.
     * The data, summary, and externalPurchaseToken fields are mutually exclusive. The payload contains only one of these fields.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/data data}
     **/
    data?: Data
        
    /**
     * A string that indicates the notification’s App Store Server Notifications version number.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/version version}
     **/
    version?: string
        
    /**
     * The UNIX time, in milliseconds, that the App Store signed the JSON Web Signature data.
     *
     * {@link https://developer.apple.com/documentation/appstoreserverapi/signeddate signedDate}
     **/
    signedDate?: number
        
    /**
     * The summary data that appears when the App Store server completes your request to extend a subscription renewal date for eligible subscribers.
     * The data, summary, and externalPurchaseToken fields are mutually exclusive. The payload contains only one of these fields.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/summary summary}
     **/
    summary?: Summary

    /**
     * This field appears when the notificationType is EXTERNAL_PURCHASE_TOKEN.
     * The data, summary, and externalPurchaseToken fields are mutually exclusive. The payload contains only one of these fields.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/externalpurchasetoken externalPurchaseToken}
     **/
    externalPurchaseToken?: ExternalPurchaseToken
}


export class ResponseBodyV2DecodedPayloadValidator implements Validator<ResponseBodyV2DecodedPayload> {
    static readonly notificationTypeValidator = new NotificationTypeV2Validator()
    static readonly subtypeValidator = new SubtypeValidator()
    static readonly dataValidator = new DataValidator()
    static readonly summaryValidator = new SummaryValidator()
    static readonly externalPurchaseTokenValidator = new ExternalPurchaseTokenValidator()
    validate(obj: any): obj is ResponseBodyV2DecodedPayload {
        if ((typeof obj['notificationType'] !== 'undefined') && !(ResponseBodyV2DecodedPayloadValidator.notificationTypeValidator.validate(obj['notificationType']))) {
            return false
        }
        if ((typeof obj['subtype'] !== 'undefined') && !(ResponseBodyV2DecodedPayloadValidator.subtypeValidator.validate(obj['subtype']))) {
            return false
        }
        if ((typeof obj['notificationUUID'] !== 'undefined') && !(typeof obj['notificationUUID'] === "string" || obj['notificationUUID'] instanceof String)) {
            return false
        }
        if ((typeof obj['data'] !== 'undefined') && !(ResponseBodyV2DecodedPayloadValidator.dataValidator.validate(obj['data']))) {
            return false
        }
        if ((typeof obj['version'] !== 'undefined') && !(typeof obj['version'] === "string" || obj['version'] instanceof String)) {
            return false
        }
        if ((typeof obj['signedDate'] !== 'undefined') && !(typeof obj['signedDate'] === "number")) {
            return false
        }
        if ((typeof obj['summary'] !== 'undefined') && !(ResponseBodyV2DecodedPayloadValidator.summaryValidator.validate(obj['summary']))) {
            return false
        }
        if ((typeof obj['externalPurchaseToken'] !== 'undefined') && !(ResponseBodyV2DecodedPayloadValidator.externalPurchaseTokenValidator.validate(obj['externalPurchaseToken']))) {
            return false
        }
        return true
    }
}

