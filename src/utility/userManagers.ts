// UserManager.ts
import { getDb } from './db';
interface User {
    username: string;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}


export async function createUser(username: string, userId: string

): Promise<User> {
    const user: User = {
        username,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
    };
    const result = await getDb().collection('users').insertOne(user);
    // Add the user to the users array
    if (result.insertedId) {
        return user;
    }
    throw new Error('Failed to create user');
}

export async function findUserByUsername(username: string): Promise<User> {
    try {
        const user = (await getDb().collection('users').findOne({ username }) as unknown) as User | null;

        return user;

    } catch (err) {
        console.error('Error finding user by username:', err);
        throw err;
    }

}
export async function findUserByUserId(userId: string): Promise<User> {
    try {
        const user = await getDb().collection('users').findOne({ userId }) as unknown as User | null;
        //remove mongodb _id from user object
        return user;
    }
    catch (err) {
        console.error('Error finding user by userId:', err);
        throw err;
    }
}
export async function findByCredentialId(passKeyId: string): Promise<User> {
    try {
        const user = await getDb().collection('users').findOne({ passKeyId: passKeyId }) as unknown as User | null;
        //remove mongodb _id from user object
        return user;
    }
    catch (err) {
        console.error('Error finding user by userId:', err);
        throw err;
    }
}

export function getUserObjectResponse(user): User {
    return {
        ...user, password: undefined,

        _id: undefined,

    } as User;

}
