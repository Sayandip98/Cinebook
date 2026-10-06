const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let pending = null;

export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);

  if (!pending) {
    pending = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.onload = () => resolve(true);
      script.onerror = () => {
        script.remove();
        pending = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return pending;
};
