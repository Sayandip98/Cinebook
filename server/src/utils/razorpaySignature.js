import crypto from 'node:crypto';

const hmacHex = (secret, payload) =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex');

const safeEqual = (expected, received) => {
  if (typeof received !== 'string') return false;
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }, secret) =>
  safeEqual(hmacHex(secret, `${orderId}|${paymentId}`), signature);

export const verifyWebhookSignature = (rawBody, signature, secret) =>
  safeEqual(hmacHex(secret, rawBody), signature);
