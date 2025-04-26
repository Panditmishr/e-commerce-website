const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

router.post('/card/add', cardController.addTocard);
router.get('/card/list', cardController.fetchcardDetails);
router.get("/card/update" , cardController.updateCard);


module.exports = router;