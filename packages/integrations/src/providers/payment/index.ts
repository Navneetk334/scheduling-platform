export { stripe } from './stripe';
export { razorpay } from './razorpay';
export { paypal } from './paypal';

import { paypal } from './paypal';
import { razorpay } from './razorpay';
import { stripe } from './stripe';

export const paymentProviders = [stripe, razorpay, paypal];
