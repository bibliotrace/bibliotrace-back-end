import express from "express";
import { Config } from "../config";
import nodemailer from "nodemailer";
import cron from "node-cron";

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

cron.schedule("0 8 * * 5", () => {
  Config.dependencies.suggestionService.emailSuggestionList(transporter);
});

suggestRouter.post("/", (req, res) => {
  const campus_name = req.body.campus;
  const suggestion_string = req.body.suggestion;

  Config.dependencies.suggestionService.addSuggestion(
    campus_name,
    suggestion_string
  );

  res.sendStatus(200);
});

module.exports = { suggestRouter };
