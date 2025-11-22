function handleClientNames(event) {
  const selectedValue = event.target.value;
  window.location.href = `/construction/income/totals?clientCode=${encodeURIComponent(
    selectedValue
  )}`;
}
