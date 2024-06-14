// UserManager.ts
import { MongoClient, Db } from 'mongodb';

let db: Db;

// Initialize MongoDB connection
export async function connectToMongoDB() {
    const url = process.env.MONGODB_URI; // Specify your MongoDB connection string
    const dbName = 'passkey'; // Specify your database name
    const client = new MongoClient(url,

    );

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}


export function getDb() {
    return db;
}

