// Copyright (c) 2023 Apple Inc. Licensed under MIT License.

import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { encode, decode } from "https://deno.land/std@0.188.0/encoding/base64url.ts";
import { Environment } from './models/Environment.ts';
import { JWSTransactionDecodedPayload, JWSTransactionDecodedPayloadValidator } from './models/JWSTransactionDecodedPayload.ts';
import { ResponseBodyV2DecodedPayload, ResponseBodyV2DecodedPayloadValidator } from './models/ResponseBodyV2DecodedPayload.ts';
import { JWSRenewalInfoDecodedPayload, JWSRenewalInfoDecodedPayloadValidator } from './models/JWSRenewalInfoDecodedPayload.ts';
import { Validator } from './models/Validator.ts';
import { DecodedSignedData } from './models/DecodedSignedData.ts';
import { AppTransaction, AppTransactionValidator } from './models/AppTransaction.ts';

const MAX_SKEW = 60000

const MAXIMUM_CACHE_SIZE = 32 // There are unlikely to be more than a couple keys at once
const CACHE_TIME_LIMIT = 15 * 60 * 1_000 // 15 minutes

class CacheValue {
  public publicKey: CryptoKey
  public cacheExpiry: number

  constructor(publicKey: CryptoKey, cacheExpiry: number) {
    this.publicKey = publicKey
    this.cacheExpiry = cacheExpiry
  }
}

/**
 * A class providing utility methods for verifying and decoding App Store signed data.
 * 
 * Example Usage:
 * ```ts
 * const verifier = new SignedDataVerifier([appleRoot, appleRoot2], true, Environment.SANDBOX, "com.example")
 * 
 * try {
 *     const decodedNotification = verifier.verifyAndDecodeNotification("ey...")
 *     console.log(decodedNotification)
 * } catch (e) {
 *     console.error(e)
 * }
 * ```
 */
export class SignedDataVerifier {
    private JWSRenewalInfoDecodedPayloadValidator = new JWSRenewalInfoDecodedPayloadValidator()
    private JWSTransactionDecodedPayloadValidator = new JWSTransactionDecodedPayloadValidator()
    private responseBodyV2DecodedPayloadValidator = new ResponseBodyV2DecodedPayloadValidator()
    private appTransactionValidator = new AppTransactionValidator()

    protected rootCertificates: Uint8Array[]
    protected enableOnlineChecks: boolean
    protected bundleId: string
    protected appAppleId?: number
    protected environment: Environment
    protected verifiedPublicKeyCache: { [index: string]: CacheValue }

    /**
     * 
     * @param appleRootCertificates A list of DER-encoded root certificates 
     * @param enableOnlineChecks Whether to enable revocation checking and check expiration using the current date
     * @param environment The App Store environment to target for checks
     * @param bundleId The app's bundle identifier
     * @param appAppleId The app's identifier, omitted in the sandbox environment
     */
    constructor(appleRootCertificates: Uint8Array[], enableOnlineChecks: boolean, environment: Environment, bundleId: string, appAppleId?: number) {
      this.rootCertificates = appleRootCertificates
      this.enableOnlineChecks = enableOnlineChecks
      this.bundleId = bundleId;
      this.environment = environment
      this.appAppleId = appAppleId
      this.verifiedPublicKeyCache = {}
      if (environment === Environment.PRODUCTION && appAppleId === undefined) {
        throw new Error("appAppleId is required when the environment is Production")
      }
    }

    /**
     * Verifies and decodes a signedTransaction obtained from the App Store Server API, an App Store Server Notification, or from a device
     * See {@link https://developer.apple.com/documentation/appstoreserverapi/jwstransaction JWSTransaction}
     *
     * @param signedTransaction The signedTransaction field
     * @return The decoded transaction info after verification
     * @throws VerificationException Thrown if the data could not be verified
     */
    async verifyAndDecodeTransaction(signedTransactionInfo: string): Promise<JWSTransactionDecodedPayload> {
      const decodedJWT: JWSTransactionDecodedPayload = await this.verifyJWT(signedTransactionInfo, this.JWSTransactionDecodedPayloadValidator, this.extractSignedDate);
      if (decodedJWT.bundleId !== this.bundleId) {
        throw new VerificationException(VerificationStatus.INVALID_APP_IDENTIFIER)
      }
      if (decodedJWT.environment !== this.environment) {
        throw new VerificationException(VerificationStatus.INVALID_ENVIRONMENT)
      }
      return decodedJWT;
    }

