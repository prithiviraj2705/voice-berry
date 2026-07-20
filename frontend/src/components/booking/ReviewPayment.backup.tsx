import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabaseClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_123'); // Dummy fallback if not set

const CheckoutForm = ({ clientSecret, bookingId, paymentMethod, email, receiptData, onSuccess, onError }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsConfirming(true);

    if (paymentMethod === 'stripe') {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (error) {
        onError(error.message);
        setIsConfirming(false);
        return;
      }
    }

    // First create the booking in DB
    let actualBookingId = bookingId;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const createRes = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'anonymous',
          serviceType: receiptData.metadata?.serviceType || 'City Transfer',
          pickup: receiptData.pickup,
          destination: receiptData.destination,
          datetime: receiptData.datetime,
          passengers: receiptData.passengers,
          vehicleType: receiptData.vehicleType,
          fare: receiptData.amount,
          flightNumber: receiptData.flightNumber,
          specialInstructions: receiptData.instructions,
          metadata: receiptData.metadata
        })
      });
      const createData = await createRes.json();
      if (createData.booking?.id) {
        actualBookingId = createData.booking.id;
      }
    } catch (err) {
      console.error("Failed to create booking record", err);
    }

    // Call backend to complete payment and send email
    try {
      const confirmRes = await fetch('http://localhost:3000/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: actualBookingId, 
          paymentMethod, 
          email,
          receiptData
        })
      });
      const confirmData = await confirmRes.json();
      onSuccess(confirmData.warning);
    } catch (err: any) {
      onError(err.message || "Failed to confirm payment on server");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {paymentMethod === 'stripe' && (
        <div className="bg-white p-4 rounded-xl border border-border">
          <PaymentElement />
        </div>
      )}
      <Button 
        type="submit"
        disabled={isConfirming || !stripe || !elements}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg rounded-xl shadow-lg relative overflow-hidden"
      >
        {isConfirming ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          "Confirm & Pay"
        )}
      </Button>
    </form>
  );
};

interface ReviewPaymentProps {
  onBack: () => void;
}

