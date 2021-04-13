import mongoose, { Schema } from "mongoose";
import { IBook } from "../../helpers/typescript-helpers/interfaces";

const bookSchema = new Schema({
  title: String,
  author: String,
  publishYear: Number,
  pagesTotal: Number,
  pagesFinished: Number,
  rating: Number,
  feedback: String,
});

export default mongoose.model<IBook>("Book", bookSchema);
