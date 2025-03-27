import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { Config } from "./config";
import { expressjwt } from "express-jwt";

import { authRouter } from "./routes/authRouter.js";
import { searchRouter } from "./routes/searchRouter";
import { inventoryRouter } from "./routes/inventoryRouter";
import { bookDataRouter } from "./routes/bookDataRouter";
import { suggestRouter } from "./routes/suggestRouter";
import { reportRouter } from "./routes/reportRouter";
import { metadataRouter } from "./routes/metadataRouter";

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
apiRouter.use("/bookdata", bookDataRouter);
apiRouter.use("/metadata", metadataRouter);
apiRouter.use("/report", reportRouter);
apiRouter.use("/suggest", suggestRouter);

server.get("/dummy", (req, res) => {
  res.json({ message: "json testing" });
});

console.log(`Server Listening on Port ${localPort}`);
server.listen(localPort);
