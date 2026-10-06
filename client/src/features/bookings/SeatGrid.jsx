import { useMemo } from 'react';
import { SEAT_STATUS } from '@/constants/booking';
import { cx } from '@/utils/classNames';
import { formatCurrency } from '@/utils/format';
import styles from './SeatGrid.module.css';

const ROW_LABEL_OFFSET = 64; // row 1 -> 'A'

const buildRows = ({ seats, layout }) => {
  const byPosition = new Map(seats.map((seat) => [`${seat.row}-${seat.column}`, seat]));
  const rows = [];
  let previousCategory = null;

  for (let row = 1; row <= layout.rows; row += 1) {
    const cells = Array.from(
      { length: layout.columns },
      (_, index) => byPosition.get(`${row}-${index + 1}`) ?? null,
    );
    const firstSeat = cells.find(Boolean);
    if (!firstSeat) continue;

    rows.push({
      row,
      label: String.fromCharCode(ROW_LABEL_OFFSET + row),
      category: firstSeat.category,
      price: firstSeat.price,
      showHeading: firstSeat.category !== previousCategory,
      cells,
    });
    previousCategory = firstSeat.category;
  }
  return rows;
};

export default function SeatGrid({ seatMap, selectedLabels, maxReached, onToggle }) {
  const rows = useMemo(() => buildRows(seatMap), [seatMap]);
  const selected = useMemo(() => new Set(selectedLabels), [selectedLabels]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <div className={styles.inner}>
          <div className={styles.stage}>
            <div className={styles.screen} aria-hidden="true" />
            <p className={styles.screenLabel}>Screen this way</p>
          </div>

          {rows.map((row) => (
            <div key={row.row}>
              {row.showHeading && (
                <p className={styles.category}>
                  {row.category} · {formatCurrency(row.price)}
                </p>
              )}
              <div className={styles.row} role="group" aria-label={`Row ${row.label}`}>
                <span className={styles.rowLabel} aria-hidden="true">
                  {row.label}
                </span>
                {row.cells.map((seat, index) => {
                  if (!seat) return <span key={index} className={styles.gap} aria-hidden="true" />;

                  const isSelected = selected.has(seat.seatLabel);
                  const isAvailable = seat.status === SEAT_STATUS.AVAILABLE;
                  const stateClass = !isAvailable
                    ? seat.status === SEAT_STATUS.BOOKED
                      ? styles.booked
                      : styles.held
                    : undefined;

                  return (
                    <button
                      key={seat.seatLabel}
                      type="button"
                      className={cx(styles.seat, isSelected && styles.selected, stateClass)}
                      disabled={!isAvailable || (!isSelected && maxReached)}
                      aria-pressed={isSelected}
                      aria-label={`Seat ${seat.seatLabel}, ${seat.category}, ${formatCurrency(seat.price)}, ${
                        isAvailable ? 'available' : seat.status.toLowerCase()
                      }`}
                      onClick={() => onToggle(seat.seatLabel)}
                    >
                      {seat.column}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ul className={styles.legend}>
        <li>
          <span className={styles.swatch} /> Available
        </li>
        <li>
          <span className={cx(styles.swatch, styles.selected)} /> Selected
        </li>
        <li>
          <span className={cx(styles.swatch, styles.held)} /> Held by others
        </li>
        <li>
          <span className={cx(styles.swatch, styles.booked)} /> Sold
        </li>
      </ul>
    </div>
  );
}
