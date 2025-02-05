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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.getNonce = void 0;
// import { prisma } from "@wysdom/database"
const siwe_1 = require("siwe");
const getNonce = (done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nonce = (0, siwe_1.generateNonce)();
        console.log("nonce", nonce);
        done(null, nonce);
    }
    catch (error) {
        done(error, null);
    }
});
exports.getNonce = getNonce;
const authenticateUser = (address, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user exists
        // let user = await prisma.user.findUnique({
        //     where: {
        //         address
        //     }
        // });
        // Create new user if doesn't exist
        // if (!user) {
        //     console.log("no user");
        //     user = await createUser(address)
        // }
        done(null, {
        // Pass user id instead of address
        // id: fields.address
        // id: user.id
        });
    }
    catch (error) {
        done(error, null);
    }
});
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=auth.service.js.map