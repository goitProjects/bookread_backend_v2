import { Request, Response } from "express";
import BookModel from "./book.model";
import PlanningModel from "../planning/planning.model";

export const addBook = async (req: Request, res: Response) => {
  const book = req.body;
  const user = req.user;
  const newBook = await BookModel.create({ ...book, pagesFinished: 0 });
  user?.books.push(newBook);
  await user?.save();
  res.status(201).send(newBook);
};

export const delBook = async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const user = req.user;
  const book = await BookModel.findById(bookId);
  if (!book || !user?.books.includes(bookId)) {
    return res.status(400).send({ message: "Invalid 'bookId" });
  }
  // @ts-ignore
  const isInPlannig = await PlanningModel.find({ books: bookId});
  if (isInPlannig.length!==0) {
    return res.status(400).send({
      message:
        "Invalid 'bookId', you can't delete book that you've already read/reading",
    });
  }
  await BookModel.findByIdAndDelete(bookId);
  user?.books.pull(bookId);
  await user?.save();
  res.status(201).send(book);
};

export const addReview = async (req: Request, res: Response) => {
  const user = req.user;
  const { bookId } = req.params;
  const { rating, feedback } = req.body;
  const book = await BookModel.findById(bookId);
  if (!book || !user?.books.includes(bookId)) {
    return res.status(400).send({ message: "Invalid 'bookId'" });
  }
  if (book.pagesFinished !== book.pagesTotal) {
    return res
      .status(403)
      .send({ message: "You must finish this book before reviewing it" });
  }
  book.rating = rating;
  book.feedback = feedback;
  await book.save();
  return res.status(200).send(book);
};
