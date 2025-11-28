import {
  fetchClientNames,
  fetchRevenueTotals,
  fetchExpenseTotals,
  fetchRevenueDetails,
  fetchExpenseDetails,
} from "../repositories/income.js";

export async function getStatementTotals(
  clientCode,
  month,
  year,
  startDate,
  endDate
) {
  const months = month ? month.split(",") : [];
  const years = year ? year.split(",") : [];

  const { allClients, selectedClient } = await fetchClientNames(clientCode);

  const revenue = await fetchRevenueTotals(
    clientCode,
    months,
    years,
    startDate,
    endDate
  );
  const totalRevenueTMT = revenue.reduce(
    (sum, row) => sum + (row.LINENET || 0),
    0
  );
  const totalRevenueUSD = revenue.reduce(
    (sum, row) => sum + (row.REPORTNET || 0),
    0
  );

  const expense = await fetchExpenseTotals(
    clientCode,
    months,
    years,
    startDate,
    endDate
  );
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

  return {
    allClients,
    selectedClient,
    revenue,
    totalRevenueTMT,
    totalRevenueUSD,
    expense,
    totalExpenseTMT,
    totalExpenseUSD,
    totalProfitTMT,
    totalProfitUSD,
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

  const totalPages = totalRows > 0 ? Math.ceil(totalRows / pageSize) : 1;

  const { allClients, selectedClient } = await fetchClientNames(clientCode);
  const clientName = selectedClient ? selectedClient.DEFINITION_ : clientCode;

  return {
    data: results,
    totalItems: totalRows,
    totalPages,
    currentPage: page,
    clientName,
    allClients,
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

  const { allClients, selectedClient } = await fetchClientNames(clientCode);
  const clientName = selectedClient ? selectedClient.DEFINITION_ : clientCode;

  return {
    data: results,
    totalItems: totalRows,
    totalPages,
    currentPage: page,
    clientName,
    allClients,
  };
}
