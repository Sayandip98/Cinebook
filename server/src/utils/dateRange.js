const APP_UTC_OFFSET = '+05:30';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getDayRange = (dateString) => {
  const start = new Date(`${dateString}T00:00:00${APP_UTC_OFFSET}`);
  return { start, end: new Date(start.getTime() + MS_PER_DAY) };
};
