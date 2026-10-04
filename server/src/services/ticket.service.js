import QRCode from 'qrcode';

const QR_OPTIONS = { errorCorrectionLevel: 'M', margin: 2, width: 300 };

export const generateQrDataUrl = (bookingCode) => QRCode.toDataURL(bookingCode, QR_OPTIONS);

export const generateQrBuffer = (bookingCode) => QRCode.toBuffer(bookingCode, QR_OPTIONS);
