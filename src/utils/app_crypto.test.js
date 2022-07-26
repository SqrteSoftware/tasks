 /**
 * @jest-environment node
 */

import * as app_crypto from './app_crypto'

const webcrypto = require('crypto').webcrypto;

describe('Crypto', () => {

    let license = null;
    let keypack = null;
    let importedKeys = null;

    beforeAll(async () => {
        license = app_crypto.generateLicenseKey()
        keypack = await app_crypto.createKeypack(license)
        importedKeys = await app_crypto.importKeypack(license, keypack);
    });

    test('getHash should generate expected hash', async () => {
        let hash = await app_crypto.getHash('foo');
        let expectedHash = 'LCa0a2j/xo/5m0U8HTBBNBNCLXBkg7+g+YpeiGJm564='
        expect(hash).toBe(expectedHash)
    });

    test('generateLicenseKey should have expected length', () => {
        let segmentLength = 5;
        let segments = 5;

        let license = app_crypto.generateLicenseKey(segmentLength, segments)
        
        expect(license.length).toBe(segments * segmentLength + segments - 1)
    });

    test('createKeypack should generate keys', async () => {
        expect(keypack.fingerprint).toBeDefined()
        expect(keypack.kekSalt).toBeDefined()

        expect(keypack.privateKeyWrapIv).toBeDefined()
        expect(keypack.publicKey).toBeDefined()
        expect(keypack.privateKey).toBeDefined()

        expect(keypack.privateSigningKeyWrapIv).toBeDefined()
        expect(keypack.publicSigningKey).toBeDefined()
        expect(keypack.privateSigningKey).toBeDefined()

        expect(keypack.symmetricKey).toBeDefined()
        expect(keypack.symmetricKeyWrapIv).toBeDefined()
    });

    test('importKeypack should import keys', async () => {
        expect(importedKeys.publicKey).toBeInstanceOf(webcrypto.CryptoKey)
        expect(importedKeys.privateKey).toBeInstanceOf(webcrypto.CryptoKey)

        expect(importedKeys.publicSigningKey).toBeInstanceOf(webcrypto.CryptoKey)
        expect(importedKeys.privateSigningKey).toBeInstanceOf(webcrypto.CryptoKey)
        
        expect(importedKeys.symmetricKey).toBeInstanceOf(webcrypto.CryptoKey)
    });

    test('encryption and decryption with asymmetric key', async () => {
        let msg = 'my secret message';
        let encryptedAsymData = await app_crypto.encrypt(msg, importedKeys.publicKey);
        expect(encryptedAsymData.data).toBeInstanceOf(ArrayBuffer)
        expect(encryptedAsymData.iv).toBeUndefined()

        let decryptedAsymMessage = await app_crypto.decrypt(encryptedAsymData, importedKeys.privateKey);

        expect(decryptedAsymMessage).toBe(msg);
    });

    test('signing and verifying with asymmetric key', async () => {
        let msg = JSON.stringify({fingerprint: '123', timestamp: Date.now()});
        let signature = await app_crypto.sign(msg, importedKeys.privateSigningKey);

        expect(signature).toBeInstanceOf(ArrayBuffer)

        let verification = await app_crypto.verify(msg, signature, importedKeys.publicSigningKey);

        expect(verification).toBe('valid');
    });    

    test('encryption and decryption with symmetric key', async () => {
        let msg = 'my secret message';
        let encryptedAsymData = await app_crypto.encrypt(msg, importedKeys.symmetricKey);

        expect(encryptedAsymData.data).toBeInstanceOf(ArrayBuffer)
        expect(encryptedAsymData.iv).toBeDefined()

        let decryptedAsymMessage = await app_crypto.decrypt(encryptedAsymData, importedKeys.symmetricKey);

        expect(decryptedAsymMessage).toBe(msg);
    });

    test('creating an auth token', async() => {

        let token = await app_crypto.generateAuthToken(
            '123456', importedKeys.privateSigningKey);

        let tokenParts = token.split('.');

        let verification = await app_crypto.verify(
            tokenParts[0], 
            app_crypto.base64decode(tokenParts[1]),
            importedKeys.publicSigningKey);

        expect(verification).toBe('valid');

        let parsedToken = JSON.parse(atob(tokenParts[0]));
        expect(parsedToken['userId']).toBe('123456');
    });

});

