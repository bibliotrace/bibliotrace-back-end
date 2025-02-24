import express from "express";
import { Config, sendResponse, validateUserType } from "../config";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const loginResponse = await Config.dependencies.authHandler.login(req.body);
  sendResponse(res, loginResponse);
});

authRouter.put("/user", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    const response = await Config.dependencies.authHandler.createUser(req.body);
    sendResponse(res, response);
  }
});

authRouter.post("/user", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    const response = await Config.dependencies.authHandler.updateUser(req.body);
    sendResponse(res, response);
  }
});

authRouter.delete("/user/:username", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    const response = await Config.dependencies.authHandler.deleteUser(req.params);
    sendResponse(res, response);
  }
});

module.exports = { authRouter };
