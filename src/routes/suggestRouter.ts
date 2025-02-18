import express from "express";
import { Config } from "../config";
import nodemailer from "nodemailer";
import cron from "node-cron";
import Response from "../db/response/Response";

const suggestRouter = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});

cron.schedule("0 8 * * 5", async () => {
  const response: Response<any> =
    await Config.dependencies.suggestionService.emailSuggestionList(
      transporter
    );
  if (response.statusCode !== 200) {
    console.log(response.message);
  }
});

suggestRouter.post("/", async (req, res) => {
  const campus_name = req.body.campus;
  const suggestion_string = req.body.suggestion;

  const response: Response<any> =
    await Config.dependencies.suggestionService.addSuggestion(
      campus_name,
      suggestion_string
    );

  res.status(response.statusCode).send(response.message);
});

module.exports = { suggestRouter };
