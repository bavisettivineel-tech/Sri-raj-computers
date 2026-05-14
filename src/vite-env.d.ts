/// <reference types="vite/client" />

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  handler: (response: { razorpay_payment_id: string }) => void;
  prefill?: {
    name?: string;
    contact?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => {
    open: () => void;
  };
}
