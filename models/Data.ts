// Copyright (c) 2023 Apple Inc. Licensed under MIT License.

import { ConsumptionRequestReason, ConsumptionRequestReasonValidator } from "./ConsumptionRequestReason.ts"
import { Environment, EnvironmentValidator } from "./Environment.ts"
import { Status, StatusValidator } from "./Status.ts"
import { Validator } from "./Validator.ts"

/**
 * The app metadata and the signed renewal and transaction information.
 *
 * {@link https://developer.apple.com/documentation/appstoreservernotifications/data data}
 */
export interface Data {

    /**
     * The server environment that the notification applies to, either sandbox or production.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/environment environment}
     **/
    environment?: Environment | string
        
    /**
     * The unique identifier of an app in the App Store.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/appappleid appAppleId}
     **/
    appAppleId?: number
        
    /**
     * The bundle identifier of an app.
     *
     * {@link https://developer.apple.com/documentation/appstoreserverapi/bundleid bundleId}
     **/
    bundleId?: string
        
    /**
     * The version of the build that identifies an iteration of the bundle.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/bundleversion bundleVersion}
     **/
    bundleVersion?: string
        
    /**
     * Transaction information signed by the App Store, in JSON Web Signature (JWS) format.
     *
     * {@link https://developer.apple.com/documentation/appstoreserverapi/jwstransaction JWSTransaction}
     **/
    signedTransactionInfo?: string
        
    /**
     * Subscription renewal information, signed by the App Store, in JSON Web Signature (JWS) format.
     *
     * {@link https://developer.apple.com/documentation/appstoreserverapi/jwsrenewalinfo JWSRenewalInfo}
     **/
    signedRenewalInfo?: string

    /**
     * The status of an auto-renewable subscription as of the signedDate in the responseBodyV2DecodedPayload.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/status status}
     **/
    status?: Status | number

    /**
     * The reason the customer requested the refund.
     *
     * {@link https://developer.apple.com/documentation/appstoreservernotifications/consumptionrequestreason consumptionRequestReason}
     **/
    consumptionRequestReason?: ConsumptionRequestReason | string
}


export class DataValidator implements Validator<Data> {
    static readonly environmentValidator = new EnvironmentValidator()
    static readonly statusValidator = new StatusValidator()
    static readonly consumptionRequestReasonValidator = new ConsumptionRequestReasonValidator()
    validate(obj: any): obj is Data {
        if ((typeof obj['environment'] !== 'undefined') && !(DataValidator.environmentValidator.validate(obj['environment']))) {
            return false
        }
        if ((typeof obj['appAppleId'] !== 'undefined') && !(typeof obj['appAppleId'] === "number")) {
            return false
        }
        if ((typeof obj['bundleId'] !== 'undefined') && !(typeof obj['bundleId'] === "string" || obj['bundleId'] instanceof String)) {
            return false
        }
        if ((typeof obj['bundleVersion'] !== 'undefined') && !(typeof obj['bundleVersion'] === "string" || obj['bundleVersion'] instanceof String)) {
            return false
        }
        if ((typeof obj['signedTransactionInfo'] !== 'undefined') && !(typeof obj['signedTransactionInfo'] === "string" || obj['signedTransactionInfo'] instanceof String)) {
            return false
        }
        if ((typeof obj['signedRenewalInfo'] !== 'undefined') && !(typeof obj['signedRenewalInfo'] === "string" || obj['signedRenewalInfo'] instanceof String)) {
            return false
        }
        if ((typeof obj['status'] !== 'undefined') && !(DataValidator.statusValidator.validate(obj['status']))) {
            return false
        }
        if ((typeof obj['consumptionRequestReason'] !== 'undefined') && !(DataValidator.consumptionRequestReasonValidator.validate(obj['consumptionRequestReason']))) {
            return false
        }
        return true
    }
}
