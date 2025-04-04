// Copyright (c) 2023 Apple Inc. Licensed under MIT License.

// Deno compatibility version

import { CheckTestNotificationResponse, CheckTestNotificationResponseValidator } from './models/CheckTestNotificationResponse';
import { ConsumptionRequest } from './models/ConsumptionRequest.ts';
import { Environment } from './models/Environment.ts';
import { ExtendRenewalDateRequest } from './models/ExtendRenewalDateRequest.ts';
import { ExtendRenewalDateResponse, ExtendRenewalDateResponseValidator } from './models/ExtendRenewalDateResponse.ts';
import { HistoryResponse, HistoryResponseValidator } from './models/HistoryResponse.ts';
import { MassExtendRenewalDateRequest } from './models/MassExtendRenewalDateRequest.ts';
import { MassExtendRenewalDateResponse, MassExtendRenewalDateResponseValidator } from './models/MassExtendRenewalDateResponse.ts';
import { MassExtendRenewalDateStatusResponse, MassExtendRenewalDateStatusResponseValidator } from './models/MassExtendRenewalDateStatusResponse.ts';
import { OrderLookupResponse, OrderLookupResponseValidator } from './models/OrderLookupResponse.ts';
import { RefundHistoryResponse, RefundHistoryResponseValidator } from './models/RefundHistoryResponse.ts';
import { SendTestNotificationResponse, SendTestNotificationResponseValidator } from './models/SendTestNotificationResponse.ts';
import { StatusResponse, StatusResponseValidator } from './models/StatusResponse.ts';
import { TransactionHistoryRequest } from './models/TransactionHistoryRequest.ts';
import { TransactionInfoResponse, TransactionInfoResponseValidator } from './models/TransactionInfoResponse.ts';
import { Validator } from './models/Validator.ts';
import { Status } from './models/Status.ts';
export { SignedDataVerifier, VerificationException, VerificationStatus } from './deno_jws_verification.ts'
export { ReceiptUtility } from './receipt_utility.ts'
export { AccountTenure } from "./models/AccountTenure.ts"
export { AutoRenewStatus } from './models/AutoRenewStatus.ts'
export { CheckTestNotificationResponse, CheckTestNotificationResponseValidator } from './models/CheckTestNotificationResponse'
export { ConsumptionRequest } from './models/ConsumptionRequest.ts'
export { ConsumptionStatus } from './models/ConsumptionStatus.ts'
export { Data } from './models/Data.ts'
export { DeliveryStatus } from './models/DeliveryStatus.ts'
export { Environment } from './models/Environment.ts'
export { ExpirationIntent } from './models/ExpirationIntent.ts'
export { ExtendReasonCode } from './models/ExtendReasonCode.ts'
export { ExtendRenewalDateRequest } from './models/ExtendRenewalDateRequest.ts'
export { ExtendRenewalDateResponse } from './models/ExtendRenewalDateResponse.ts'
export { SendAttemptResult } from './models/SendAttemptResult.ts'
export { SendAttemptItem } from './models/SendAttemptItem.ts'
export { HistoryResponse } from './models/HistoryResponse.ts'
export { InAppOwnershipType } from './models/InAppOwnershipType.ts'
export { JWSRenewalInfoDecodedPayload } from './models/JWSRenewalInfoDecodedPayload.ts'
export { JWSTransactionDecodedPayload } from './models/JWSTransactionDecodedPayload.ts'
export { LastTransactionsItem } from './models/LastTransactionsItem.ts'
export { LifetimeDollarsPurchased } from './models/LifetimeDollarsPurchased.ts'
export { LifetimeDollarsRefunded } from './models/LifetimeDollarsRefunded.ts'
export { MassExtendRenewalDateRequest } from './models/MassExtendRenewalDateRequest.ts'
export { MassExtendRenewalDateResponse } from './models/MassExtendRenewalDateResponse.ts'
export { MassExtendRenewalDateStatusResponse } from './models/MassExtendRenewalDateStatusResponse.ts'
export { NotificationHistoryRequest } from './models/NotificationHistoryRequest.ts'
export { NotificationHistoryResponse } from './models/NotificationHistoryResponse.ts'
export { NotificationHistoryResponseItem } from './models/NotificationHistoryResponseItem.ts'
export { NotificationTypeV2 } from './models/NotificationTypeV2.ts'
export { OfferType } from './models/OfferType.ts'
export { OfferDiscountType } from './models/OfferDiscountType.ts'
export { OrderLookupResponse } from './models/OrderLookupResponse.ts'
export { OrderLookupStatus } from './models/OrderLookupStatus.ts'
export { Platform } from './models/Platform.ts'
export { PlayTime } from './models/PlayTime.ts'
export { PriceIncreaseStatus } from './models/PriceIncreaseStatus.ts'
export { PurchasePlatform } from './models/PurchasePlatform.ts'
export { RefundHistoryResponse } from './models/RefundHistoryResponse.ts'
export { ResponseBodyV2 } from './models/ResponseBodyV2.ts'
export { ResponseBodyV2DecodedPayload } from './models/ResponseBodyV2DecodedPayload.ts'
export { RevocationReason } from './models/RevocationReason.ts'
export { SendTestNotificationResponse } from './models/SendTestNotificationResponse.ts'
export { Status } from './models/Status.ts'
export { StatusResponse } from './models/StatusResponse.ts'
export { SubscriptionGroupIdentifierItem } from './models/SubscriptionGroupIdentifierItem.ts'
export { Subtype } from './models/Subtype.ts'
export { Summary } from './models/Summary.ts'
export { TransactionHistoryRequest, Order, ProductType } from './models/TransactionHistoryRequest.ts'
export { TransactionInfoResponse } from './models/TransactionInfoResponse.ts'
export { TransactionReason } from './models/TransactionReason.ts'
export { Type } from './models/Type.ts'
export { UserStatus } from './models/UserStatus.ts'
export { PromotionalOfferSignatureCreator } from './promotional_offer.ts'
export { PromotionalOfferV2SignatureCreator, AdvancedCommerceInAppSignatureCreator, AdvancedCommerceInAppRequest, IntroductoryOfferEligibilitySignatureCreator } from './deno_jws_signature_creator.ts'
export { DecodedSignedData } from './models/DecodedSignedData.ts'
export { AppTransaction } from './models/AppTransaction.ts'

