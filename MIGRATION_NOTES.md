# Migration Notes: Node.js to Deno

## Migration Strategy Overview

This document explains how the App Store Server Library was migrated from Node.js to Deno to resolve the error: `Not implemented: crypto.X509Certificate.prototype.toString`.

### Key Changes

1. **Created Deno-specific entry points**:
   - Created `mod.ts` as the main entry point (Deno convention)
   - Created `deno_index.ts` as a Deno-compatible version of `index.ts`
   - Created `deno_jws_verification.ts` to replace Node-specific crypto operations
   - Created `deno_jws_signature_creator.ts` for JWT signing

2. **Replaced Node-specific dependencies**:
   - Replaced `node-fetch` with Deno's native `fetch` API
   - Replaced `jsonwebtoken` with `djwt` from Deno's third-party modules
   - Replaced Node's crypto module with Deno's Web Crypto API
   - Replaced `base64url` with Deno's standard library encoding modules

3. **Updated Import Paths**:
   - Added `.ts` file extensions to all imports (required by Deno)
   - Updated import paths to use Deno's URL-based module system

4. **Simplified API**:
   - Removed unnecessary complexity where possible
   - Maintained the same public API surface to ensure backward compatibility

### Specific Fixes for X509Certificate Issue

The error `Not implemented: crypto.X509Certificate.prototype.toString` was addressed by:

1. Replacing Node's `X509Certificate` class with a custom implementation using Deno's crypto primitives
2. Using Uint8Array for certificate data instead of Node's Buffer
3. Implementing certificate chain verification using Deno's crypto APIs

### Implementation Notes

- **Certificate Verification**: The implementation of certificate verification is simplified for the initial port. A complete implementation would need to properly parse X.509 certificates, validate chains, and check OCSP status.

- **JWT Handling**: We use the `djwt` library which provides similar functionality to `jsonwebtoken` but is compatible with Deno's Web Crypto API.

- **File Structure**: We maintained the original file structure but created Deno-specific versions of critical files to avoid modifying the original Node.js implementation.

## Usage Migration

To migrate from Node.js to Deno usage:

1. Import from the Deno-specific entry point:
   ```ts
   // Node.js
   const { AppStoreServerAPIClient } = require('@apple/app-store-server-library');

   // Deno
   import { AppStoreServerAPIClient } from "https://deno.land/x/app_store_server_library/mod.ts";
   ```

2. Update Buffer handling to use Uint8Array:
   ```ts
   // Node.js
   const rootCertificates = [Buffer.from('certificate data')];

   // Deno
   const rootCertificates = [new Uint8Array(certificateData)];
   ```

3. Use Deno's file system APIs:
   ```ts
   // Node.js
   const fs = require('fs');
   const key = fs.readFileSync('key.p8', 'utf8');

   // Deno
   const key = await Deno.readTextFile('key.p8');
   ```

## Future Improvements

1. Complete implementation of X.509 certificate handling
2. Add more comprehensive tests for Deno compatibility
3. Improve error handling for Deno-specific issues
4. Add examples specific to Deno usage patterns
5. Implement proper ESM module support 