const express = require ('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/getOrder', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/createOrder', orderController.createOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);


module.exports = router;