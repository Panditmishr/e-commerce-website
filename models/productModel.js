const mongoose = require("mongoose");
const DimensionsSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  depth: Number
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  date: Date,
  reviewerName: String,
  reviewerEmail: String
}, { _id: false });

const MetaSchema = new mongoose.Schema({
  createdAt: Date,
  updatedAt: Date,
  barcode: String,
  qrCode: String
}, { _id: false });

const productSchema = new mongoose.Schema({
  // Change: Using MongoDB's default _id instead of custom numeric id
  // MongoDB will automatically create and manage ObjectId values
  // id: { type: Number, unique: true, required: true },
  title: { type: String, required: true },
  description: String,
  category: String,
  price: Number,
  discountPercentage: Number,
  rating: Number,
  stock: Number,
  tags: [String],
  brand: String,
  sku: String,
  weight: Number,
  dimensions: DimensionsSchema,
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: String,
  reviews: [ReviewSchema],
  returnPolicy: String,
  minimumOrderQuantity: Number,
  meta: MetaSchema,
  thumbnail: String,
  images: [String]
});

const ProductModel = mongoose.model('Product', productSchema);
module.exports = ProductModel;
