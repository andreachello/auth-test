import { Response } from "express";
import { SiweMessage, SiweErrorType, generateNonce } from "siwe";
import * as authService from "./auth.service"

export const nonce = (req: any, res: Response) => {
    try {
        req.session.nonce = generateNonce();
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(req.session.nonce);
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

        const { data: message } = await SIWEObject.verify({
            signature: req.body.signature,
            nonce: req.session.nonce
        });
        console.log("message", message);

        req.session.siwe = message;
        req.session.cookie.expires = new Date("2026-01-07T17:45:48.621Z");
        // req.session.save();

        console.log("req.session", req.session);


        authService.authenticateUser(message.address, (err: any, results: any) => {
            if (err) {
                console.log("authUser error", err);

                return res.status(400).send(err)
            }
            return res.status(200).send({ status: "OK", data: results })
        })

    } catch (e: any) {
        // req.session.siwe = null;
        // req.session.nonce = null;
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
    console.log("req.session", req.session);
    
    if (!req.session.siwe) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }
    console.log("User is authenticated!");
    res.setHeader('Content-Type', 'text/plain');
    // res.json({ address: "" });
    res.json({ address: req.session.siwe.address });
}

