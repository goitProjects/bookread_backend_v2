import { Request, Response, NextFunction } from "express";
import UserModel from "./user.model";
import { IUserPopulated } from "./../../helpers/typescript-helpers/interfaces";

export const getBooksInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return UserModel.findOne({ _id: req.user?._id })
    .populate("books")
    .exec((err, data) => {
      if (err) {
        next(err);
      }
      const goingToRead = (data as IUserPopulated).books.filter(
        (book) => book.pagesFinished === 0
      );
      const currentlyReading = (data as IUserPopulated).books.filter((book) => {
        book.pagesFinished !== 0 && book.pagesFinished !== book.pagesTotal;
      });
      const finishedReading = (data as IUserPopulated).books.filter(
        (book) => book.pagesFinished === book.pagesTotal
      );
      return res.status(200).send({
        email: data?.email,
        goingToRead,
        currentlyReading,
        finishedReading,
      });
    });
};
