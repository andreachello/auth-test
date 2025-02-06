import express from "express";
import * as authController from "./auth.controller";
// import { requireAuth } from "../middleware/requireAuth";

const authRouter = express.Router();

// Generate a nonce and save it in the session
authRouter.get("/generate-nonce/", authController.nonce);
authRouter.post("/verify", authController.verify);
authRouter.get("/personal_information", authController.validate);

export default authRouter