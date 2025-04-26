const ProductModel = require('../models/productModel');
const UserModel = require('../models/userModel');
const dotenv = require('dotenv');
dotenv.config();
const fetchProducts = async (req, res) => {
    try {
        const pageSize = req.query.pageSize || 10;
        const pageNo = req.query.pageNo || 1;
        const itemsToSkip = (pageNo - 1) * pageSize;
        const searchKey = req.query.searchKey || "";
        const searchQuery = {
            $or:[{
                title: new RegExp(searchKey , "gi")
            },
            {
                description: new RegExp(searchKey , "gi")
            },
            {
               category: new RegExp(searchKey , "gi")
            },
            {
               tags:{
                $in: [searchKey]
               },
            },
            
        ],
        };
        const totalProduct = await ProductModel.find({}).countDocuments();
        const data = await ProductModel.find({
            title: new RegExp(searchKey , "gi")
        },
        {
            title: 1,
            price: 1,
            rating: 1,
            thumbnail: 1
        }
    ).skip(itemsToSkip).limit(pageSize); // optional: fetch products
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            results: data
        });
    } catch (err) {
        console.log(err, "error in fetching products");
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
};

const fetchProductDetails = async (req, res) => {
    try {
        const productId = req.params.id;
        const data = await ProductModel.findById(productId);
        res.status(200).json({
            success: true,
            message: "Product details fetched successfully",
            results: data
        });
    } catch (err) {
        console.log(err, "error in fetching product details");
        res.status(500).json({ success: false, message: "Error fetching product details" });
    }
};

const createProduct = async (req, res) => {
    try {
        const data = await ProductModel.create(req.body);
        res.status(200).json({
            success: true,
            message: "Product created successfully",
            results: data
        });
    } catch (err) {
        console.log(err, "error in creating product");
        res.status(500).json({ success: false, message: "Error creating product" });
    }
};
const productReview = async (req, res) => {
    try{
        console.log(req.cookies, "cookies")
        let token = req.headers.authorization || "";
        token = token.split(" ")[1];
       
        
        if (!token) {
            return res.status(401).json({
              success: false,
              message: "Please login to continue"
            });
          }
          
          const isValidToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      
        let user = await UserModel.findById(req.body.userId);
        await ProductModel.findByIdAndUpdate(req.body.productId, {
            
            $push: {
                reviews: {
                    rating: req.body.rating,
                    comment: req.body.comment,
                    date: new Date(),
                    reviewerName: user.firstname,
                    reviewerEmail:user.email
                },
            },
        })
        .populate("products.productId")
        .populate("userId");
        res.status(200).json({
            success: true,
            message: "card details fetched successfully",
           
        });
    }

    catch(err){
        console.log(err, "error fetching card details");
    }
 }

module.exports = { fetchProducts, fetchProductDetails, createProduct, productReview };
