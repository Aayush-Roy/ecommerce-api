// // src/models/User.model.js

// import mongoose from "mongoose";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { ENV } from "../config/env.js";

// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password: { type: String, required: true, minlength: 6, select: false },
//     role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
// }, { timestamps: true });

// // Pre-save hook: Hash password before saving
// UserSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// // Instance Method: Compare passwords
// UserSchema.methods.isPasswordCorrect = async function (candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// // Instance Method: Generate JWT token
// UserSchema.methods.generateAuthToken = function () {
//     return jwt.sign(
//         { _id: this._id, role: this.role },
//         ENV.JWT_SECRET,
//         { expiresIn: ENV.JWT_EXPIRY }
//     );
// };

// const User = mongoose.model("User", UserSchema);
// export default User;
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
}, { timestamps: true });

// ✅ Pre-save hook (FIXED)
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare passwords
UserSchema.methods.isPasswordCorrect = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
UserSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { _id: this._id, role: this.role },
        ENV.JWT_SECRET,
        { expiresIn: ENV.JWT_EXPIRY }
    );
};

const User = mongoose.model("User", UserSchema);
export default User;
