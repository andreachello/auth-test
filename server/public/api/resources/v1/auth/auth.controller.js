"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.verify = exports.nonce = void 0;
const siwe_1 = require("siwe");
const authService = __importStar(require("./auth.service"));
const nonce = (req, res) => {
    try {
        req.session.nonce = (0, siwe_1.generateNonce)();
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(req.session.nonce);
    }
    catch (error) {
        return res.status(500).send("Internal Error");
    }
};
exports.nonce = nonce;
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }
        const SIWEObject = new siwe_1.SiweMessage(req.body.message);
        console.log("SIWEOBJECT", SIWEObject);
        const { data: message } = yield SIWEObject.verify({
            signature: req.body.signature,
            nonce: req.session.nonce
        });
        console.log("message", message);
        req.session.siwe = message;
        // req.session.cookie.expires = new Date(message.expirationTime ?? "");
        // req.session.save();
        console.log("req.session", req.session);
        authService.authenticateUser(message.address, (err, results) => {
            if (err) {
                console.log("authUser error", err);
                return res.status(400).send(err);
            }
            return res.status(200).send({ status: "OK", data: results });
        });
    }
    catch (e) {
        req.session.siwe = null;
        req.session.nonce = null;
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
    console.log("req.session", req.session);
    if (!req.session.siwe) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }
    console.log("User is authenticated!");
    res.setHeader('Content-Type', 'text/plain');
    // res.json({ address: "" });
    res.json({ address: req.session.siwe.address });
});
exports.validate = validate;
//# sourceMappingURL=auth.controller.js.map