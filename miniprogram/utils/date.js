function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`;
}

function formatMonthDay(dateStr) {
  return dateStr.slice(5);
}

function todayStr() {
  return formatDate(new Date());
}

module.exports = {
  formatDate,
  formatMonthDay,
  todayStr
};
