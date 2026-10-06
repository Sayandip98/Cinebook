const IST = 'Asia/Kolkata';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const releaseFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  timeZone: IST,
});
const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: IST,
});
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: IST,
});
const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: IST }); // YYYY-MM-DD
const weekdayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: IST });
const dayFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: IST });
const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: IST });
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatDuration = (minutes) => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export const formatReleaseDate = (isoDate) => releaseFormatter.format(new Date(isoDate));
export const formatShowTime = (isoDate) => timeFormatter.format(new Date(isoDate));
export const formatShowDateTime = (isoDate) => dateTimeFormatter.format(new Date(isoDate));
export const formatCurrency = (amount) => currencyFormatter.format(amount);

// The next `days` calendar days in IST, as { value: 'YYYY-MM-DD', weekday, day, month }.
export const buildDateOptions = (days = 7) =>
  Array.from({ length: days }, (_, offset) => {
    const date = new Date(Date.now() + offset * MS_PER_DAY);
    return {
      value: dateKeyFormatter.format(date),
      weekday: offset === 0 ? 'Today' : weekdayFormatter.format(date),
      day: dayFormatter.format(date),
      month: monthFormatter.format(date),
    };
  });
