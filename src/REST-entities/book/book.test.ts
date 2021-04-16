import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import {
  IUser,
  IUserPopulated,
  IBook,
} from "../../helpers/typescript-helpers/interfaces";
import Server from "../../server/server";
import UserModel from "../user/user.model";
import SessionModel from "../session/session.model";
import BookModel from "./book.model";

describe("Book router test suite", () => {
  let app: Application;
  let createdUser: IUser | IUserPopulated | null;
  let createdBook: IBook | null;
  let accessToken: string;
  let response: Response;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/book`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await supertest(app)
      .post("/auth/register")
      .send({ email: "test@email.com", password: "qwerty123" });
    response = await supertest(app)
      .post("/auth/login")
      .send({ email: "test@email.com", password: "qwerty123" });
    accessToken = response.body.accessToken;
    createdUser = await UserModel.findById(response.body.userData.id);
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: "test@email.com" });
    await SessionModel.deleteOne({ _id: response.body.sid });
    await mongoose.connection.close();
  });

  describe("POST /book", () => {
    let response: Response;

    const validReqBody = {
      title: "Test",
      author: "Test",
      publishYear: 2020,
      pagesTotal: 10,
    };

    const invalidReqBody = {
      title: "Test",
      author: "Test",
      publishYear: 2020,
      pagesTotal: 0,
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/book")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        createdUser = await UserModel.findById(createdUser?._id);
        createdBook = response.body.newBook;
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          newBook: {
            title: "Test",
            author: "Test",
            publishYear: 2020,
            pagesTotal: 10,
            pagesFinished: 0,
            _id: response.body.newBook._id,
            __v: 0,
          },
        });
      });

      it("Should create a valid book id", () => {
        expect(response.body.newBook._id).toBeTruthy();
      });

      it("Should create a new book in user's document", () => {
        expect(createdUser?.books.length).toBe(1);
      });
    });

    context("With invalidReqBody ('totalPages' is lower than 1)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/book")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'totalPages' must be greater than or equal to 1", () => {
        expect(response.body.message).toBe(
          '"pagesTotal" must be greater than or equal to 1'
        );
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).post("/book").send(validReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/book")
          .set("Authorization", `Bearer qwerty123`)
          .send(validReqBody);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });

  describe("PATCH /book/review/{bookId}", () => {
    let response: Response;

    const validReqBody = {
      rating: 5,
      feedback: "Test",
    };

    const invalidReqBody = {
      rating: 6,
      feedback: "Test",
    };

    afterAll(async () => {
      await BookModel.deleteOne({ _id: createdBook?._id });
    });

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/book/review/${createdBook?._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
      });

      it("Should return a 403 status code", () => {
        expect(response.status).toBe(403);
      });

      it("Should return an expected result", () => {
        expect(response.body.message).toBe(
          "You must finish this book before reviewing it"
        );
      });
    });

    context("With invalidReqBody ('rating' is higher than 1)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/book/review/${createdBook?._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'rating' must be less than or equal to 5", () => {
        expect(response.body.message).toBe(
          '"rating" must be less than or equal to 5'
        );
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/book/review/${createdBook?._id}`)
          .send(validReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/book/review/${createdBook?._id}`)
          .set("Authorization", `Bearer qwerty123`)
          .send(validReqBody);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });
});
