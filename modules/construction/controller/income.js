import { calculateProvidedServiceTotals } from "../services/income.js";

export async function showProvidedServiceTotals(req, res) {
    try {
        const { provicedServices, totalTMT, totalUSD } = 
            await calculateProvidedServiceTotals()

        res.render("construction/income/incomeStatementTotals", {
            provicedServices, 
            totalTMT,
            totalUSD
        })

    } catch (error) {
        console.error("Error rendering totals:", error);
        res.status(500).send("Error fetching provided service totals");
    }
}