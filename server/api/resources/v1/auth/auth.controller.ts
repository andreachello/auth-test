import { Response } from "express";
import { SiweMessage, SiweErrorType, generateNonce } from "siwe";
import * as authService from "./auth.service"
import jwt, { JwtPayload } from "jsonwebtoken";

const secretKey = "your_secret_key_here";

export const nonce = (req: any, res: Response) => {
    try {
        const nonce = generateNonce()
        const token = jwt.sign({ nonce, address: req.params.address }, secretKey);
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send({ token, nonce });
    } catch (error) {
        return res.status(500).send("Internal Error");
    }
};

export const verify = async (req: any, res: Response) => {
    try {
        if (!req.body.message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }

        const SIWEObject = new SiweMessage(req.body.message);
        console.log("SIWEOBJECT", SIWEObject);
        const payload = req.headers

        console.log(payload);


        // Extract the payload from jwt.verify and assert its type
        const jwtPayload = jwt.verify(req.body.address, secretKey) as JwtPayload;
        console.log("jwtPayload", jwtPayload);

        // Access the 'nonce' property from the jwtPayload
        const nonce = jwtPayload.nonce;
        const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header

        const { data: message } = await SIWEObject.verify({
            signature: req.body.signature,
            nonce
        });
        console.log("message", message);
        res.status(200).json({ token, address: message.address });
        return;
    } catch (e: any) {
        console.error(e);
        switch (e) {
            case SiweErrorType.EXPIRED_MESSAGE: {
                req.session.save(() => res.status(440).json({ message: e.message }));
                break;
            }
            case SiweErrorType.INVALID_SIGNATURE: {
                req.session.save(() => res.status(422).json({ message: e.message }));
                break;
            }
            default: {
                req.session.save(() => res.status(500).json({ message: e.message }));
                break;
            }
        }
    }
};

export const validate = async (req: any, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key_here"); // Verify the token using your secret key
        console.log("Decoded JWT:", decoded);
        console.log("User is authenticated!");
        res.setHeader('Content-Type', 'text/plain');
        res.json({ message: 'JWT validated successfully', address: (decoded as any).address });
    } catch (error) {
        console.error("JWT validation error:", error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}