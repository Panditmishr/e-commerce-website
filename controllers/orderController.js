const OrderModel = require('../models/orderModel');
const getAllOrders = async (req , res) => {
    try{
        const orders = await OrderModel.find({})
            .populate('user', 'name email')
            .populate('items.product', 'name price image');
            
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "All orders fetched successfully",
            count: orders.length,
            data: orders
 });
    }
    catch(err){
        console.log(err,"error in getting all orders")
    }
}

const getOrderById = async (req, res) => {
    
    try{
        const order = await OrderModel.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product', 'name price image');
        
    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }
    
    res.status(200).json({
        success: true,
        message: "Order fetched successfully",
        data: order
        });
    }
    catch(err){
        console.log(err,"error in getting order by id")
    }
}

const createOrder = async (req, res) => {
    try{
        const { user, items, shippingAddress } = req.body;
        
        if (!user || !items || items.length === 0 || !shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }
        
        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        req.body.totalAmount = totalAmount;
        
        const newOrder = await OrderModel.create(req.body);
        
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: newOrder
        });
    }
    catch(err){
        console.log(err,"error in creating order")
    }
}
// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        
        if (!orderStatus) {
            return res.status(400).json({
                success: false,
                message: "Order status is required"
            });
        }
        
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    } catch (err) {
        console.log(err, "error in updating order status");
        res.status(500).json({
            success: false,
            message: "Error updating order status",
            error: err.message
        });
    }
};
// Delete order
const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await OrderModel.findByIdAndDelete(req.params.id);
        
        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (err) {
        console.log(err, "error in deleting order");
        res.status(500).json({
            success: false,
            message: "Error deleting order",
            error: err.message
        });
    }
};


module.exports ={
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
};