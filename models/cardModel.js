const mongoose = require('mongoose');
const cardProductSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }, { _id: false });
  
  const cardSchema = new mongoose.Schema({
    products: {
      type: [cardProductSchema],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  });
  
  const CardModel = mongoose.model('CardModel', cardSchema);
  module.exports = CardModel;