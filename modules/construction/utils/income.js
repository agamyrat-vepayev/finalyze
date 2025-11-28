export function dateFilter({
  months = [],
  years = [],
  startDate,
  endDate,
  columnName,
}) {
  let filters = [];

  if (startDate && endDate) {
    filters.push(`${columnName} BETWEEN '${startDate}' AND '${endDate}'`);
  } else {
    if (years.length)
      filters.push(
        `YEAR(${columnName}) IN (${years.map((y) => parseInt(y)).join(",")})`
      );
    if (months.length)
      filters.push(
        `MONTH(${columnName}) IN (${months.map((m) => parseInt(m)).join(",")})`
      );
  }

  if (filters.length) return `AND ${filters.join(" AND ")}`;
  return "";
}