const ReviewPayment: React.FC<ReviewPaymentProps> = ({ onBack }) => {
  const location = useLocation();
  const bookingDetails = location.state?.bookingDetails || {
    pickup: 'Marina Bay Sands, 10 Bayfront Ave, Singapore',
    destination: 'Changi Airport Terminal 3',
    datetime: 'Tomorrow, 06:00 AM',
    passengers: 2,
    vehicleType: 'Premium SUV',
    flightNumber: 'SQ 322',
    instructions: 'None',
    basePrice: 45.00
  };

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
  const [clientSecret, setClientSecret] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasWarning, setHasWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Fetch PaymentIntent
    const fetchIntent = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/payments/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: 'test-id', amount: bookingDetails.basePrice || 45.00 })
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        console.error("Failed to create intent", err);
      }
    };
    fetchIntent();
  }, [bookingDetails.basePrice]);

  const handleSuccess = (warning: boolean) => {
    setIsSuccess(true);
    setHasWarning(warning);
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto space-y-6"
      >
        <Card className="p-8 text-center space-y-6 border-none shadow-xl bg-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-success"></div>
          
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Booking Confirmed</h2>
            <p className="text-muted-foreground">Your driver is assigned and your ride is scheduled.</p>
          </div>
          
          <div className="bg-muted p-6 rounded-2xl text-left space-y-4">
            <h3 className="font-semibold border-b border-border pb-2">Receipt Preview</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-medium">#UL-8492X</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium text-accent">S$ 45.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">{paymentMethod === 'stripe' ? 'Card ending in 4242' : 'Cash to Driver'}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to your registered address.
          </p>

          <Button className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl" onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </Card>

        {hasWarning && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-warning-bg border border-yellow-200 p-4 rounded-xl flex gap-3 text-yellow-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Booking confirmed, but we couldn't send the confirmation email. You can view your receipt in the dashboard.</p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Edit
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Review Details */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-2xl font-semibold">Review your booking</h2>
          
          <Card className="p-6 space-y-6 shadow-sm border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Service</p>
                <p className="font-medium">{bookingDetails.serviceType || 'Point-to-Point'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                <p className="font-medium">{bookingDetails.datetime}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">From</p>
                <p className="font-medium">{bookingDetails.pickup || 'Not Provided'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">To</p>
                <p className="font-medium">{bookingDetails.destination || 'Not Provided'}</p>
              </div>
              {bookingDetails.vehicleType && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
                  <p className="font-medium">{bookingDetails.vehicleType}</p>
                </div>
              )}
              {bookingDetails.passengers > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Passengers</p>
                  <p className="font-medium">{bookingDetails.passengers} People</p>
                </div>
              )}
              {bookingDetails.flightNumber && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Flight Number</p>
                  <p className="font-medium">{bookingDetails.flightNumber}</p>
                </div>
              )}
              {bookingDetails.metadata?.duration && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{bookingDetails.metadata.duration} Hours</p>
                </div>
              )}
              {bookingDetails.metadata?.isReturnTrip && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trip Type</p>
                  <p className="font-medium">Round Trip (Return included)</p>
                </div>
              )}
              {bookingDetails.metadata?.companyName && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Company</p>
                  <p className="font-medium">{bookingDetails.metadata.companyName} (Ref: {bookingDetails.metadata.billingRef})</p>
                </div>
              )}
              {bookingDetails.metadata?.recipientName && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Package Delivery Details</p>
                  <p className="font-medium">{bookingDetails.metadata.packageSize}</p>
                  <p className="text-sm mt-1">Recipient: {bookingDetails.metadata.recipientName} ({bookingDetails.metadata.recipientPhone})</p>
                </div>
              )}
              {bookingDetails.metadata?.accessibilityNotes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Accessibility Notes</p>
                  <p className="font-medium">{bookingDetails.metadata.accessibilityNotes}</p>
                </div>
              )}
              {bookingDetails.metadata?.days && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{bookingDetails.metadata.days} Days</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Special Instructions</p>
                <p className="font-medium">{bookingDetails.instructions || 'None'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6 shadow-sm border-border bg-card">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total Fare</p>
              <p className="text-4xl font-bold text-foreground">S$ {bookingDetails.basePrice?.toFixed(2) || '45.00'}</p>
              <p className="text-xs text-muted-foreground mt-2">Includes all taxes and tolls.</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-semibold text-lg">Payment Method</h3>
              
              <div 
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                  paymentMethod === 'stripe' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border hover:border-accent/50'
                }`}
                onClick={() => setPaymentMethod('stripe')}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'stripe' ? 'border-accent' : 'border-muted-foreground'}`}>
                  {paymentMethod === 'stripe' && <div className="w-3 h-3 bg-accent rounded-full"></div>}
                </div>
                <CreditCard className={`w-6 h-6 ${paymentMethod === 'stripe' ? 'text-accent' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="font-medium">Credit / Debit Card</p>
                  <p className="text-xs text-muted-foreground">Powered by Stripe</p>
                </div>
              </div>

              <div 
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                  paymentMethod === 'cash' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border hover:border-accent/50'
                }`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'cash' ? 'border-accent' : 'border-muted-foreground'}`}>
                  {paymentMethod === 'cash' && <div className="w-3 h-3 bg-accent rounded-full"></div>}
                </div>
                <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-accent' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="font-medium">Pay Cash to Driver</p>
                  <p className="text-xs text-muted-foreground">Have exact change ready</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-xl">
                {errorMessage}
              </div>
            )}

            {clientSecret && paymentMethod === 'stripe' ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}>
                <CheckoutForm 
                  clientSecret={clientSecret}
                  bookingId="test-id"
                  paymentMethod={paymentMethod}
                  email="user@example.com"
                  receiptData={{ 
                    amount: bookingDetails.basePrice || 45.00, 
                    destination: bookingDetails.destination,
                    pickup: bookingDetails.pickup,
                    datetime: bookingDetails.datetime,
                    passengers: bookingDetails.passengers,
                    vehicleType: bookingDetails.vehicleType,
                    flightNumber: bookingDetails.flightNumber,
                    instructions: bookingDetails.instructions,
                    metadata: bookingDetails.metadata
                  }}
                  onSuccess={handleSuccess}
                  onError={setErrorMessage}
                />
              </Elements>
            ) : paymentMethod === 'cash' ? (
              <Button 
                onClick={async () => {
                  setErrorMessage('');
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    const createRes = await fetch('http://localhost:3000/api/bookings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user?.id || 'anonymous',
                        serviceType: bookingDetails.serviceType || 'City Transfer',
                        pickup: bookingDetails.pickup,
                        destination: bookingDetails.destination,
                        datetime: bookingDetails.datetime,
                        passengers: bookingDetails.passengers,
                        vehicleType: bookingDetails.vehicleType,
                        fare: bookingDetails.basePrice,
                        flightNumber: bookingDetails.flightNumber,
                        specialInstructions: bookingDetails.instructions,
                        metadata: bookingDetails.metadata
                      })
                    });
                    const createData = await createRes.json();
                    
                    const confirmRes = await fetch('http://localhost:3000/api/payments/confirm', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        bookingId: createData.booking?.id || 'test-id', 
                        paymentMethod: 'cash', 
                        email: user?.email || 'user@example.com',
                        receiptData: { amount: bookingDetails.basePrice }
                      })
                    });
                    const confirmData = await confirmRes.json();
                    handleSuccess(confirmData.warning);
                  } catch (err: any) {
                    setErrorMessage(err.message || 'Failed to complete cash booking');
                  }
                }}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg rounded-xl shadow-lg"
              >
                Confirm Cash Booking
              </Button>
            ) : (
              <div className="flex items-center justify-center p-4">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default ReviewPayment;
