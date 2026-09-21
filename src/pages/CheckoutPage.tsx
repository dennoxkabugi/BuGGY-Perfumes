import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Smartphone, Banknote, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { createOrder, validateCoupon, incrementCouponUsage } from '@/services/api';
import { formatPrice, generateOrderNumber } from '@/utils/format';
import type { PaymentMethod } from '@/types';
import { supabase } from '@/services/supabase';

const STEPS = ['Information', 'Delivery', 'Payment', 'Confirmation'];

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Form data
  const [customerName, setCustomerName] = useState(user?.user_metadata?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [area, setArea] = useState('');
  const [building, setBuilding] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  // M-Pesa
  const [mpesaPhone, setMpesaPhone] = useState('');

  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const deliveryFee = subtotal > 100 ? 0 : 5;
  const total = subtotal + deliveryFee - couponDiscount;

  if (items.length === 0 && step < 3) {
    navigate('/cart');
    return null;
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const coupon = await validateCoupon(couponCode.trim());
      if (!coupon) {
        setCouponError('Invalid or expired coupon code');
        setCouponDiscount(0);
        setCouponId(null);
        return;
      }
      if (subtotal < coupon.minimum_order) {
        setCouponError(`Minimum order of ${formatPrice(coupon.minimum_order)} required`);
        return;
      }
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (subtotal * coupon.discount_value) / 100;
      } else {
        discount = coupon.discount_value;
      }
      setCouponDiscount(discount);
      setCouponId(coupon.id);
      setCouponError('');
      toast('Coupon applied successfully');
    } catch {
      setCouponError('Failed to validate coupon');
    }
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!customerName.trim() || !email.trim() || !phone.trim()) {
        toast('Please fill in all required fields', 'error');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast('Please enter a valid email address', 'error');
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!county.trim() || !town.trim() || !area.trim()) {
        toast('Please fill in delivery details', 'error');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (paymentMethod === 'mpesa' && !mpesaPhone.trim()) {
        toast('Please enter your M-Pesa phone number', 'error');
        return false;
      }
      if (paymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim())) {
        toast('Please fill in card details', 'error');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 2) setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep()) return;
    if (!user) {
      toast('Please sign in to place your order', 'error');
      navigate('/login');
      return;
    }

    setProcessing(true);
    try {
      const ordNumber = generateOrderNumber();

      // Simulate payment processing (mock)
      // In production, this would call the payment edge function
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const orderData = {
        order_number: ordNumber,
        user_id: user.id,
        subtotal,
        delivery_fee: deliveryFee,
        discount: couponDiscount,
        total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        order_status: 'confirmed',
        customer_name: customerName,
        email,
        phone,
        county,
        town,
        area,
        building,
        delivery_instructions: deliveryInstructions,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.product.price * item.quantity,
        })),
      };

      await createOrder(orderData);

      if (couponId) {
        await incrementCouponUsage(couponId);
      }

      setOrderNumber(ordNumber);
      clearCart();
      setStep(3);
      toast('Order placed successfully!');
    } catch (err) {
      toast('Failed to place order. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'mpesa' as PaymentMethod, label: 'M-Pesa', icon: Smartphone, desc: 'Pay via M-Pesa STK push' },
    { id: 'card' as PaymentMethod, label: 'Card', icon: CreditCard, desc: 'Visa, Mastercard' },
    { id: 'cod' as PaymentMethod, label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center justify-between mb-10 max-w-2xl mx-auto">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {i < step ? <Check size={18} /> : i + 1}
              </div>
              <span className={`text-xs mt-2 hidden sm:block ${i <= step ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-500' : 'bg-neutral-200'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 712 345 678"
                  className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft size={16} /> Back to Cart
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Delivery Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">County *</label>
                  <input
                    type="text"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Town *</label>
                  <input
                    type="text"
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Estate / Area *</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Building / House No.</label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Delivery Instructions</label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={3}
                  placeholder="Any special instructions for delivery..."
                  className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Payment Method</h2>

            {/* Coupon */}
            <div className="bg-neutral-50 rounded-2xl p-4 mb-6 border border-neutral-200">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 bg-white px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
              {couponDiscount > 0 && <p className="text-xs text-green-600 mt-2">Discount: -{formatPrice(couponDiscount)}</p>}
            </div>

            <div className="space-y-3 mb-6">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === method.id ? 'border-amber-500 bg-amber-50' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-amber-500"
                  />
                  <method.icon className="w-5 h-5 text-neutral-700" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{method.label}</p>
                    <p className="text-xs text-neutral-500">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Payment details */}
            {paymentMethod === 'mpesa' && (
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="254712345678"
                  className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  You will receive an M-Pesa prompt on your phone to confirm payment of {formatPrice(total)}.
                </p>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            {paymentMethod === 'cod' && (
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <p className="text-sm text-neutral-700">
                  Pay with cash when your order is delivered. Please ensure exact change is available.
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 mt-6">
              <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="bg-amber-500 text-neutral-900 px-8 py-3 rounded-xl text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Order Placed Successfully!</h2>
            <p className="text-neutral-600 mb-6">
              Thank you for your order. We have sent a confirmation to your email.
            </p>
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 mb-8">
              <p className="text-sm text-neutral-500 mb-1">Your Order Number</p>
              <p className="text-xl font-bold text-neutral-900 font-mono">{orderNumber}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/account/orders')}
                className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="bg-white text-neutral-900 border border-neutral-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
