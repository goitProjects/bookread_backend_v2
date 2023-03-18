import { Request, Response, NextFunction } from "express";
import UserModel from "./user.model";
import PlanningModel from "../planning/planning.model";
import { IUserPopulated } from "./../../helpers/typescript-helpers/interfaces";

export const getBooksInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return UserModel.findOne({ _id: req.user?._id })
    .populate("books")
    .exec(async (err, data) => {
      if (err) {
        next(err);
      }
      let goingToRead = [];
      let currentlyReading = [];
      let finishedReading = [];

      for (let i = 0; i < (data as IUserPopulated).books.length; i++) {
        const book =  (data as IUserPopulated).books[i]
          // @ts-ignore
        const isInPlannig = await PlanningModel.find({ books: book._id });
        if (book.pagesFinished === 0 && isInPlannig.length===0) {
          goingToRead.push(book);
        } 
        if (book.pagesFinished === 0 && isInPlannig.length!==0) {
          currentlyReading.push(book);
        }
        if (book.pagesFinished !== 0 && book.pagesFinished !== book.pagesTotal) {
          currentlyReading.push(book);
        }
        if (book.pagesFinished === book.pagesTotal) {
          finishedReading.push(book);
        }
      }


      return res.status(200).send({
        name: data?.name,
        email: data?.email,
        goingToRead,
        currentlyReading,
        finishedReading,
      });
    });
};
