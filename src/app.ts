import express, { NextFunction, Request, Response } from 'express';
import { verifyToken, generateToken } from './api/middleware';
import {
    generateRegistrationOptions,
    generateAuthenticationOptions,
    verifyRegistrationResponse,
    verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { createUser, findUserByUsername, findUserByUserId, getUserObjectResponse, } from './utils/userManagers';
import { addChallenge, isChallengeValid, deleteChallenge, } from './utils/challegeManager';
import { connectToMongoDB, isConnect } from './utils/db';
import { addPassKey, findPassKey, allPassKeys, updatePassKey } from "./utils/passkey";
import bodyParser from 'body-parser';





import { v4 as uuidv4 } from 'uuid';
const rpID = "blogs-deeplink-example.vercel.app";
const origin = [
    rpID,
    "android:apk-key-hash:anajUPFAkSpRIL5dHDaf4d8FaX25Kkey88rfBpe4N7Q"
];



const app = express();
const port = process.env.PORT || 8080
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

connectToMongoDB();
// Middleware to check MongoDB connection
const checkMongoConnection = async (req: Request, res: Response, next: NextFunction) => {
    if (!isConnect()) {
        console.log('MongoDB connection lost, attempting to reconnect...');
        await connectToMongoDB();
    }
    next();
};

// Apply the middleware to all routes
app.use(checkMongoConnection);

// Register endpoint
app.post('/register/start', async (req: Request, res: Response) => {

    const username = req.body.username;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    // Check if the user already exists
    if (await findUserByUsername(username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const options = await generateRegistrationOptions({
        rpName: 'CredMan App Test',
        rpID: rpID,
        userName: username,
        userDisplayName: username,
        attestationType: 'none',
        excludeCredentials: [],
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'required',
            authenticatorAttachment: 'platform',
            requireResidentKey: false,
        },

    });
    await addChallenge(options.challenge);
    res.json(options);

});
//Register complete endpoint
app.post('/register/complete', async (req: Request, res: Response) => {
    let challenge = req.body.challenge;


    //check if challenge is valid
    const validChallege = await isChallengeValid(challenge);
    if (!validChallege) {
        return res.status(400).json({ message: 'Challenge is not valid' });
    }

    if (!req.body.username) {
        return res.status(400).json({ message: 'username is required' });
    }

    //check if user already exists
    let user = await findUserByUsername(req.body.username);
    if (user) {
        return res.status(400).json({ message: 'User already exists' });
    }


    try {
        const verification = await verifyRegistrationResponse({
            response: req.body,
            expectedChallenge: challenge,
            expectedOrigin:
                origin,

        });
        if (!verification.verified) {
            return res.status(400).json({ message: 'Not able to verify' });
        }
        //delete challenge
        await deleteChallenge(challenge);

        user = await createUser(req.body.username, uuidv4());
        //add into passkey
        await addPassKey({
            ...verification.registrationInfo,
            userId: user.userId,
        });
        return res.json({
            message: 'Registration successful', data:
                getUserObjectResponse(user),
            "token": generateToken(user.userId),
        });

    } catch (e) {
        return res.status(400).json({ message: 'Invalid challenge', error: e.toString() });
    }

});

//login start endpoint
app.get('/login/start', async (req: Request, res: Response) => {
    try {
        var passkeys = await allPassKeys();
        var options = await generateAuthenticationOptions({
            rpID: rpID,
            allowCredentials:
                passkeys.map((passkey) => ({
                    type: 'public-key',
                    id: passkey.credentialID,
                    transports: ['internal'],
                })),
        });
        await addChallenge(options.challenge);
        return res.json(options);
    } catch (e) {
        return res.status(400).json({ message: 'Error', error: e.toString() });
    }
});


// Login endpoint

app.post('/login/complete', async (req: Request, res: Response) => {
    const { id, challenge, response } = req.body;

    // Ensure id, challenge, and response are provided
    if (!id) {
        return res.status(400).json({ message: 'id is required' });
    }
    if (!challenge) {
        return res.status(400).json({ message: 'challenge is required' });
    }
    if (!response) {
        return res.status(400).json({ message: 'response is required' });
    }

    // Check if the challenge is valid
    const validChallege = await isChallengeValid(challenge);
    if (!validChallege) {
        return res.status(400).json({ message: 'Challenge is not valid' });
    }

    try {
        // Retrieve the passKey from the database
        const passKey = await findPassKey(id);
        if (!passKey) {
            return res.status(400).json({ message: 'Passkey not found' });
        }

        // Ensure the passKey has the required properties
        if (!passKey.credentialPublicKey || !passKey.credentialID || passKey.counter === undefined) {
            return res.status(500).json({ message: 'Invalid passkey data' });
        }


        // Perform verification
        const verification = await verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge: req.body.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialPublicKey: new Uint8Array(passKey.credentialPublicKey.buffer),
                credentialID: passKey.credentialID,
                counter: passKey.counter,

            }
        });

        //delete challenge
        await deleteChallenge(challenge);
        if (!verification.verified) {
            return res.status(400).json({ message: 'Not able to verify' });
        }
        await updatePassKey(passKey, verification.authenticationInfo.newCounter,);
        // Retrieve the user by userId from the passKey
        const user = await findUserByUserId(passKey.userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Respond with user data and token
        return res.json({
            message: 'Login successful',
            data: getUserObjectResponse(user),
            token: generateToken(user.userId),
        });
    } catch (e) {
        console.error('Error during login verification:', e);
        return res.status(400).json({ message: 'Invalid challenge', error: e.toString() });
    }
});






// Protected endpoint
app.get('/me', verifyToken, async (req: Request, res: Response) => {
    let user = await findUserByUserId(req.body.userId);
    if (!user) {
        return res.status(400).json({ message: 'User does not exist' });
    }
    return res.json({ user: getUserObjectResponse(user) });
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

const localIp = process.env.LOCAL_IP || 'localhost';
app.listen(port, () => {
    console.log(`Express is listening at http://${localIp}:${port}`);
});


export default app

