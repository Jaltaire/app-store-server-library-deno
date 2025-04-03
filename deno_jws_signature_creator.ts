// Copyright (c) 2023 Apple Inc. Licensed under MIT License.

import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

/**
 * A request for an introductory offer eligibility check.
 */
export interface AdvancedCommerceInAppRequest {
    /**
     * The transaction_identifier of the in-app purchase the user purchased.
     */
    transactionId: string;

    /**
     * The UUID of the parent offer your app generated in the app.
     */
    offerId: string;

    /**
     * The RFC-3339 timestamp when the request was signed.
     */
    timestamp: string;
}

/**
 * A utility for generating a signature for App Store Server Notifications V2 and StoreKit 2 testing in Xcode.
 * See https://developer.apple.com/documentation/storekit/in-app_purchase/generating_a_signature_for_introductory_offers_and_refunds
 */
export class AdvancedCommerceInAppSignatureCreator {
    private keyId: string;
    private issuerId: string;
    private privateKey: CryptoKey;
    private bundleId: string;

    /**
     * 
     * @param keyId Your private key ID from App Store Connect
     * @param issuerId Your issuer ID from the Keys page in App Store Connect
     * @param privateKey Your private key downloaded from App Store Connect, as a buffer
     * @param bundleId Your app's bundle ID
     */
    constructor(keyId: string, issuerId: string, privateKey: CryptoKey, bundleId: string) {
        this.keyId = keyId;
        this.issuerId = issuerId;
        this.privateKey = privateKey;
        this.bundleId = bundleId;
    }

    /**
     * Create a signature for an in-app purchase refund request that is available via Settings and StoreKit.
     * 
     * @param originalTransactionId The original transaction id of the transaction to refund.
     * @returns A base64 encoded signature to pass to the App Store along with the originalTransactionId.
     */
    public async createRefundRequestSignature(originalTransactionId: string): Promise<string> {
        const now = new Date().toISOString();
        return await this.createAdvancedCommerceTokenForTransactionId(originalTransactionId, now);
    }

    /**
     * Create a signature for an advanced commerce in app request.
     * 
     * @param request The request containing details for generating the signature.
     * @returns A base64 encoded signature to pass to the App Store along with the request.
     */
    public async createAdvancedCommerceRequest(request: AdvancedCommerceInAppRequest): Promise<string> {
        const payload = {
            transactionId: request.transactionId,
            offerId: request.offerId,
            timestamp: request.timestamp
        };
        
        return await this.createSignature(payload);
    }

    private async createAdvancedCommerceTokenForTransactionId(transactionId: string, timestamp: string): Promise<string> {
        const payload = {
            transactionId: transactionId,
            timestamp: timestamp
        };
        
        return await this.createSignature(payload);
    }

    private async createSignature(payload: object): Promise<string> {
        const header = {
            alg: "ES256",
            kid: this.keyId,
            typ: "JWT"
        };
        
        const combinedPayload = {
            ...payload,
            bid: this.bundleId,
            iss: this.issuerId
        };
        
        // Create JWT token
        return await create(header, combinedPayload, this.privateKey);
    }
}

/**
 * A utility for generating a signature for customer introductory offer eligibility.
 * See https://developer.apple.com/documentation/storekit/in-app_purchase/subscriptions_and_offers/determining_eligibility_for_promotional_offers
 */
export class IntroductoryOfferEligibilitySignatureCreator {
    private keyId: string;
    private issuerId: string;
    private privateKey: CryptoKey;
    private bundleId: string;
    private appAppleId: number;
    
    /**
     * 
     * @param keyId Your private key ID from App Store Connect
     * @param issuerId Your issuer ID from the Keys page in App Store Connect
     * @param privateKey Your private key downloaded from App Store Connect, as a buffer
     * @param bundleId Your app's bundle ID
     * @param appAppleId Your app's Apple ID from App Store Connect
     */
    constructor(keyId: string, issuerId: string, privateKey: CryptoKey, bundleId: string, appAppleId: number) {
        this.keyId = keyId;
        this.issuerId = issuerId;
        this.privateKey = privateKey;
        this.bundleId = bundleId;
        this.appAppleId = appAppleId;
    }

    /**
     * Create a signature that can be used to determine eligibility for introductory offers.
     * 
     * @param appAccountToken The app account token (UUID String) of the user.
     * @param applicationUsername The applicationUsername (UUID String) of the user.
     * @returns A base64 encoded signature to pass to the App Store along with the appAccountToken and applicationUsername.
     */
    public async createSignature(appAccountToken?: string, applicationUsername?: string): Promise<string> {
        if (!appAccountToken && !applicationUsername) {
            throw new Error("Either appAccountToken or applicationUsername must be provided.");
        }
        
        const payload: Record<string, any> = {
            bid: this.bundleId,
            iss: this.issuerId,
            aid: this.appAppleId.toString()
        };
        
        if (appAccountToken) {
            payload.iat = appAccountToken;
        }
        
        if (applicationUsername) {
            payload.nonce = applicationUsername;
        }
        
        const header = {
            alg: "ES256",
            kid: this.keyId,
            typ: "JWT"
        };
        
        // Create JWT token
        return await create(header, payload, this.privateKey);
    }
}

/**
 * A utility for generating a signature for promotional offers.
 * See https://developer.apple.com/documentation/storekit/in-app_purchase/subscriptions_and_offers/generating_a_signature_for_subscription_offers
 */
export class PromotionalOfferV2SignatureCreator {
    private keyId: string;
    private issuerId: string;
    private privateKey: CryptoKey;
    private bundleId: string;
    
    /**
     * 
     * @param keyId Your private key ID from App Store Connect
     * @param issuerId Your issuer ID from the Keys page in App Store Connect
     * @param privateKey Your private key downloaded from App Store Connect, as a buffer
     * @param bundleId Your app's bundle ID
     */
    constructor(keyId: string, issuerId: string, privateKey: CryptoKey, bundleId: string) {
        this.keyId = keyId;
        this.issuerId = issuerId;
        this.privateKey = privateKey;
        this.bundleId = bundleId;
    }

    /**
     * Create a signature that can be used for a promotional offer for new or upgrading customers.
     * 
     * @param productIdentifier The product identifier of the subscription to offer
     * @param subscriptionOfferID The ID of a specific offer you've configured for this product in App Store Connect
     * @param applicationUsername An optional opaque value that identifies the user's account in your system
     * @param nonce A UUID value that you create
     * @param timestamp The current time in milliseconds since 1970, UTC
     * @param keyIdentifier The UUID which identifies a specific subscription
     * @returns A base64 encoded signature to pass to the App Store along with the other parameters.
     */
    public async createSignature(
        productIdentifier: string,
        subscriptionOfferID: string,
        applicationUsername: string | null,
        nonce: string,
        timestamp: number,
        keyIdentifier: string
    ): Promise<string> {
        const payload: Record<string, any> = {
            bid: this.bundleId,
            iss: this.issuerId,
            pid: productIdentifier,
            oid: subscriptionOfferID,
            timestamp: timestamp,
            nonce: nonce,
            kid: keyIdentifier
        };
        
        if (applicationUsername) {
            payload.appAccountToken = applicationUsername;
        }
        
        const header = {
            alg: "ES256",
            kid: this.keyId,
            typ: "JWT"
        };
        
        // Create JWT token
        return await create(header, payload, this.privateKey);
    }
} 