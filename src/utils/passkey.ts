import { Base64URLString, CredentialDeviceType } from "@simplewebauthn/server/script/deps";
import { AttestationFormat } from "@simplewebauthn/server/script/helpers/decodeAttestationObject";
import { AuthenticationExtensionsAuthenticatorOutputs } from "@simplewebauthn/server/script/helpers/decodeAuthenticatorExtensions";
import { Binary } from "mongodb";
import { getDb } from "./db";

interface PassKey {
    userId: string;
    fmt: AttestationFormat;
    counter: number;
    aaguid: string;
    credentialID: Base64URLString;
    credentialPublicKey: Binary;
    credentialType: 'public-key';
    attestationObject: Uint8Array;
    userVerified: boolean;
    credentialDeviceType: CredentialDeviceType;
    credentialBackedUp: boolean;
    origin: string;
    rpID?: string;
    authenticatorExtensionResults?: AuthenticationExtensionsAuthenticatorOutputs;
}
export const addPassKey = async (passKey): Promise<void> => {
    try {
        var newPassKey = passKey;
        newPassKey.credentialPublicKey = new Binary(newPassKey.credentialPublicKey);
        const collection = getDb().collection('passKeys');
        await collection.insertOne(passKey);
        console.log('PassKey added to MongoDB');
    } catch (error) {
        console.error('Error adding passKey to MongoDB:', error);
    }
};
export const findPassKey = async (credentialID: Base64URLString): Promise<PassKey | null> => {
    try {
        const collection = getDb().collection('passKeys');
        const result = await collection.findOne({ credentialID }) as unknown as PassKey | null;
        return result;
    } catch (error) {
        console.error('Error finding passKey in MongoDB:', error);
        return null;
    }
};
export const allPassKeys = async (): Promise<PassKey[]> => {
    try {
        const collection = getDb().collection('passKeys');
        const result = await collection.find().toArray();
        return result.map((item) => item as unknown as PassKey);
    } catch (error) {
        console.error('Error getting passKeys from MongoDB:', error);
        return [];
    }
}

export const findPassKeyByUserId = async (userId: string): Promise<PassKey | null> => {
    try {
        const collection = getDb().collection('passKeys');
        const result = await collection.findOne({ userId }) as unknown as PassKey | null;
        return result;
    } catch (error) {
        console.error('Error finding passKey in MongoDB:', error);
        return null;
    }
}

//update passkey in MongoDB
export const updatePassKey = async (passKey: PassKey, newCounter): Promise<void> => {
    try {
        const collection = getDb().collection('passKeys');
        await collection.updateOne({ credentialID: passKey.credentialID }, { $set: { counter: newCounter } });

    }
    catch (error) {
        console.error('Error updating passKey in MongoDB:', error);
    }
}
