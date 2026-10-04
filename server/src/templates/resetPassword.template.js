import { escapeHtml } from '../utils/escapeHtml.js';

export const resetPasswordTemplate = ({ name, link, expiresInMinutes }) => `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Reset your password</h2>
    <p>Hi ${escapeHtml(name)}, we received a request to reset your CineBook password.</p>
    <p>
      <a href="${escapeHtml(link)}"
         style="background:#e11d48;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;">
        Choose a new password
      </a>
    </p>
    <p>This link expires in ${expiresInMinutes} minutes and works once. If this wasn't you, ignore this email.</p>
  </body>
</html>`;
