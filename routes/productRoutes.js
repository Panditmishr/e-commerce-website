const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/Product/List', productController.fetchProducts);
router.get('/Product/:id', productController.fetchProductDetails);
router.post('/Product/create', productController.createProduct);
router.post("/Product/review" , productController.productReview);

module.exports = router;