import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Resend } from 'resend';

import { prisma } from '../prisma';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, amount } = req.body;

    const numericAmount = Number(amount);
    if (!bookingId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: 'Missing bookingId or amount' });
      return;
    }

    if (!stripe) {
      console.warn('STRIPE_SECRET_KEY is missing. Payment intent cannot be created.');
      res.status(503).json({ error: 'Stripe is not configured on this server.' });
      return;
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numericAmount * 100), // Stripe expects cents
      currency: 'sgd',
      metadata: { bookingId },
      // In latest Stripe API, automatic_payment_methods is enabled by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment intent' });
  }
};

export const confirmPaymentAndSendEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, paymentMethod, email, receiptData } = req.body;

    if (!bookingId) {
      res.status(400).json({ error: 'Missing bookingId' });
      return;
    }

    // Update booking and ride statuses in database
    if (!paymentMethod || !receiptData?.amount) {
      res.status(400).json({ error: 'Missing payment confirmation details' });
      return;
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'confirmed',
        paymentMethod: paymentMethod || 'stripe' 
      },
      include: {
        user: true
      }
    });

    // Optionally create a payment record
    if (receiptData?.amount || booking.fare) {
       await prisma.payment.upsert({
         where: { bookingId },
         update: {
           amount: Number(receiptData?.amount || booking.fare),
           method: paymentMethod || 'stripe',
           status: 'succeeded'
         },
         create: {
           bookingId,
           amount: Number(receiptData?.amount || booking.fare),
           method: paymentMethod || 'stripe',
           status: 'succeeded'
         }
       });
    }

    if (!resend) {
      console.warn('RESEND_API_KEY is missing. Confirmation email skipped.');
      res.json({ success: true, warning: 'Email not sent due to missing configuration' });
      return;
    }

    const targetEmail = email || booking.user?.email;

    if (targetEmail) {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: targetEmail,
        subject: 'Booking Confirmed - Ulacab',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1A1F3C;">
            <h1 style="color: #C4844A;">Booking Confirmed</h1>
            <p>Thank you for choosing Ulacab. Your ride is confirmed.</p>
            <div style="background-color: #F5F1EB; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="margin-top: 0; color: #252B4A;">Ride Details</h3>
              <p><strong>Service Type:</strong> ${booking.serviceType}</p>
              <p><strong>Pickup:</strong> ${booking.pickup}</p>
              <p><strong>Destination:</strong> ${booking.destination || 'As directed'}</p>
              <p><strong>Date & Time:</strong> ${new Date(booking.datetime).toLocaleString()}</p>
              <p><strong>Passengers:</strong> ${booking.passengers}</p>
              <p><strong>Vehicle Type:</strong> ${booking.vehicleType}</p>
              <hr style="border-top: 1px solid #E0DCD6; margin: 20px 0;" />
              <p style="font-size: 18px; font-weight: bold;"><strong>Total Fare:</strong> S$ ${booking.fare.toFixed(2)}</p>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #8A8A8A;">If you have any questions, please contact our support team.</p>
          </div>
        `,
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm payment' });
  }
};
