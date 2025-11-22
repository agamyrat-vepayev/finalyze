import {
  fetchClientNames,
  fetchRevenueTotals,
  fetchExpenseTotals,
  fetchRevenueDetails,
  fetchExpenseDetails,
} from "../repositories/income.js";

export async function getStatementTotals(clientCode) {
  const revenue = await fetchRevenueTotals(clientCode);
  const totalRevenueTMT = revenue.reduce(
    (sum, row) => sum + (row.LINENET || 0),
    0
  );
  const totalRevenueUSD = revenue.reduce(
    (sum, row) => sum + (row.REPORTNET || 0),
    0
  );

  const expense = await fetchExpenseTotals(clientCode);
  const totalExpenseTMT = expense.reduce(
    (sum, row) => sum + (row.LINENET || 0),
    0
  );
  const totalExpenseUSD = expense.reduce(
    (sum, row) => sum + (row.REPORTNET || 0),
    0
  );

  const totalProfitTMT = totalRevenueTMT - totalExpenseTMT;
  const totalProfitUSD = totalRevenueUSD - totalExpenseUSD;

  const clientNames = await fetchClientNames();

  return {
    revenue,
    totalRevenueTMT,
    totalRevenueUSD,
    expense,
    totalExpenseTMT,
    totalExpenseUSD,
    totalProfitTMT,
    totalProfitUSD,
    clientNames,
  };
}

export async function getRevenueDetails(
  category,
  clientCode,
  page = 1,
  pageSize = 50
) {
  const offset = (page - 1) * pageSize;

  const { results, totalRows } = await fetchRevenueDetails(
    category,
    clientCode,
    offset,
    pageSize
  );

  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: results,
    totalItems: totalRows,
    totalPages,
    currentPage: page,
  };
}

export async function getExpenseDetails(
  category,
  clientCode,
  page = 1,
  pageSize = 50
) {
  const offset = (page - 1) * pageSize;

  const { results, totalRows } = await fetchExpenseDetails(
    category,
    clientCode,
    offset,
    pageSize
  );

  const totalPages = totalRows > 0 ? Math.ceil(totalRows / pageSize) : 1;

  return {
    data: results,
    totalItems: totalRows,
    totalPages,
    currentPage: page,
  };
}