import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { NotificationHistoryRequest } from './models/NotificationHistoryRequest.ts';
import { NotificationHistoryResponse, NotificationHistoryResponseValidator } from './models/NotificationHistoryResponse.ts';

export class AppStoreServerAPIClient {
    private static PRODUCTION_URL = "https://api.storekit.itunes.apple.com";
    private static SANDBOX_URL = "https://api.storekit-sandbox.itunes.apple.com";
    private static LOCAL_TESTING_URL = "https://local-testing-base-url";
    private static USER_AGENT = "app-store-server-library/deno/1.5.0";

    private issuerId: string
    private keyId: string
    private signingKey: string
    private bundleId: string
    private urlBase: string

    /**
     * Create an App Store Server API client
     * @param signingKey Your private key downloaded from App Store Connect
     * @param keyId Your private key ID from App Store Connect
     * @param issuerId Your issuer ID from the Keys page in App Store Connect
     * @param bundleId Your app's bundle ID
     * @param environment The environment to target
     */
    public constructor(signingKey: string, keyId: string, issuerId: string, bundleId: string, environment: Environment) {
        this.issuerId = issuerId
        this.keyId = keyId
        this.bundleId = bundleId
        this.signingKey = signingKey
        switch(environment) {
            case Environment.XCODE:
                throw new Error("Xcode is not a supported environment for an AppStoreServerAPIClient")
            case Environment.PRODUCTION:
                this.urlBase = AppStoreServerAPIClient.PRODUCTION_URL
                break
            case Environment.LOCAL_TESTING:
                this.urlBase = AppStoreServerAPIClient.LOCAL_TESTING_URL
                break
            case Environment.SANDBOX:
                this.urlBase = AppStoreServerAPIClient.SANDBOX_URL
                break
        }
    }

