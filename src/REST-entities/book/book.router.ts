import { Router } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import validate from "../../helpers/function-helpers/validate";
import { authorize } from "./../../auth/auth.controller";
import { delBook, addBook, addReview } from "./book.controller";

const addBookSchema = Joi.object({
  title: Joi.string().min(1).max(254).required(),
  author: Joi.string().min(2).max(254).required(),
  publishYear: Joi.number()
    .custom((value, helpers) => {
      const yearRegex = /[0-9]{4}/;
      const isValidYear = yearRegex.test(value);
      if (!isValidYear) {
        return helpers.message({
          custom: "Invalid 'publishYear'. Please, use real date.",
        });
      }
      return value;
    })
    .required(),
  pagesTotal: Joi.number().required().min(1).max(5000),
});

const addBookReviewSchema = Joi.object({
  rating: Joi.number().min(0).max(5).required(),
  feedback: Joi.string().min(1).max(3000).required(),
});

const bookIdSchema = Joi.object({
  bookId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'bookId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const router = Router();

router.post(
  "/",
  tryCatchWrapper(authorize),
  validate(addBookSchema),
  tryCatchWrapper(addBook)
);
router.patch(
  "/review/:bookId",
  tryCatchWrapper(authorize),
  validate(bookIdSchema, "params"),
  validate(addBookReviewSchema),
  tryCatchWrapper(addReview)
);
router.delete(
  "/:bookId",
  tryCatchWrapper(authorize),
  validate(bookIdSchema, "params"),
  tryCatchWrapper(delBook)
);

export default router;
