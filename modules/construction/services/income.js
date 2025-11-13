import { fetchRevenueTotals, fetchExpenseTotals } from "../repositories/income.js";

export async function calculateTotals() {

    const revenue = await fetchRevenueTotals()
    const totalRevenueTMT = revenue.reduce((sum, row) => sum + (row.LINENET || 0), 0)
    const totalRevenueUSD = revenue.reduce((sum, row) => sum + (row.REPORTNET || 0), 0)
    
    const expense = await fetchExpenseTotals()
    const totalExpenseTMT = expense.reduce((sum, row) => sum + (row.LINENET || 0), 0)
    const totalExpenseUSD = expense.reduce((sum, row) => sum + (row.REPORTNET || 0), 0)

    const totalProfitTMT = totalRevenueTMT - totalExpenseTMT
    const totalProfitUSD = totalRevenueUSD - totalExpenseUSD

    return {
        revenue,
        totalRevenueTMT,
        totalRevenueUSD,
        expense,
        totalExpenseTMT,
        totalExpenseUSD,
        totalProfitTMT,
        totalProfitUSD
    }

}