import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import PlanningModel from "./planning.model";
import BookModel from "../book/book.model";
import { IUser, IBook } from "../../helpers/typescript-helpers/interfaces";

export const startPlanning = async (req: Request, res: Response) => {
  const { startDate, endDate, books } = req.body;
  const user = req.user;
  const startDateArr = startDate.split("-");
  const endDateArr = endDate.split("-");
  const startDateObj = DateTime.local(
    Number(startDateArr[0]),
    Number(startDateArr[1]),
    Number(startDateArr[2])
  );
  const endDateObj = DateTime.local(
    Number(endDateArr[0]),
    Number(endDateArr[1]),
    Number(endDateArr[2])
  );
  const duration = endDateObj.diff(startDateObj, "days").toObject().days;
  if (!duration) {
    return res.status(400).send({ message: "Invalid dates" });
  }
  let totalPages = 0;
  let booksPopulated = [];
  for (let i = 0; i < books.length; i++) {
    const book = await BookModel.findOne({ _id: books[i] });
    if (!book || !user?.books.includes(book?._id)) {
      return res.status(400).send({ message: "Invalid 'bookId'" });
    }
    totalPages += book.pagesTotal;
    booksPopulated.push(book);
  }
  const pagesPerDay = Math.ceil(totalPages / duration);
  const newPlanning = await PlanningModel.create({
    startDate,
    endDate,
    books,
    duration,
    pagesPerDay,
  });
  (user as IUser).planning = newPlanning._id;
  await (user as IUser).save();
  return res.status(201).send({
    startDate: newPlanning.startDate,
    endDate: newPlanning.endDate,
    books: booksPopulated,
    duration: newPlanning.duration,
    pagesPerDay: newPlanning.pagesPerDay,
    stats: newPlanning.stats,
    _id: newPlanning._id,
  });
};

export const addReadPages = async (req: Request, res: Response) => {
  const user = req.user;
  const { pages } = req.body;
  const planning = await PlanningModel.findOne({ _id: user?.planning });
  if (!planning) {
    return res.status(403).send({ message: "You must start a planning first" });
  }
  let book: IBook | null = null;
  for (let i = 0; i < planning.books.length; i++) {
    book = await BookModel.findOne({ _id: planning.books[i] });
    if (book?.pagesTotal === book?.pagesFinished) {
      continue;
    }
    (book as IBook).pagesFinished += pages;
    if ((book as IBook).pagesFinished > (book as IBook).pagesTotal) {
      (book as IBook).pagesFinished = (book as IBook).pagesTotal;
    }
    await (book as IBook).save();
    break;
  }
  if (!book) {
    return res.status(403).send({
      message: "You have already read all the books from this planning",
    });
  }
  const date = DateTime.now().setZone("Europe/Kiev").toObject();
  let minute = date.minute?.toString();
  if ((date.minute as number).toString().length === 1) {
    minute = "0" + date.minute;
  }
  const time = `${date.year}-${date.month}-${date.day} ${date.hour}:${minute}`;
  planning.stats.push({ time, pagesCount: pages });
  await planning.save();
  return res.status(200).send({ book, planning });
};

export const getPlanning = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  return PlanningModel.findOne({
    _id: user?.planning,
  })
    .populate("books")
    .exec((err, data) => {
      if (err) {
        next(err);
      }
      if (!data) {
        return res
          .status(403)
          .send({ message: "You should start planning first" });
      }
      return res.status(200).send({ planning: data });
    });
};
