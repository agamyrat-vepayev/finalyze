import {
  getStatementTotals,
  getRevenueDetails,
  getExpenseDetails,
} from "../services/income.js";

export async function showStatementTotals(req, res) {
  try {
    const clientCode = req.query.clientCode || "120.05.001";
    const totals = await getStatementTotals(clientCode);
    res.render("construction/income/statementTotals", {
      totals,
      clientCode,
    });
  } catch (error) {
    console.error("Error rendering totals:", error);
    res.status(500).send("Error fetching totals");
  }
}

export async function showRevenueDetails(req, res) {
  try {
    const { category, clientCode, page } = req.query;
    const pageNumber = parseInt(page) || 1;
    const pageSize = 50;

    const result = await getRevenueDetails(
      category,
      clientCode,
      pageNumber,
      pageSize
    );
    res.render("construction/income/revenueDetails", {
      revenueDetails: result.data,
      category,
      clientCode,
      currentPage: result.currentPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Error fetching revenue details:", error);
    res.status(500).send("Error fetching revenue details");
  }
}

export async function showExpenseDetails(req, res) {
  try {
    const { category, clientCode, page } = req.query;
    const pageNumber = parseInt(page) || 1;
    const pageSize = 50;

    const result = await getExpenseDetails(
      category,
      clientCode,
      pageNumber,
      pageSize
    );

    res.render("construction/income/expenseDetails", {
      expenseDetails: result.data,
      category,
      clientCode,
      currentPage: result.currentPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching revenue details:", error);
    res.status(500).send("Error fetching revenue details");
  }
}
