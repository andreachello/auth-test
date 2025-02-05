"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.verify = exports.nonce = void 0;
const siwe_1 = require("siwe");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = "your_secret_key_here";
const nonce = (req, res) => {
    try {
        const nonce = (0, siwe_1.generateNonce)();
        const token = jsonwebtoken_1.default.sign({ nonce, address: req.params.address }, secretKey);
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send({ token, nonce });
    }
    catch (error) {
        return res.status(500).send("Internal Error");
    }
};
exports.nonce = nonce;
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.body.message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }
        const SIWEObject = new siwe_1.SiweMessage(req.body.message);
        console.log("SIWEOBJECT", SIWEObject);
        const payload = req.headers;
        console.log(payload);
        // Extract the payload from jwt.verify and assert its type
        const jwtPayload = jsonwebtoken_1.default.verify(req.body.address, secretKey);
        console.log("jwtPayload", jwtPayload);
        // Access the 'nonce' property from the jwtPayload
        const nonce = jwtPayload.nonce;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Extract the token from the Authorization header
        const { data: message } = yield SIWEObject.verify({
            signature: req.body.signature,
            nonce
        });
        console.log("message", message);
        res.status(200).json({ token, address: message.address });
        return;
    }
    catch (e) {
        console.error(e);
        switch (e) {
            case siwe_1.SiweErrorType.EXPIRED_MESSAGE: {
                req.session.save(() => res.status(440).json({ message: e.message }));
                break;
            }
            case siwe_1.SiweErrorType.INVALID_SIGNATURE: {
                req.session.save(() => res.status(422).json({ message: e.message }));
                break;
            }
            default: {
                req.session.save(() => res.status(500).json({ message: e.message }));
                break;
            }
        }
    }
});
exports.verify = verify;
const validate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, "your_secret_key_here"); // Verify the token using your secret key
        console.log("Decoded JWT:", decoded);
        console.log("User is authenticated!");
        res.setHeader('Content-Type', 'text/plain');
        res.json({ message: 'JWT validated successfully', address: decoded.address });
    }
    catch (error) {
        console.error("JWT validation error:", error);
        return res.status(401).json({ message: 'Invalid token' });
    }
});
exports.validate = validate;
//# sourceMappingURL=auth.controller.js.map