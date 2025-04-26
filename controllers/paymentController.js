const mongoose = require('mongoose'); // <-- you missed this
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const Payment = require('../models/paymentModel');
const OrderModel = require('../models/orderModel');

// Create payment intent
// In your createPaymentIntent function, add validation for the ObjectId format
const createPaymentIntent = async (req, res) => {
    try {
      const { orderId, paymentMethod, currency = 'usd' } = req.body;
      
      // Validate request
      if (!orderId || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and payment method are required'
        });
      }
      
      // Add this validation for ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID format'
        });
      }
      
      
    
    // Get order details
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Ensure order hasn't been paid already
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid'
      });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe requires amount in cents
      currency,
      metadata: {
        orderId: order._id.toString(),
        userId: order.user.toString()
      }
    });
    
    // Create payment record in database
    const payment = await Payment.create({
      order: order._id,
      user: order.user,
      paymentMethod,
      paymentIntentId: paymentIntent.id,
      amount: order.totalAmount,
      currency,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment intent created',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id
      }
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: err.message
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Find payment in our database
    const payment = await Payment.findOne({ paymentIntentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Update payment status based on Stripe status
    payment.status = paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed';
    payment.updatedAt = Date.now();
    await payment.save();
    
    // If payment succeeded, update order payment status
    if (payment.status === 'succeeded') {
      await OrderModel.findByIdAndUpdate(payment.order, {
        paymentStatus: 'paid'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Payment ${payment.status}`,
      data: {
        paymentStatus: payment.status,
        orderId: payment.order
      }
    });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: err.message
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment fetched successfully',
      data: payment
    });
  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: err.message
    });
  }
};

// Get all payments for a user
const getPaymentsByUser = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.params.userId })
      .populate('order')
      .sort({ createdAt: -1 });
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No payments found for this user'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User payments fetched successfully',
      count: payments.length,
      data: payments
    });
  } catch (err) {
    console.error('Error fetching user payments:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching user payments',
      error: err.message
    });
  }
};

// Get payments for an order
const getPaymentsByOrder = async (req, res) => {
  try {
    const payments = await Payment.find({ order: req.params.orderId })
      .sort({ createdAt: -1 });
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No payments found for this order'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order payments fetched successfully',
      count: payments.length,
      data: payments
    });
  } catch (err) {
    console.error('Error fetching order payments:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching order payments',
      error: err.message
    });
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }
    
    // Get payment details
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if payment was successful
    if (payment.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Only successful payments can be refunded'
      });
    }
    
    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Optional partial refund
      metadata: {
        reason: reason || 'Customer requested'
      }
    });
    
    // Update payment status
    payment.status = 'refunded';
    payment.updatedAt = Date.now();
    await payment.save();
    
    // Update order status if it exists
    if (payment.order) {
      await OrderModel.findByIdAndUpdate(payment.order, {
        paymentStatus: 'refunded'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100, // Convert back to dollars
        status: refund.status
      }
    });
  } catch (err) {
    console.error('Error processing refund:', err);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: err.message
    });
  }
};

// Webhook handler for Stripe events
const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody, // You need to add raw body parsing middleware
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handleFailedPayment(failedPayment);
        break;
        
      // Handle other event types as needed
    }
    
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }
};

// Helper functions for webhook handlers
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (payment) {
      payment.status = 'succeeded';
      payment.updatedAt = Date.now();
      await payment.save();
      
      // Update order status
      await OrderModel.findByIdAndUpdate(payment.order, {
        paymentStatus: 'paid'
      });
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

const handleFailedPayment = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (payment) {
      payment.status = 'failed';
      payment.updatedAt = Date.now();
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentById,
  getPaymentsByUser,
  getPaymentsByOrder,
  processRefund,
  stripeWebhook
};