    protected async makeRequest<T>(path: string, method: string, queryParameters: { [key: string]: string[]}, body: object | null, validator: Validator<T> | null): Promise<T> {
        const headers: { [key: string]: string } = {
            'User-Agent': AppStoreServerAPIClient.USER_AGENT,
            'Authorization': 'Bearer ' + this.createBearerToken(),
            'Accept': 'application/json',
        }
        const params = new URLSearchParams()
        for (const queryParam in queryParameters) {
            for (const queryVal of queryParameters[queryParam]) {
                params.append(queryParam, queryVal)
            }
        }
        let stringBody = undefined
        if (body != null) {
            stringBody = JSON.stringify(body)
            headers['Content-Type'] = 'application/json'
        }

        const response = await this.makeFetchRequest(path, params, method, stringBody, headers)

        if(response.ok) {
            // Success
            if (validator == null) {
                return null as T
            }

            const responseBody = await response.json()

            if (!validator.validate(responseBody)) {
                throw new Error("Unexpected response body format")
            }

            return responseBody
        }

        try {
            const responseBody = await response.json()
            const errorCode = responseBody['errorCode']
            const errorMessage = responseBody['errorMessage']

            if (errorCode) {
                throw new APIException(response.status, errorCode, errorMessage)
            }

            throw new APIException(response.status)
        } catch (e) {
            if (e instanceof APIException) {
                throw e
            }

            throw new APIException(response.status)
        }
    }

    protected async makeFetchRequest(path: string, parsedQueryParameters: URLSearchParams, method: string, stringBody: string | undefined, headers: { [key: string]: string; }) {
        return await fetch(this.urlBase + path + '?' + parsedQueryParameters, {
            method: method,
            body: stringBody,
            headers: headers
        });
    }

    /**
     * Uses a subscription's product identifier to extend the renewal date for all of its eligible active subscribers.
     *
     * @param massExtendRenewalDateRequest The request body for extending a subscription renewal date for all of its active subscribers.
     * @return A response that indicates the server successfully received the subscription-renewal-date extension request.
     * @throws APIException If a response was returned indicating the request could not be processed
     * {@link https://developer.apple.com/documentation/appstoreserverapi/extend_subscription_renewal_dates_for_all_active_subscribers Extend Subscription Renewal Dates for All Active Subscribers}
     */
    public async extendRenewalDateForAllActiveSubscribers(massExtendRenewalDateRequest: MassExtendRenewalDateRequest): Promise<MassExtendRenewalDateResponse> {
        return await this.makeRequest("/inApps/v1/subscriptions/extend/mass", "POST", {}, massExtendRenewalDateRequest, new MassExtendRenewalDateResponseValidator());
    }

    /**
     * Extends the renewal date of a customer's active subscription using the original transaction identifier.
     *
     * @param originalTransactionId The original transaction identifier of the subscription receiving a renewal date extension
     * @param extendRenewalDateRequest The request body containing the details of the subscription-renewal-date extension
     * @return A response that indicates whether an individual renewal-date extension succeeded, and related details
     * @throws APIException If a response was returned indicating the request could not be processed
     * {@link https://developer.apple.com/documentation/appstoreserverapi/extend_a_subscription_renewal_date Extend a Subscription Renewal Date}
     */
    public async extendSubscriptionRenewalDate(originalTransactionId: string, extendRenewalDateRequest: ExtendRenewalDateRequest): Promise<ExtendRenewalDateResponse> {
        return await this.makeRequest("/inApps/v1/subscriptions/extend/" + originalTransactionId, "PUT", {}, extendRenewalDateRequest, new ExtendRenewalDateResponseValidator());
    }

    // ... Additional methods would follow here ...

    private createBearerToken(): string {
        const now = Math.floor(Date.now() / 1000);
        
        const payload = {
            iss: this.issuerId,
            iat: now,
            exp: now + 3600,
            aud: "appstoreconnect-v1",
            bid: this.bundleId
        };

        // Implement with Deno JWT
        // Note: In a real implementation you'd need to properly parse the PEM key
        // This is a placeholder and would need to be properly implemented
        const key = this.signingKey;
        
        // This is a simplified placeholder - actual implementation would use Deno.crypto
        // to create the JWT properly with the provided key
        return create({ alg: "ES256", kid: this.keyId, typ: "JWT" }, payload, key);
    }
}

export class APIException extends Error {
    public httpStatusCode: number
    public apiError: number | APIError | null
    public errorMessage: string | null

    constructor(httpStatusCode: number, apiError: number | null = null, errorMessage: string | null = null) {
        super(errorMessage ?? "Server returned status code " + httpStatusCode + (apiError ? " and API error " + apiError : ""))
        this.httpStatusCode = httpStatusCode
        this.apiError = apiError
        this.errorMessage = errorMessage
    }
}

