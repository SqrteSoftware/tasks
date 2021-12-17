import * as crypto from './crypto'

const webcrypto = require('crypto').webcrypto;

describe('Crypto', () => {

    let license = null;
    let keypack = null;
    let importedKeys = null;

    beforeAll(async () => {
        license = crypto.generateLicenseKey()
        keypack = await crypto.createKeypack(license)
        importedKeys = await crypto.importKeypack(license, keypack);
    });

    test('generateLicenseKey should have expected length', () => {
        let segmentLength = 5;
        let segments = 5;

        let license = crypto.generateLicenseKey(segmentLength, segments)
        
        expect(license.length).toBe(segments * segmentLength + segments - 1)
    });

    test('createKeypack should generate keys', async () => {
        expect(keypack.fingerprint).toBeDefined()
        expect(keypack.kekSalt).toBeDefined()

        expect(keypack.privateKeyWrapIV).toBeDefined()
        expect(keypack.publicKey).toBeDefined()
        expect(keypack.privateKey).toBeDefined()

        expect(keypack.privateSigningKeyWrapIV).toBeDefined()
        expect(keypack.publicSigningKey).toBeDefined()
        expect(keypack.privateSigningKey).toBeDefined()

        expect(keypack.symmetricKey).toBeDefined()
        expect(keypack.symmetricKeyWrapIV).toBeDefined()
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
        let encryptedAsymData = await crypto.encrypt(msg, importedKeys.publicKey);

        expect(encryptedAsymData.data).toBeInstanceOf(ArrayBuffer)
        expect(encryptedAsymData.iv).toBeUndefined()

        let decryptedAsymMessage = await crypto.decrypt(encryptedAsymData, importedKeys.privateKey);

        expect(decryptedAsymMessage).toBe(msg);
    });

    test('signing and verifying with asymmetric key', async () => {
        let msg = JSON.stringify({fingerprint: '123', timestamp: Date.now()});
        let signature = await crypto.sign(msg, importedKeys.privateSigningKey);

        expect(signature).toBeInstanceOf(ArrayBuffer)

        let verification = await crypto.verify(msg, signature, importedKeys.publicSigningKey);

        expect(verification).toBe('valid');
    });    

    test('encryption and decryption with symmetric key', async () => {
        let msg = 'my secret message';
        let encryptedAsymData = await crypto.encrypt(msg, importedKeys.symmetricKey);

        expect(encryptedAsymData.data).toBeInstanceOf(ArrayBuffer)
        expect(encryptedAsymData.iv).toBeDefined()

        let decryptedAsymMessage = await crypto.decrypt(encryptedAsymData, importedKeys.symmetricKey);

        expect(decryptedAsymMessage).toBe(msg);
    });

    test('creating an auth token', async() => {

        let token = await crypto.generateAuthToken(
            '123456', importedKeys.privateSigningKey);

        let tokenParts = token.split('.');

        let verification = await crypto.verify(
            atob(tokenParts[0]), 
            crypto.base64decode(tokenParts[1]), 
            importedKeys.publicSigningKey);

        expect(verification).toBe('valid');

        
    });

});

