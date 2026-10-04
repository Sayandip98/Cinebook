import { escapeHtml } from '../utils/escapeHtml.js';

export const verifyEmailTemplate = ({ name, link, expiresInHours }) => `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Welcome to CineBook, ${escapeHtml(name)}!</h2>
    <p>Please confirm your email address to complete your registration.</p>
    <p>
      <a href="${escapeHtml(link)}"
         style="background:#e11d48;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;">
        Verify email
      </a>
    </p>
    <p>This link expires in ${expiresInHours} hours. If you did not create an account, ignore this email.</p>
  </body>
</html>`;
