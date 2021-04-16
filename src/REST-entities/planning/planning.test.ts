import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import {
  IUser,
  IUserPopulated,
  IPlanning,
} from "../../helpers/typescript-helpers/interfaces";
import Server from "../../server/server";
import UserModel from "../user/user.model";
import SessionModel from "../session/session.model";
import BookModel from "../book/book.model";
import PlanningModel from "./planning.model";

describe("Planning router test suite", () => {
  let app: Application;
  let createdUser: IUser | IUserPopulated | null;
  let createdPlanning: IPlanning | null;
  let createdBook: Response;
  let accessToken: string;
  let response: Response;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/planning`;
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
    createdBook = await supertest(app)
      .post("/book")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Test",
        author: "Test",
        publishYear: 2020,
        pagesTotal: 10,
      });
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: "test@email.com" });
    await SessionModel.deleteOne({ _id: response.body.sid });
    await mongoose.connection.close();
  });

  describe("POST /planning", () => {
    let response: Response;

    const validReqBody = {
      startDate: "2020-12-31",
      endDate: "2021-01-05",
      books: [],
    };

    const invalidReqBody = {
      startDate: "2020-12-31",
      endDate: "2020-13-31",
      books: [],
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        validReqBody.books.push(createdBook.body.newBook._id as never);
        response = await supertest(app)
          .post("/planning")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        createdUser = await UserModel.findById(createdUser?._id);
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          startDate: "2020-12-31",
          endDate: "2021-01-05",
          books: [
            {
              title: "Test",
              author: "Test",
              publishYear: 2020,
              pagesTotal: 10,
              pagesFinished: 0,
              __v: 0,
              _id: createdBook.body.newBook._id,
            },
          ],
          duration: 5,
          pagesPerDay: 2,
          stats: [],
          _id: response.body._id,
        });
      });

      it("Should create a new planning in user's document", () => {
        expect(createdUser?.planning?.toString()).toBe(
          response.body._id.toString()
        );
      });
    });

    context("With invalidReqBody ('totalPages' is lower than 1)", () => {
      beforeAll(async () => {
        invalidReqBody.books.push(createdBook.body.newBook._id as never);
        response = await supertest(app)
          .post("/planning")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'endDate' is invalid", () => {
        expect(response.body.message).toBe(
          "Invalid 'endDate'. Please, use YYYY-MM-DD string format"
        );
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).post("/planning").send(validReqBody);
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
          .post("/planning")
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

  describe("PATCH /planning", () => {
    let response: Response;

    const validReqBody = {
      pages: 10,
    };

    const invalidReqBody = {
      pages: 0,
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch("/planning")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        createdPlanning = await PlanningModel.findById(
          response.body.planning._id
        );
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          book: {
            title: "Test",
            author: "Test",
            publishYear: 2020,
            pagesTotal: 10,
            pagesFinished: 10,
            __v: 0,
            _id: createdBook.body.newBook._id,
          },
          planning: {
            startDate: "2020-12-31",
            endDate: "2021-01-05",
            books: [createdBook.body.newBook._id],
            duration: 5,
            pagesPerDay: 2,
            stats: [
              { time: response.body.planning.stats[0].time, pagesCount: 10 },
            ],
            _id: response.body.planning._id,
            __v: 1,
          },
        });
      });
    });

    context("With invalidReqBody ('pages' is lower than 1)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch("/planning")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'pages' must be greater than or equal to 1", () => {
        expect(response.body.message).toBe(
          '"pages" must be greater than or equal to 1'
        );
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).patch("/planning").send(validReqBody);
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
          .patch("/planning")
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

  describe("GET /planning", () => {
    let response: Response;

    afterAll(async () => {
      await PlanningModel.deleteOne({ _id: createdPlanning?._id });
      await BookModel.deleteOne({ _id: createdBook.body.newBook._id });
    });

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/planning")
          .set("Authorization", `Bearer ${accessToken}`);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          planning: {
            startDate: "2020-12-31",
            endDate: "2021-01-05",
            books: [
              {
                __v: 0,
                _id: createdBook.body.newBook._id,
                author: "Test",
                pagesFinished: 10,
                pagesTotal: 10,
                publishYear: 2020,
                title: "Test",
              },
            ],
            duration: 5,
            pagesPerDay: 2,
            stats: [
              { time: response.body.planning.stats[0].time, pagesCount: 10 },
            ],
            _id: response.body.planning._id,
            __v: 1,
          },
        });
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).get("/planning");
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
          .get("/planning")
          .set("Authorization", `Bearer qwerty123`);
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
