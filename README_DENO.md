# App Store Server Library for Deno

This library is a port of the official App Store Server API Library for Node.js to work with Deno. It provides convenient access to the App Store Server API, JWS signing and verification, and App Store server notification parsing.

## Overview

The App Store Server API is designed to help you manage your users' subscriptions, provide enhanced refund-related capabilities, and address disputes involving in-app purchases. The API provides a variety of server-to-server endpoints that you can call from your server to programmatically resolve issues.

You can use the App Store Server Library for Deno to:

- Get transaction history, transaction details, or subscription statuses from the App Store for your app
- Determine if a user is eligible for an offer or a free trial
- Calculate the next subscription renewal date
- Extend a subscription renewal date for existing subscribers
- Refund a user's transactions
- Provide users with real-time information about their subscriptions, such as renewal dates and prices
- Request a list of all your app's subscription offerings
- Send in-app messages to users

## Installing

To use this library in your Deno project, you can import it directly from a URL:

```ts
import { AppStoreServerAPIClient } from "https://deno.land/x/app_store_server_library/mod.ts";
```

## Usage Example

```ts
import { 
  AppStoreServerAPIClient, 
  Environment,
  SignedDataVerifier
} from "https://deno.land/x/app_store_server_library/mod.ts";

// Initialize the API client
const client = new AppStoreServerAPIClient(
  signingKey,   // Your private key downloaded from App Store Connect 
  keyId,        // Your private key ID from App Store Connect
  issuerId,     // Your issuer ID from the Keys page in App Store Connect
  bundleId,     // Your app's bundle ID
  Environment.PRODUCTION  // Or Environment.SANDBOX for testing
);

// Get all subscription statuses for a user
const transactionId = "123456789";
const response = await client.getAllSubscriptionStatuses(transactionId);
console.log(response);

// Verify a transaction
const rootCertificates = [
  await Deno.readFile("path/to/apple_root_ca_g3.cer")
];
const verifier = new SignedDataVerifier(
  rootCertificates,
  true,
  Environment.PRODUCTION, 
  bundleId,
  appAppleId
);

try {
  const transaction = await verifier.verifyAndDecodeTransaction(signedTransaction);
  console.log(transaction);
} catch (e) {
  console.error("Verification failed:", e);
}
```

## Compatibility Notes

This library is a Deno-compatible port of the original [App Store Server Library for Node.js](https://github.com/apple/app-store-server-library-node). It has been adapted to use Deno's native APIs instead of Node-specific modules:

- Uses Deno's native `fetch` API instead of node-fetch
- Uses Deno's cryptography APIs instead of Node's crypto module
- Uses `djwt` for JWT operations instead of jsonwebtoken
- Uses Deno standard library modules for utilities

## License

[MIT License](./LICENSE.txt) 