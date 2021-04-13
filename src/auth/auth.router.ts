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

const signUpInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
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

router.post("/register", validate(signUpInSchema), tryCatchWrapper(register));
router.post("/login", validate(signUpInSchema), tryCatchWrapper(login));
router.post("/logout", tryCatchWrapper(authorize), tryCatchWrapper(logout));
router.post(
  "/refresh",
  validate(refreshTokensSchema),
  tryCatchWrapper(refreshTokens)
);
router.get("/google", tryCatchWrapper(googleAuth));
router.get("/google-redirect", tryCatchWrapper(googleRedirect));

export default router;
