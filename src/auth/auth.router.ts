import mongoose from "mongoose";
import { Router } from "express";
import Joi from "joi";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import validate from "../helpers/function-helpers/validate";
import {
  register,
  login,
  logout,
  refreshTokens,
  googleAuth,
  googleRedirect,
  authorize,
} from "../auth/auth.controller";

const signUpSchema = Joi.object({
  name: Joi.string().min(2).max(254).required(),
  email: Joi.string().min(2).max(254).required(),
  password: Joi.string().min(8).max(100).required(),
});

const signInSchema = Joi.object({
  email: Joi.string().min(2).max(254).required(),
  password: Joi.string().min(8).max(100).required()
});

const refreshTokensSchema = Joi.object({
  sid: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'sid'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const router = Router();

router.post("/register", validate(signUpSchema), tryCatchWrapper(register));
router.post("/login", validate(signInSchema), tryCatchWrapper(login));
router.post("/logout", tryCatchWrapper(authorize), tryCatchWrapper(logout));
router.post(
  "/refresh",
  validate(refreshTokensSchema),
  tryCatchWrapper(refreshTokens)
);
router.get("/google", tryCatchWrapper(googleAuth));
router.get("/google-redirect", tryCatchWrapper(googleRedirect));

export default router;
