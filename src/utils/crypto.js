// Mock window var for nodejs tests
if (!window.crypto) window.crypto = require('crypto').webcrypto;
if (!window.TextEncoder) window.TextEncoder = require('util').TextEncoder;
if (!window.TextDecoder) window.TextDecoder = require('util').TextDecoder;


export async function createKEK(secret, salt) {
    let iterations = 100000;
    let enc = new TextEncoder();

    // Import password as a key
    let importedKey = await window.crypto.subtle.importKey(
        "raw", 
        enc.encode(secret), 
        {name: "PBKDF2"}, 
        false,
        ["deriveBits", "deriveKey"]
    );
    
    // Create key from imported password
    let kek = await window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            salt: salt, 
            "iterations": iterations,
            "hash": "SHA-256"
        },
        importedKey,
        { "name": "AES-GCM", "length": 256},
        true,
        [ "wrapKey", "unwrapKey" ]
    );

    return kek;
}


export async function createEncryptedKeyPair(kek) {
    // Create keypair
    let keypair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    // Encrypt and export the private key
    let privateKeyWrapIV = window.crypto.getRandomValues(new Uint8Array(12));
    let  privateKey = await crypto.subtle.wrapKey(
        'pkcs8',
        keypair.privateKey,
        kek,
        {
            name: "AES-GCM",
            iv: privateKeyWrapIV
        }
    );

    let publicKey = await crypto.subtle.exportKey(
        'spki',
        keypair.publicKey
    );

    return { publicKey, privateKey, privateKeyWrapIV };
}


export async function createEncryptedSigningKeyPair(kek) {
    // Create keypair
    let keypair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-PSS",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
    );

    // Encrypt and export the private key
    let privateKeyWrapIV = window.crypto.getRandomValues(new Uint8Array(12));
    let  privateKey = await crypto.subtle.wrapKey(
        'pkcs8',
        keypair.privateKey,
        kek,
        {
            name: "AES-GCM",
            iv: privateKeyWrapIV
        }
    );

    let publicKey = await crypto.subtle.exportKey(
        'spki',
        keypair.publicKey
    );

    return { publicKey, privateKey, privateKeyWrapIV };
}


export async function createEncryptedSymmetricKey(kek) {
    // Create symmetric key
    let symmetricKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    // Encrypt and export the symmetric key
    let symmetricKeyWrapIV = window.crypto.getRandomValues(new Uint8Array(12));
    let  encryptedSymmetricKey = await crypto.subtle.wrapKey(
        'raw',
        symmetricKey,
        kek,
        {
            name: "AES-GCM",
            iv: symmetricKeyWrapIV
        }
    );

    return { encryptedSymmetricKey, symmetricKeyWrapIV};
}


export function base64encode(arrayBuffer) {
    let bytes = new Uint8Array(arrayBuffer);
    let encodedString = String.fromCharCode.apply(null, bytes);
    encodedString = btoa(encodedString);
    return encodedString;
}


export function base64decode(encodedString) {
    let decodedString = window.atob(encodedString);
    return Uint8Array.from(decodedString, c => c.charCodeAt(0));
}


export async function getHash(string) {
    let enc = new TextEncoder();
    let encodedString = enc.encode(string);
    let hash = await crypto.subtle.digest("SHA-256", encodedString);
    return hash;
}


export async function createKeypack(license) {
    // KEK Salt must be at least 16 bytes:
    // https://developer.mozilla.org/en-US/docs/Web/API/Pbkdf2Params
    let kekSalt = window.crypto.getRandomValues(new Uint8Array(16));
    let kek = await createKEK(license, kekSalt);

    let keyPair = await createEncryptedKeyPair(kek);
    let signingKeyPair = await createEncryptedSigningKeyPair(kek);
    let symmetricKey = await createEncryptedSymmetricKey(kek);

    let fingerprint = getHash(license);

    return {
        fingerprint: base64encode(fingerprint),
        kekSalt: base64encode(kekSalt),
        publicKey: base64encode(keyPair.publicKey),
        privateKey: base64encode(keyPair.privateKey),
        privateKeyWrapIV: base64encode(keyPair.privateKeyWrapIV),
        publicSigningKey: base64encode(signingKeyPair.publicKey),
        privateSigningKey: base64encode(signingKeyPair.privateKey),
        privateSigningKeyWrapIV: base64encode(signingKeyPair.privateKeyWrapIV),
        symmetricKey: base64encode(symmetricKey.encryptedSymmetricKey),
        symmetricKeyWrapIV: base64encode(symmetricKey.symmetricKeyWrapIV),
    };
}


