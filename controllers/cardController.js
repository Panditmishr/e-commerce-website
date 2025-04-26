const CardModel = require("../models/cardModel");

const addTocard = async (req, res) => {
    try {
        const { userId, product } = req.body;

        // Check if a cart exists for this user
        const existingCart = await CardModel.findOne({ userId });

        // If the cart exists, push the product to the cart
        if (existingCart) {
            const newProduct = {
                productId: product.productId,
                quantity: product.quantity
            };

            await CardModel.findByIdAndUpdate(
                existingCart._id,
                {
                    $push: { products: newProduct }
                },
                { new: true } // returns the updated document (optional)
            );
        } 
        // If the cart doesn't exist, create a new one
        else {
            const newCart = new CardModel({
                userId,
                products: [product] // Wrap in array since schema expects an array
            });

            await newCart.save();
        }

        res.status(200).json({
            success: true,
            message: "Cart updated successfully"
        });
    } catch (err) {
        console.error("Error adding to the cart:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
const updateCard = async (req , res) => {
    try{
await CardModel.updateOne(
    {
        "products.productId": req.body.product.productId,
    },
    {
        $inc: {
            "products.$.quantity": req.body.product.quantity,
        },
    }
)

        res.status(200).json({
            success: true,
            message: "card updated successfully"
        })
    }
    catch(err){
        console.log(err, "error updating card");
    }
}

const fetchcardDetails = async (req, res) => {
    try{

const cart = await CardModel.findOne({ userId: req.params.userId })
.populate("products.productId")
.populate("userId");
        res.status(200).json({
            success: true,
            message: "card details fetched successfully",
            data: cart
        });
    }
    
    catch(err){
        console.log(err, "error fetching card details");
    }
}
 

module.exports = {
    addTocard,
    fetchcardDetails,
    updateCard,
   
};