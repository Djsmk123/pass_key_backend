// UserManager.ts
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let db: Db;
const mongoURI = process.env.MONGODB_URI;
const dbName = "passkey";
console.log(mongoURI);

// Initialize MongoDB connection
export async function connectToMongoDB() {
    const url = mongoURI// Specify your MongoDB connection string
    const client = new MongoClient(url);

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

