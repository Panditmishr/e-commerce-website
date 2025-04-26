const express = require('express');

const router = express.Router();

const couponController = require('../controllers/couponController');

router.post('/add', couponController.addCoupon);

router.get('/get', couponController.getAllCoupon);

module.exports = router;