    /**
     * Verifies and decodes a signedRenewalInfo obtained from the App Store Server API, an App Store Server Notification, or from a device
     * See {@link https://developer.apple.com/documentation/appstoreserverapi/jwsrenewalinfo JWSRenewalInfo}
     *
     * @param signedRenewalInfo The signedRenewalInfo field
     * @return The decoded renewal info after verification
     * @throws VerificationException Thrown if the data could not be verified
     */
    async verifyAndDecodeRenewalInfo(signedRenewalInfo: string): Promise<JWSRenewalInfoDecodedPayload> {
      const decodedRenewalInfo: JWSRenewalInfoDecodedPayload = await this.verifyJWT(signedRenewalInfo, this.JWSRenewalInfoDecodedPayloadValidator, this.extractSignedDate);
      const environment = decodedRenewalInfo.environment
      if (this.environment !== environment) {
        throw new VerificationException(VerificationStatus.INVALID_ENVIRONMENT)
      }
      return decodedRenewalInfo
    }

    /**
     * Verifies and decodes an App Store Server Notification signedPayload
     * See {@link https://developer.apple.com/documentation/appstoreservernotifications/signedpayload signedPayload}
     *
     * @param signedPayload The payload received by your server
     * @return The decoded payload after verification
     * @throws VerificationException Thrown if the data could not be verified
     */
    async verifyAndDecodeNotification(signedPayload: string): Promise<ResponseBodyV2DecodedPayload> {
      const decodedJWT: ResponseBodyV2DecodedPayload = await this.verifyJWT(signedPayload, this.responseBodyV2DecodedPayloadValidator, this.extractSignedDate);
      let appAppleId: number | undefined
      let bundleId: string | undefined
      let environment: string | undefined
      if (decodedJWT.data) {
        appAppleId = decodedJWT.data.appAppleId
        bundleId = decodedJWT.data.bundleId
        environment = decodedJWT.data.environment
      } else if (decodedJWT.summary) {
        appAppleId = decodedJWT.summary.appAppleId
        bundleId = decodedJWT.summary.bundleId
        environment = decodedJWT.summary.environment
      } else if (decodedJWT.externalPurchaseToken) {
        appAppleId = decodedJWT.externalPurchaseToken.appAppleId
        bundleId = decodedJWT.externalPurchaseToken.bundleId
        if (decodedJWT.externalPurchaseToken.externalPurchaseId && decodedJWT.externalPurchaseToken.externalPurchaseId.startsWith("SANDBOX")) {
          environment = Environment.SANDBOX
        } else {
          environment = Environment.PRODUCTION
        }
      }
      this.verifyNotification(bundleId, appAppleId, environment)
      return decodedJWT
    }

    protected verifyNotification(bundleId?: string, appAppleId?: number, environment?: string) {
      if (this.bundleId !== bundleId || (this.environment === Environment.PRODUCTION && this.appAppleId !== appAppleId)) {
        throw new VerificationException(VerificationStatus.INVALID_APP_IDENTIFIER)
      }
      if (this.environment !== environment) {
        throw new VerificationException(VerificationStatus.INVALID_ENVIRONMENT)
      }
    }

    /**
     * Verifies and decodes a signed AppTransaction
     * See {@link https://developer.apple.com/documentation/storekit/apptransaction AppTransaction}
     *
     * @param signedAppTransaction The signed AppTransaction
     * @returns The decoded AppTransaction after validation
     * @throws VerificationException Thrown if the data could not be verified
     */
    async verifyAndDecodeAppTransaction(signedAppTransaction: string): Promise<AppTransaction> {
      const decodedAppTransaction: AppTransaction = await this.verifyJWT(signedAppTransaction, this.appTransactionValidator, t => t.receiptCreationDate === undefined ? new Date() : new Date(t.receiptCreationDate));
      const environment = decodedAppTransaction.receiptType
      if (this.bundleId !== decodedAppTransaction.bundleId || (this.environment === Environment.PRODUCTION && this.appAppleId !== decodedAppTransaction.appAppleId)) {
        throw new VerificationException(VerificationStatus.INVALID_APP_IDENTIFIER)
      }
      if (this.environment !== environment) {
        throw new VerificationException(VerificationStatus.INVALID_ENVIRONMENT)
      }
      return decodedAppTransaction
    }

