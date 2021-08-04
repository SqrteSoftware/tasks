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


function base64encode(arrayBuffer) {
    let bytes = new Uint8Array(arrayBuffer);
    let encodedString = '';
    bytes.forEach(b => encodedString += String.fromCharCode(b));
    encodedString = btoa(encodedString);
    return encodedString;
}


function base64decode(encodedString) {
    let decodedString = window.atob(encodedString);
    return Uint8Array.from(decodedString, c => c.charCodeAt(0));
}


export async function createKeypack(license) {
    // KEK Salt must be at least 16 bytes:
    // https://developer.mozilla.org/en-US/docs/Web/API/Pbkdf2Params
    let kekSalt = window.crypto.getRandomValues(new Uint8Array(16));
    let kek = await createKEK(license, kekSalt);

    let keyPair = await createEncryptedKeyPair(kek);

    let symmetricKey = await createEncryptedSymmetricKey(kek);

    let enc = new TextEncoder();
    let encodedLicense = enc.encode(license);
    let fingerprint = await crypto.subtle.digest("SHA-256", encodedLicense);

    return {
        fingerprint: base64encode(fingerprint),
        kekSalt: base64encode(kekSalt),
        publicKey: base64encode(keyPair.publicKey),
        privateKey: base64encode(keyPair.privateKey),
        privateKeyWrapIV: base64encode(keyPair.privateKeyWrapIV),
        symmetricKey: base64encode(symmetricKey.encryptedSymmetricKey),
        symmetricKeyWrapIV: base64encode(symmetricKey.symmetricKeyWrapIV),
    };
}


export async function importKeypack(license, keypack) {
    let decodedPublicKey = base64decode(keypack.publicKey);
    let decodedPrivateKey = base64decode(keypack.privateKey);
    let decodedPrivateKeyWrapIv = base64decode(keypack.privateKeyWrapIV);
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
        privateKey: importedPrivateKey,
        publicKey: importedPublicKey,
        symmetricKey: importedSymmetricKey
    };
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
    console.log(data)
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


export async function storeLocalKeys(publicKey, privateKey, symmetricKey) {
    let keys = {publicKey, privateKey, symmetricKey};

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

export async function testCrypto() {
    let license = generateLicenseKey();
    console.log("Generated License:", license);
    
    let keypack = await createKeypack(license);
    console.log("Keypack Created:", keypack);

    if (!keypack.fingerprint)
        throw Error('Missing Fingerprint');
    if (!keypack.kekSalt)
        throw Error('Missing KEK Salt');
    if (!keypack.privateKeyWrapIV)
        throw Error('Missing Private Key Wrapping IV');
    if (!keypack.publicKey)
        throw Error('Missing publicKey');
    if (!keypack.privateKey)
        throw Error('Missing privateKey');
    if (!keypack.symmetricKey)
        throw Error('Missing symmetricKey');
    if (!keypack.symmetricKeyWrapIV)
        throw Error('Missing symmetricKeyWrapIV');

    let importedKeys = await importKeypack(license, keypack);

    if (!(importedKeys.publicKey instanceof CryptoKey)) 
        throw Error('Imported public key is not a CryptoKey');
    if (!(importedKeys.privateKey instanceof CryptoKey)) 
        throw Error('Imported private key is not a CryptoKey');
    if (!(importedKeys.symmetricKey instanceof CryptoKey)) 
        throw Error('Imported symmetric key is not a CryptoKey');

    // Encrypt a message using the imported public key and symmetric key
    let msg = "My message";
    console.log("Initial Message: ", msg);

    let encryptedAsymData = await encrypt(msg, importedKeys.publicKey);
    console.log("Asymmetric Encrypted Message: ", encryptedAsymData);

    let encryptedSymData = await encrypt(msg, importedKeys.symmetricKey);
    console.log("Symmetric Encrypted Message: ", encryptedSymData);

    await storeLocalKeys(
        importedKeys.publicKey, 
        importedKeys.privateKey,
        importedKeys.symmetricKey
    );
    let persistedKeys = await loadLocalKeys();

    if (!(persistedKeys.publicKey instanceof CryptoKey)) 
        throw Error('Persisted public key is not a CryptoKey');
    if (!(persistedKeys.privateKey instanceof CryptoKey)) 
        throw Error('Persisted private key is not a CryptoKey');
    if (!(persistedKeys.symmetricKey instanceof CryptoKey)) 
        throw Error('Persisted symmetric key is not a CryptoKey');

    // Decrypt a message with both the imported and persisted private key
    let decryptedAsymMessage = await decrypt(encryptedAsymData, persistedKeys.privateKey);
    console.log("Decrypted Message: ", decryptedAsymMessage);

    if (msg !== decryptedAsymMessage) 
        throw Error('Decrypted message does not match original message');

    // Decrypt a message with both the imported and persisted symmetric key
    let decryptedSymMessage = await decrypt(encryptedSymData, persistedKeys.symmetricKey);
    console.log("Decrypted Message: ", decryptedSymMessage);

    if (msg !== decryptedSymMessage) 
        throw Error('Decrypted message does not match original message');

    console.log("SUCCESS!");
}
