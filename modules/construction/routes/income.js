import express from "express";
import {
  showStatementTotals,
  showRevenueDetails,
  showExpenseDetails,
} from "../controller/income.js";

const router = express.Router();

router.get("/totals", showStatementTotals);
router.get("/revenue-details", showRevenueDetails);
router.get("/expense-details", showExpenseDetails);

export default router;
