import * as crypto from './crypto'

const webcrypto = require('crypto').webcrypto;

describe('Crypto', () => {

    test('generateLicenseKey should have expected length', () => {
        let segmentLength = 5;
        let segments = 5;

        let license = crypto.generateLicenseKey(segmentLength, segments)
        
        expect(license.length).toBe(segments * segmentLength + segments - 1)
    });

    test('createKeypack should generate keys', async () => {
        let license = crypto.generateLicenseKey()
        let keypack = await crypto.createKeypack(license)
        
        expect(keypack.fingerprint).toBeDefined()
        expect(keypack.kekSalt).toBeDefined()
        expect(keypack.privateKeyWrapIV).toBeDefined()
        expect(keypack.publicKey).toBeDefined()
        expect(keypack.privateKey).toBeDefined()
        expect(keypack.symmetricKey).toBeDefined()
        expect(keypack.symmetricKeyWrapIV).toBeDefined()
    });

    test('importKeypack should import keys', async () => {
        let license = crypto.generateLicenseKey()
        let keypack = await crypto.createKeypack(license)
        let importedKeys = await crypto.importKeypack(license, keypack);
        
        expect(importedKeys.publicKey).toBeInstanceOf(webcrypto.CryptoKey)
        expect(importedKeys.privateKey).toBeInstanceOf(webcrypto.CryptoKey)
        expect(importedKeys.symmetricKey).toBeInstanceOf(webcrypto.CryptoKey)
    });

    test('encryption and decryption with asymmetric key', async () => {
        let license = crypto.generateLicenseKey()
        let keypack = await crypto.createKeypack(license)
        let importedKeys = await crypto.importKeypack(license, keypack);
        
        let msg = 'my secret message';
        let encryptedAsymData = await crypto.encrypt(msg, importedKeys.publicKey);

        expect(encryptedAsymData.data).toBeInstanceOf(ArrayBuffer)
        expect(encryptedAsymData.iv).toBeUndefined()

        let decryptedAsymMessage = await crypto.decrypt(encryptedAsymData, importedKeys.privateKey);

        expect(decryptedAsymMessage).toBe(msg);
    });

    test('encryption and decryption with symmetric key', async () => {
        let license = crypto.generateLicenseKey()
        let keypack = await crypto.createKeypack(license)
        let importedKeys = await crypto.importKeypack(license, keypack);
        
        let msg = 'my secret message';
        let encryptedAsymData = await crypto.encrypt(msg, importedKeys.symmetricKey);

        expect(encryptedAsymData.data).toBeInstanceOf(ArrayBuffer)
        expect(encryptedAsymData.iv).toBeDefined()

        let decryptedAsymMessage = await crypto.decrypt(encryptedAsymData, importedKeys.symmetricKey);

        expect(decryptedAsymMessage).toBe(msg);
    });

});

