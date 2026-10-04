import { escapeHtml } from '../utils/escapeHtml.js';

const formatShowTime = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);

export const bookingConfirmationTemplate = ({ name, booking }) => {
  const { show } = booking;
  const seats = booking.seats.map((seat) => seat.seatLabel).join(', ');

  return `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Booking confirmed, ${escapeHtml(name)}!</h2>
    <p>Show this QR code at the theater entrance.</p>
    <p><img src="cid:ticket-qr" width="200" height="200" alt="Ticket QR code" /></p>
    <table cellpadding="6">
      <tr><td><strong>Booking code</strong></td><td>${escapeHtml(booking.bookingCode)}</td></tr>
      <tr><td><strong>Movie</strong></td><td>${escapeHtml(show.movie.title)}</td></tr>
      <tr><td><strong>Theater</strong></td><td>${escapeHtml(show.theater.name)}, ${escapeHtml(show.theater.city)}</td></tr>
      <tr><td><strong>Screen</strong></td><td>${escapeHtml(show.screen.name)}</td></tr>
      <tr><td><strong>Show time</strong></td><td>${escapeHtml(formatShowTime(show.startTime))}</td></tr>
      <tr><td><strong>Seats</strong></td><td>${escapeHtml(seats)}</td></tr>
      <tr><td><strong>Amount paid</strong></td><td>&#8377;${escapeHtml(booking.totalAmount)}</td></tr>
    </table>
  </body>
</html>`;
};
