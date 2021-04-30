import mongoose, { Schema } from "mongoose";
import {
  IPlanning,
  IPlanningPopulated,
} from "../../helpers/typescript-helpers/interfaces";

const planningSchema = new Schema({
  startDate: String,
  endDate: String,
  duration: Number,
  books: [{ type: mongoose.Types.ObjectId, ref: "Book" }],
  pagesPerDay: Number,
  stats: [{ time: String, pagesCount: Number, _id: false }],
});

export default mongoose.model<IPlanning | IPlanningPopulated>(
  "Planning",
  planningSchema
);
