import { Router } from "express";
import Joi from "joi";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import validate from "../../helpers/function-helpers/validate";
import { authorize } from "./../../auth/auth.controller";
import { addBook, addReview } from "./book.controller";

const addBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
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

const router = Router();

router.post(
  "/",
  validate(addBookSchema),
  tryCatchWrapper(authorize),
  tryCatchWrapper(addBook)
);
router.patch(
  "/review/:bookId",
  validate(addBookReviewSchema),
  tryCatchWrapper(authorize),
  tryCatchWrapper(addReview)
);

export default router;
