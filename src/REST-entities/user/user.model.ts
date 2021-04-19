import mongoose, { Schema } from "mongoose";
import {
  IUser,
  IUserPopulated,
} from "../../helpers/typescript-helpers/interfaces";

const userSchema = new Schema({
  name: String,
  email: String,
  passwordHash: String,
  originUrl: String,
  books: [{ type: mongoose.Types.ObjectId, ref: "Book" }],
  planning: { type: mongoose.Types.ObjectId, ref: "Planning", default: null },
});

export default mongoose.model<IUser | IUserPopulated>("User", userSchema);
