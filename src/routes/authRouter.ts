import express from "express";
import { Config } from "../config";
import { sendResponse, validateUserType } from "../utils/utils";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  sendResponse(res, await Config.dependencies.authHandler.login(req.body));
});

authRouter.post("/user", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.authHandler.createUser(req.body));
  }
});

authRouter.put("/user", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.authHandler.updateUser(req.body));
  }
});

authRouter.delete("/user/:username", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.authHandler.deleteUser(req.params));
  }
});

module.exports = { authRouter };
