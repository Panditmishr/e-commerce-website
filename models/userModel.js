const mongoose=require('mongoose');
const bcrypt = require('bcrypt'); 

const userSchema = new mongoose.Schema({
    firstname : {
        type: String,
        required: true
    },
    lastname : {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long'],
        validate: {
            validator: function (value) {
                // At least one lowercase letter, one uppercase letter, one digit, one special character
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(value);
            }, 
            message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'
        }
    },
    phone : {
        type: Number,
        required: true
    },
    gender : {
        type: String,
        required: true
    },


});
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (err) {
        next(err);
    }
});

const UserModel = mongoose.model("UserModel", userSchema);

module.exports = UserModel;