
import { getDb } from './db';

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