export enum APIError {
    // Same as original APIError enum
    GENERAL_BAD_REQUEST = 4000000,
    INVALID_APP_IDENTIFIER = 4000002,
    INVALID_REQUEST_REVISION = 4000005,
    INVALID_TRANSACTION_ID = 4000006,
    INVALID_ORIGINAL_TRANSACTION_ID = 4000008,
    INVALID_EXTEND_BY_DAYS = 4000009,
    INVALID_EXTEND_REASON_CODE = 4000010,
    INVALID_REQUEST_IDENTIFIER = 4000011,
    START_DATE_TOO_FAR_IN_PAST = 4000012,
    START_DATE_AFTER_END_DATE = 4000013,
    INVALID_PAGINATION_TOKEN = 4000014,
    INVALID_START_DATE = 4000015,
    INVALID_END_DATE = 4000016,
    PAGINATION_TOKEN_EXPIRED = 4000017,
    INVALID_NOTIFICATION_TYPE = 4000018,
    MULTIPLE_FILTERS_SUPPLIED = 4000019,
    INVALID_TEST_NOTIFICATION_TOKEN = 4000020,
    INVALID_SORT = 4000021,
    INVALID_PRODUCT_TYPE = 4000022,
    INVALID_PRODUCT_ID = 4000023,
    INVALID_SUBSCRIPTION_GROUP_IDENTIFIER = 4000024,
    INVALID_EXCLUDE_REVOKED = 4000025,
    INVALID_IN_APP_OWNERSHIP_TYPE = 4000026,
    INVALID_EMPTY_STOREFRONT_COUNTRY_CODE_LIST = 4000027,
    INVALID_STOREFRONT_COUNTRY_CODE = 4000028,
    INVALID_REVOKED = 4000030,
    INVALID_STATUS = 4000031,
    INVALID_ACCOUNT_TENURE = 4000032,
    INVALID_APP_ACCOUNT_TOKEN = 4000033,
    INVALID_CONSUMPTION_STATUS = 4000034,
    INVALID_CUSTOMER_CONSENTED = 4000035,
    INVALID_DELIVERY_STATUS = 4000036,
    INVALID_LIFETIME_DOLLARS_PURCHASED = 4000037,
    INVALID_LIFETIME_DOLLARS_REFUNDED = 4000038,
    INVALID_PLATFORM = 4000039,
    INVALID_PLAY_TIME = 4000040,
    INVALID_SAMPLE_CONTENT_PROVIDED = 4000041,
    INVALID_USER_STATUS = 4000042,
    INVALID_TRANSACTION_NOT_CONSUMABLE = 4000043,
    INVALID_TRANSACTION_TYPE_NOT_SUPPORTED = 4000047,
    APP_TRANSACTION_ID_NOT_SUPPORTED_ERROR = 4000048,
    SUBSCRIPTION_EXTENSION_INELIGIBLE = 4030004,
    SUBSCRIPTION_MAX_EXTENSION = 4030005,
    FAMILY_SHARED_SUBSCRIPTION_EXTENSION_INELIGIBLE = 4030007,
    ACCOUNT_NOT_FOUND = 4040001,
    ACCOUNT_NOT_FOUND_RETRYABLE = 4040002,
    APP_NOT_FOUND = 4040003,
    APP_NOT_FOUND_RETRYABLE = 4040004,
    ORIGINAL_TRANSACTION_ID_NOT_FOUND = 4040005,
    ORIGINAL_TRANSACTION_ID_NOT_FOUND_RETRYABLE = 4040006,
    SERVER_NOTIFICATION_URL_NOT_FOUND = 4040007,
    TEST_NOTIFICATION_NOT_FOUND = 4040008,
    STATUS_REQUEST_NOT_FOUND = 4040009,
    TRANSACTION_ID_NOT_FOUND = 4040010,
    RATE_LIMIT_EXCEEDED = 4290000,
    GENERAL_INTERNAL = 5000000,
    GENERAL_INTERNAL_RETRYABLE = 5000001,
}

export enum GetTransactionHistoryVersion {
    /**
     * @deprecated
     */
    V1 = "v1",
    V2 = "v2",
} 