export async function importKeypack(license, keypack) {
    let decodedPublicKey = base64decode(keypack.publicKey);
    let decodedPrivateKey = base64decode(keypack.privateKey);
    let decodedPrivateKeyWrapIv = base64decode(keypack.privateKeyWrapIV);

    let decodedPublicSigningKey = base64decode(keypack.publicSigningKey);
    let decodedPrivateSigningKey = base64decode(keypack.privateSigningKey);
    let decodedPrivateSigningKeyWrapIv = base64decode(keypack.privateSigningKeyWrapIV);

    let decodedKekSalt = base64decode(keypack.kekSalt);
    let decodedSymmetricKey = base64decode(keypack.symmetricKey);
    let decodedSymmetricKeyWrapIv = base64decode(keypack.symmetricKeyWrapIV);

    // Derive the KEK
    let kek = await createKEK(license, decodedKekSalt);

    let importedPrivateKey = await crypto.subtle.unwrapKey(
        'pkcs8',
        decodedPrivateKey,
        kek,
        {
            name: "AES-GCM",
            iv: decodedPrivateKeyWrapIv
        },
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["decrypt"]
    );

    let importedPublicKey = await crypto.subtle.importKey(
        'spki',
        decodedPublicKey,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["encrypt"]
    );

    let importedPrivateSigningKey = await crypto.subtle.unwrapKey(
        'pkcs8',
        decodedPrivateSigningKey,
        kek,
        {
            name: "AES-GCM",
            iv: decodedPrivateSigningKeyWrapIv
        },
        {
            name: "RSA-PSS",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );

    let importedPublicSigningKey = await crypto.subtle.importKey(
        'spki',
        decodedPublicSigningKey,
        {
            name: "RSA-PSS",
            hash: "SHA-256"
        },
        false,
        ["verify"]
    );

    let importedSymmetricKey = await window.crypto.subtle.unwrapKey(
        "raw",
        decodedSymmetricKey,
        kek,
        {
            name: "AES-GCM",
            iv: decodedSymmetricKeyWrapIv
        },
        "AES-GCM",
        false,
        ["encrypt", "decrypt"]
      );

    return {
        publicKey: importedPublicKey,
        privateKey: importedPrivateKey,
        publicSigningKey: importedPublicSigningKey,
        privateSigningKey: importedPrivateSigningKey,
        symmetricKey: importedSymmetricKey
    };
}


export async function sign(stringData, privateKey) {
    let enc = new TextEncoder();
    let signature = await window.crypto.subtle.sign(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        privateKey,
        enc.encode(stringData)
    );

    return signature;
}


export async function verify(stringData, signature, publicKey) {
    let enc = new TextEncoder();
    let data = enc.encode(stringData);
    let result = await window.crypto.subtle.verify(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      publicKey,
      signature,
      data
    );
  
    return result ? "valid" : "invalid";
  }


export async function encrypt(stringData, key) {
    var params = {name: key.algorithm.name};

    if (key.algorithm.name === "AES-GCM") {
        params.iv = window.crypto.getRandomValues(new Uint8Array(12));
    }
    else if (key.algorithm.name !== "RSA-OAEP") {
        throw Error("Unsupported encryption algorithm: " + key.algorithm.name);
    }

    let enc = new TextEncoder();
    let data = await window.crypto.subtle.encrypt(
      params,
      key,
      enc.encode(stringData)
    );

    return {data, iv: params.iv};
}


export async function decrypt({data, iv}, key) {
    if (!(data instanceof ArrayBuffer)) {
        throw Error("data must be an ArrayBuffer");
    }
    var params = {name: key.algorithm.name};
    if (key.algorithm.name === "AES-GCM") {
        if (!iv) {
            throw Error("AES-GCM requires an IV");    
        }
        params.iv = iv;
    }
    else if (key.algorithm.name === "RSA-OAEP") {
        if (iv) {
            throw Error("RSA-OAEP does not support an IV");    
        }
    }
    else {
        throw Error("Unsupported encryption algorithm: " + key.algorithm.name);
    }

    let enc = new TextDecoder();
    let ciphertext = await window.crypto.subtle.decrypt(
      params,
      key,
      data
    );

    return enc.decode(ciphertext);
}


export async function storeLocalKeys(keys) {
    let requestDb = window.indexedDB.open('keystore');
    requestDb.onupgradeneeded = e => {
        e.target.result.createObjectStore('keys', 
            { autoIncrement : true }
        );
    }

    return new Promise((resolve) => {
        requestDb.onsuccess = e => {
            let db = e.target.result;
            let store = db.transaction('keys', 'readwrite').objectStore('keys');
            let addRequest = store.put(keys, 1);
            addRequest.onsuccess = e => {
                resolve();
            }
        }
    });
}

export async function loadLocalKeys() {
    var requestDb = window.indexedDB.open('keystore');
    requestDb.onupgradeneeded = e => {
        e.target.result.createObjectStore('keys', 
            { autoIncrement : true }
        );
    }

    return new Promise(resolve => {
        requestDb.onsuccess = e => {
            let db = e.target.result;
            var store = db.transaction('keys').objectStore('keys');
            store.get(1).onsuccess = e => resolve(e.target.result);
        }
    });
}

export function generateLicenseKey(segmentLength=5, segments=5) {
    // Exclude lookalikes: 0&O, 5&S, 6&G
    let chars = "1234789ABCDEFHIJKLMNPQRTUVWXYZ";
    let keyLength = segments * segmentLength;
    let key = "";
    let randomArray = window.crypto.getRandomValues(new Uint8Array(keyLength));
    randomArray.forEach((el, i) => {
        let charPosition = el % chars.length;
        let selectedChar = chars.charAt(charPosition);
        key += selectedChar;
        if ((i + 1) % segmentLength === 0 && (i + 1) < keyLength) {
            key += "-";
        }
    });
    return key;
}

export async function generateAuthToken(fingerprint, privateKey) {
    let tokenBody = btoa(JSON.stringify({fingerprint, timestamp: Date.now()}));
    let signature = base64encode(await sign(tokenBody, privateKey));
    let token = tokenBody + '.' + signature;
    return token;
}

export async function testCryptoStorage() {
    let license = generateLicenseKey();
    console.log("Generated License:", license);
    
    let keypack = await createKeypack(license);
    console.log("Keypack Created:", keypack);

    let importedKeys = await importKeypack(license, keypack);

    // Encrypt a message using the imported public key and symmetric key
    let msg = "My message";
    console.log("Initial Message: ", msg);

    let encryptedSymData = await encrypt(msg, importedKeys.symmetricKey);
    console.log("Symmetric Encrypted Message: ", encryptedSymData);

    await storeLocalKeys(importedKeys);
    let persistedKeys = await loadLocalKeys();

    if (!(persistedKeys.publicKey instanceof CryptoKey)) 
        throw Error('Persisted public key is not a CryptoKey');
    if (!(persistedKeys.privateKey instanceof CryptoKey)) 
        throw Error('Persisted private key is not a CryptoKey');
    if (!(persistedKeys.publicSigningKey instanceof CryptoKey)) 
        throw Error('Persisted public signing key is not a CryptoKey');
    if (!(persistedKeys.privateSigningKey instanceof CryptoKey)) 
        throw Error('Persisted private signing key is not a CryptoKey');
    if (!(persistedKeys.symmetricKey instanceof CryptoKey)) 
        throw Error('Persisted symmetric key is not a CryptoKey');

    // Decrypt a message with both the imported and persisted symmetric key
    let decryptedSymMessage = await decrypt(encryptedSymData, persistedKeys.symmetricKey);
    console.log("Decrypted Message: ", decryptedSymMessage);

    if (msg !== decryptedSymMessage) 
        throw Error('Decrypted message does not match original message');

    console.log("SUCCESS!");
}
