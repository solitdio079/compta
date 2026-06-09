export function formatMoney(value: number | string, language = "fr") {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatNumber(value: number | string, language = "fr", maximumFractionDigits = 2) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US", {
    maximumFractionDigits,
  }).format(Number.isFinite(n) ? n : 0);
}
