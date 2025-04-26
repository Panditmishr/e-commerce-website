const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create payment intent
router.post('/create-intent', paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', paymentController.confirmPayment);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Get payments by user
router.get('/user/:userId', paymentController.getPaymentsByUser);

// Get payments by order
router.get('/order/:orderId', paymentController.getPaymentsByOrder);

// Process refund
router.post('/refund', paymentController.processRefund);

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

module.exports = router;