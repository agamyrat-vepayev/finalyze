import { calculateTotals } from "../services/income.js";

export async function showTotals(req, res) {
  try {
    
    const totals = await calculateTotals()
    res.render("construction/income/incomeStatementTotals", {totals});

  } catch (error) {
    console.error("Error rendering totals:", error);
    res.status(500).send("Error fetching totals");
  }
}

