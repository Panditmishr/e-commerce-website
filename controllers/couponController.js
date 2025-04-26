const CouponModel = require('../models/couponModel');

const addCoupon = async (req, res) => {
    try{
        await CouponModel.create(req.body);
        res.status(200).json({
            succes: true,
            message: "coupon added successfully"
        });
    }
    catch(err){
        console.log(err,"error adding coupon");
    }
}


const getAllCoupon = async (req, res) => {
    try{
        const coupon = await CouponModel.find();
        res.status(200).json({
            succes: true,
            message: "coupon getting successfully",
            data: coupon
        });
    }
    catch(err){
        console.log(err,"error getting all coupon");
    }
}

module.exports = {
    addCoupon,
    getAllCoupon
}



