import express from "express";
import Config from "../config";

const authRouter = express.Router();
let depsObject;

Config.setup().then((result) => {
  depsObject = result;
});

authRouter.post("/login", async (req, res) => {
  console.log(req.body);
  if (req.body.username != null && req.body.password != null) {
    const token = await depsObject.userAuthService.login(
      req.body.username,
      req.body.password
    );

    res.send({ message: "success", token });
  } else {
    res
      .status(400)
      .send({ message: "Missing Username or Password in request body" });
  }
});

module.exports = { authRouter };
