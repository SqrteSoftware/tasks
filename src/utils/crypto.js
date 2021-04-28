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


export async function createEncryptedKeyPair(kek, iv) {
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
    let  privateKey = await crypto.subtle.wrapKey(
        'pkcs8',
        keypair.privateKey,
        kek,
        {
            name: "AES-GCM",
            iv: iv
        }
    );

    let publicKey = await crypto.subtle.exportKey(
        'spki',
        keypair.publicKey
    );

    return { publicKey, privateKey };
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


export async function createEncodedKeypair(license) {
    let salt = window.crypto.getRandomValues(new Uint8Array(16));
    let kek = await createKEK(license, salt);

    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    let keyPair = await createEncryptedKeyPair(kek, iv);

    return {
        salt: base64encode(salt),
        iv: base64encode(iv),
        publicKey: base64encode(keyPair.publicKey),
        privateKey: base64encode(keyPair.privateKey)
    };
}


export async function importEncodedKeypair({publicKey, privateKey, iv, salt}) {
    let license = "A1B2C-A1B2C-A1B2C-A1B2C";

    let decodedPublicKey = base64decode(publicKey);
    let decodedPrivateKey = base64decode(privateKey);
    let decodedIv = base64decode(iv);
    let decodedSalt = base64decode(salt);

    // Derive the KEK
    let kek = await createKEK(license, decodedSalt);

    let importedPrivateKey = await crypto.subtle.unwrapKey(
        'pkcs8',
        decodedPrivateKey,
        kek,
        {
            name: "AES-GCM",
            iv: decodedIv
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

    return {
        privateKey: importedPrivateKey,
        publicKey: importedPublicKey
    };
}


export async function encrypt(stringData, key) {
    let enc = new TextEncoder();
    let ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      key,
      enc.encode(stringData)
    );

    return ciphertext;
}


export async function decrypt(arrayBuffer, key) {
    let enc = new TextDecoder();
    let ciphertext = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      key,
      arrayBuffer
    );

    return enc.decode(ciphertext);
}


export async function testCrypto() {
    let license = "A1B2C-A1B2C-A1B2C-A1B2C";
    let exportedKeys = await createEncodedKeypair(license);

    if (!exportedKeys.salt) 
        throw Error('Missing Salt');
    if (!exportedKeys.iv) 
        throw Error('Missing IV');
    if (!exportedKeys.publicKey) 
        throw Error('Missing publicKey');
    if (!exportedKeys.privateKey) 
        throw Error('Missing privateKey');

    let importedKeys = await importEncodedKeypair(exportedKeys);

    if (!(importedKeys.publicKey instanceof CryptoKey)) 
        throw Error('Imported public key is not a CryptoKey');
    if (!(importedKeys.privateKey instanceof CryptoKey)) 
        throw Error('Imported private key is not a CryptoKey');

    let msg = "My message";
    let encryptedMessage = await encrypt(msg, importedKeys.publicKey);
    let decryptedMessage = await decrypt(encryptedMessage, importedKeys.privateKey);

    if (msg !== decryptedMessage) 
        throw Error('Decrypted message does not match original message');

    console.log("SUCCESS!");
}
