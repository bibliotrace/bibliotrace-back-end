import express from "express";
import { Config } from "../config";
import { sendResponse } from "../utils/utils";

export const reportRouter = express.Router();

reportRouter.get("/shopping-list", async (req: any, res) => {
  const response = await Config.dependencies.reportHandler.getShoppingList(req.auth);
  sendResponse(res, response);
});

reportRouter.delete("/shopping-list", async (req: any, res) => {
  const response = await Config.dependencies.reportHandler.deleteShoppingListItem(
    req.body,
    req.auth
  );
  sendResponse(res, response);
});

reportRouter.post("/shopping-list", async (req: any, res) => {
  const response = await Config.dependencies.reportHandler.moveShoppingItemToRestock(
    req.body,
    req.auth
  );
  sendResponse(res, response);
});

reportRouter.get("/restock-list", async (req: any, res) => {
  const response = await Config.dependencies.reportHandler.getRestockList(req.auth);
  sendResponse(res, response);
});

reportRouter.delete("/restock-list", async (req: any, res) => {
  const response = await Config.dependencies.reportHandler.deleteRestockListItem(
    req.body,
    req.auth
  );
  sendResponse(res, response);
});

reportRouter.get("/audit", async (req: any, res) => {
  const response = await Config.dependencies.reportHandler.getAllAudits(req.auth);
  sendResponse(res, response);
});

reportRouter.get("/auditEntry/:audit_id", async (req: any, res) => {
  const response = await Config.dependencies.reportHandler.getAuditReport(req.params);
  sendResponse(res, response);
});

reportRouter.get("/popular/:start_date/:end_date", async (req: any, res) => {
  const response = await Config.dependencies.reportHandler.getPopularReport(req.params, req.auth);
  sendResponse(res, response);
});

module.exports = { reportRouter };
