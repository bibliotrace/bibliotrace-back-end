import express from "express";
import { Config } from "../config";
import nodemailer from "nodemailer";
import cron from "node-cron";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { sendResponse } from "../utils/utils";

export const suggestRouter = express.Router();

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
} as SMTPTransport.Options);

cron.schedule("0 8 * * 5", async () => {
  const response = await Config.dependencies.suggestionHandler.emailSuggestionList(transporter);
  if (response.statusCode !== 200) {
    console.log(response.message);
  }
});

suggestRouter.post("/", async (req, res) => {
  sendResponse(res, await Config.dependencies.suggestionHandler.addSuggestion(req.body));
});

module.exports = { suggestRouter };
