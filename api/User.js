const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String },
    birthday: { type: String },
    gender: { type: String },
    password: { type: String, required: true }
});

// This checks if the model already exists before creating it (important for Vercel)
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);