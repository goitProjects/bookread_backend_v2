import { Router } from "express";
import { authorize } from "../../auth/auth.controller";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import { getBooksInfo } from "./user.controller";

const router = Router();

router.get("/books", tryCatchWrapper(authorize), tryCatchWrapper(getBooksInfo));

export default router;
