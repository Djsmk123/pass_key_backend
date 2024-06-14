import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

// Ensure JWT_SECRET is provided in the environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in environment variables');
}
console.log(JWT_SECRET);
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token,
            JWT_SECRET as string) as { userId: string, expiresAt: number };
        //check if token is expired
        if (Date.now() >= decoded.expiresAt) {
            return res.status(403).json({ message: 'Token has expired' });
        }
        req.body.userId = decoded.userId;


        next();
    } catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token', "error": error.toString() });
    }
};
export const generateToken = (userId: string) => {
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24;
    return jwt.sign({ userId, expiresAt }, JWT_SECRET as string);
}

