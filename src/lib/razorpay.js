import { BRAND } from '../config/brand';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TU4kZv0jfTGORp';

/**
 * Dynamically loads the Razorpay checkout script
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay payment modal
 */
export async function openRazorpayCheckout({ orderId, amount, customer, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure?.('Could not load Razorpay payment gateway. Please check your internet connection.');
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: Math.round(amount * 100), // Amount in paise
    currency: 'INR',
    name: BRAND.fullName,
    description: `Order ${orderId} - Sri Vaikunta Sarees`,
    image: '/favicon.svg',
    prefill: {
      name: customer.fullName || '',
      email: customer.email || '',
      contact: customer.phone || '',
    },
    theme: {
      color: '#68081C',
    },
    handler: function (response) {
      onSuccess?.({
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: function () {
        onFailure?.('Payment cancelled by customer');
      },
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      onFailure?.(response.error.description || 'Payment failed');
    });
    rzp.open();
  } catch (err) {
    onFailure?.(err.message || 'Could not initiate payment');
  }
}
