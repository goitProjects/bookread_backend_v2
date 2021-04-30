import { Document } from "mongoose";
import { MongoDBObjectId } from "./types";

export interface IUser extends Document {
  name: string;
  email: string;
  originUrl: string;
  books: MongoDBObjectId[];
  planning: MongoDBObjectId | null;
  passwordHash?: string;
}

export interface IUserPopulated extends Document {
  name: string;
  email: string;
  originUrl: string;
  books: IBook[];
  planning: MongoDBObjectId | null;
  passwordHash?: string;
}

export interface IBook extends Document {
  title: string;
  author: string;
  publishYear: number;
  pagesTotal: number;
  pagesFinished: number;
  rating?: number;
  feedback?: string;
}

export interface IPlanning extends Document {
  startDate: string;
  endDate: string;
  books: MongoDBObjectId[];
  pagesPerDay: number;
  duration: number;
  stats: { time: string; pagesCount: number }[];
}

export interface IPlanningPopulated extends Document {
  startDate: string;
  endDate: string;
  books: IBook[];
  pagesPerDay: number;
  duration: number;
  stats: { time: string; pagesCount: number }[];
}

export interface ISession extends Document {
  uid: string;
}

export interface IJWTPayload {
  uid: string;
  sid: string;
}
