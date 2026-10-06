const IST_OFFSET = '+05:30';

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// ISO instant -> "YYYY-MM-DDTHH:mm" in IST (the value a datetime-local input expects).
export const isoToIstInput = (iso) => {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(new Date(iso)).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

// "YYYY-MM-DDTHH:mm" entered as IST -> ISO instant.
export const istInputToIso = (value) => new Date(`${value}:00${IST_OFFSET}`).toISOString();

export const nowIstInput = () => isoToIstInput(new Date());
