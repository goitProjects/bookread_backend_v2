import { Router } from "express";
import Joi from "joi";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import validate from "../../helpers/function-helpers/validate";
import { authorize } from "./../../auth/auth.controller";
import {
  startPlanning,
  addReadPages,
  getPlanning,
} from "./planning.controller";

const addPlanningSchema = Joi.object({
  startDate: Joi.string()
    .custom((value, helpers) => {
      const dateRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
      const isValidDate = dateRegex.test(value);
      if (!isValidDate) {
        return helpers.message({
          custom: "Invalid 'startDate'. Please, use YYYY-MM-DD string format",
        });
      }
      return value;
    })
    .required(),
  endDate: Joi.string()
    .custom((value, helpers) => {
      const dateRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
      const isValidDate = dateRegex.test(value);
      if (!isValidDate) {
        return helpers.message({
          custom: "Invalid 'endDate'. Please, use YYYY-MM-DD string format",
        });
      }
      return value;
    })
    .required(),
  books: Joi.array().items(Joi.string()).min(1).required(),
});

const addReadPagesSchema = Joi.object({
  pages: Joi.number().min(1).required(),
});

const router = Router();

router.post(
  "/",
  validate(addPlanningSchema),
  tryCatchWrapper(authorize),
  tryCatchWrapper(startPlanning)
);
router.patch(
  "/",
  validate(addReadPagesSchema),
  tryCatchWrapper(authorize),
  tryCatchWrapper(addReadPages)
);
router.get("/", tryCatchWrapper(authorize), tryCatchWrapper(getPlanning));

export default router;
