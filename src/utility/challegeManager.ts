import crypto from 'crypto';
import { getDb } from './db';
import base64url from 'base64url';
import { AttestationFormat } from '@simplewebauthn/server/script/helpers/decodeAttestationObject';
import { Base64URLString, CredentialDeviceType } from '@simplewebauthn/server/script/deps';
import { AuthenticationExtensionsAuthenticatorOutputs } from '@simplewebauthn/server/script/helpers/decodeAuthenticatorExtensions';
import { Binary } from 'mongodb';
export const getChallenges = async (): Promise<string[]> => {
    try {
        const collection = getDb().collection('challenges');
        const result = await collection.find().toArray();
        return result.map((item) => item.value);
    } catch (error) {
        console.error('Error getting challenges from MongoDB:', error);
        return [];
    }
};

// Function to add challenge to MongoDB
export const addChallenge = async (challenge: string): Promise<void> => {
    try {
        const collection = getDb().collection('challenges');
        await collection.insertOne({ value: challenge });
        console.log('Challenge added to MongoDB');
    } catch (error) {
        throw new Error(error);
    }
};

// Function to check if challenge exists in MongoDB
export const isChallengeValid = async (challenge: string): Promise<boolean> => {
    try {
        const collection = getDb().collection('challenges');
        const result = await collection.findOne({ value: challenge });
        return !!result;

    } catch (error) {
        console.error('Error checking challenge in MongoDB:', error);
        return false;
    }
};
//delete challenge from MongoDB
export const deleteChallenge = async (challenge: string): Promise<void> => {
    try {
        const collection = getDb().collection('challenges');
        await collection.deleteOne({ value: challenge });
        console.log('Challenge deleted from MongoDB');
    } catch (error) {
        console.error('Error deleting challenge from MongoDB:', error);
    }
};




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
