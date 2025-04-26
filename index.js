const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = process.env.PORT_NO || 4000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cardRoutes = require('./routes/cardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", cardRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", couponRoutes);
app.use("/api/payments", paymentRoutes);

// MongoDB Connection
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to the database");
}).catch((err) => {
    console.log("Database connection error:", err);
});

// Server
app.listen(port, (err) => {
    if (err) {
        console.log("Error starting server:", err);
    } else {
        console.log(`Server is running on http://localhost:${port}`);
    }
});
