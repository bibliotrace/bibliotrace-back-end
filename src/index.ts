import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { Config } from "./config";
import { expressjwt, ExpressJwtRequest } from "express-jwt";

const { authRouter } = require("./routes/authRouter.js");
const { searchRouter } = require("./routes/searchRouter");
const { inventoryRouter } = require("./routes/inventoryRouter");
const { suggestRouter } = require("./routes/suggestRouter");
const { reportsRouter } = require("./routes/reportsRouter");

const server = express();
const localPort = 8080;

Config.setup();

if (process.env.FRONT_END_ORIGIN) {
  server.use(cors({ origin: process.env.FRONT_END_ORIGIN })); //TODO: set this as our production front-end url when we do deployment
} else {
  server.use(cors());
}

server.use(express.json());

server.use(
  expressjwt({
    secret: process.env.AUTH_KEY ?? "hello world!",
    algorithms: ["HS256"],
    onExpired: async (req, err) => {
      console.log("EXPIREDDDD");
      throw err;
    },
  }).unless({ path: ["/api/auth/login"] })
);

const apiRouter = express.Router();
server.use("/api", apiRouter);

apiRouter.use("/auth", authRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/suggest", suggestRouter);

server.get("/dummy", (req, res) => {
  res.json({ message: "json testing" });
});

console.log(`Server Listening on Port ${localPort}`);
server.listen(localPort);