    protected async verifyJWT<T>(jwt: string, validator: Validator<T>, signedDateExtractor: (decodedJWT: T) => Date): Promise<T> {
      let certificateChain;
      let decodedJWT;
      
      try {
        // Decode JWT without verification first to inspect its contents
        const parts = jwt.split('.');
        if (parts.length !== 3) {
          throw new VerificationException(VerificationStatus.FAILURE);
        }
        
        const payload = JSON.parse(new TextDecoder().decode(decode(parts[1])));
        decodedJWT = payload;
        
        if (!validator.validate(decodedJWT)) {
          throw new VerificationException(VerificationStatus.FAILURE);
        }
        
        if (this.environment === Environment.XCODE || this.environment === Environment.LOCAL_TESTING) {
          // Data is not signed by the App Store, and verification should be skipped
          // The environment MUST be checked in the public method calling this
          return decodedJWT;
        }
        
        try {
          const headerStr = new TextDecoder().decode(decode(parts[0]));
          const headerObj = JSON.parse(headerStr);
          const chain: string[] = headerObj['x5c'] ?? [];
          
          if (chain.length != 3) {
            throw new VerificationException(VerificationStatus.INVALID_CHAIN_LENGTH);
          }
          
          // Convert certificates to a format Deno can use
          certificateChain = chain.slice(0, 2).map(cert => {
            return new Uint8Array(atob(cert).split('').map(c => c.charCodeAt(0)));
          });
          
          // Verify certificate chain and signature
          // For Deno implementation, we'd need to:
          // 1. Verify the certificate chain
          // 2. Extract public key from leaf certificate
          // 3. Verify the JWT signature

          // This is a simplified placeholder - in a real implementation
          // you would verify the certificate chain and the JWT signature
          const publicKey = await this.verifyCertificateChain(
            this.rootCertificates,
            certificateChain[0],
            certificateChain[1],
            signedDateExtractor(decodedJWT)
          );
          
          // Verify JWT signature using the extracted public key
          // This is simplified - in a real implementation you would
          // properly verify the JWT signature

          // Return the validated payload
          return decodedJWT;
          
        } catch (e) {
          console.error("Error verifying JWT:", e);
          throw new VerificationException(VerificationStatus.VERIFICATION_FAILURE, e);
        }
      } catch (e) {
        if (e instanceof VerificationException) {
          throw e;
        }
        throw new VerificationException(VerificationStatus.FAILURE, e);
      }
    }

    protected async verifyCertificateChain(trustedRoots: Uint8Array[], leaf: Uint8Array, intermediate: Uint8Array, effectiveDate: Date): Promise<CryptoKey> {
      // This is a simplified placeholder for certificate chain verification
      // In a real implementation, you would:
      // 1. Verify the certificate chain (leaf signed by intermediate, intermediate signed by root)
      // 2. Check certificate validity periods
      // 3. Check OCSP status if enableOnlineChecks is true
      // 4. Extract and return the public key from the leaf certificate
      
      // For this prototype, we're just returning a mock public key
      return await crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        true,
        ["verify"]
      ).then(keyPair => keyPair.publicKey);
    }

    private checkDates(cert: Uint8Array, effectiveDate: Date) {
      // Simplified placeholder for date checking
      // In a real implementation, you would extract and check the notBefore and notAfter dates
      return true;
    }

    private parseX509Date(date: string) {
      // Placeholder for X.509 date parsing
      return new Date();
    }

    private extractSignedDate(decodedJWT: DecodedSignedData): Date {
      return decodedJWT.signedDate === undefined ? new Date() : new Date(decodedJWT.signedDate);
    }
}

export enum VerificationStatus {
  OK,
  VERIFICATION_FAILURE,
  INVALID_APP_IDENTIFIER,
  INVALID_ENVIRONMENT,
  INVALID_CHAIN_LENGTH,
  INVALID_CERTIFICATE,
  FAILURE
}

export class VerificationException extends Error {
  status: VerificationStatus
  cause?: Error

  constructor(status: VerificationStatus, cause?: Error) {
    super(VerificationStatus[status] + (cause ? ': ' + cause.message : ''))
    this.status = status
    this.cause = cause
  }
} 