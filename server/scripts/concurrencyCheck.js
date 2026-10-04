/* eslint-disable no-console */
const API = process.env.API_URL || 'http://localhost:5000/api/v1';
const [showId, seatLabel = 'C5'] = process.argv.slice(2);

if (!showId) {
  console.error('Usage: node scripts/concurrencyCheck.js <showId> [seatLabel]');
  process.exit(1);
}

const headers = { 'Content-Type': 'application/json' };
const emails = [1, 2, 3, 4, 5].map((n) => `user${n}@cinebook.com`);

const login = async (email) => {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password: 'Password@123' }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Login failed for ${email}: ${body.message}`);
  return body.data.accessToken;
};

const tokens = await Promise.all(emails.map(login));

const statuses = await Promise.all(
  tokens.map(async (token) => {
    const response = await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ showId, seats: [seatLabel] }),
    });
    return response.status;
  }),
);

console.log('Statuses:', statuses.join(', '));
const winners = statuses.filter((status) => status === 201).length;
console.log(winners === 1 ? 'PASS: exactly one booking won' : `FAIL: ${winners} winners`);


// npm run check:concurrency -- <showId> C5