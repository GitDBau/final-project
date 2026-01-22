const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- THE FIX: Connection Manager ---
let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) return;

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log("Connected to MongoDB Atlas");
    } catch (err) {
        console.error("Database Connection Error:", err.message);
        throw err;
    }
};

// --- UPDATED SIGNUP ROUTE ---
app.post('/api/signup', async (req, res) => {
    try {
        await connectToDatabase(); // Force it to wait for DB
        
        const { name, surname, email, number, birthday, gender, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.send("Email already registered.");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name, surname, email, number, birthday, gender,
            password: hashedPassword
        });

        await newUser.save();
        res.redirect('/loginform.html?signup=success');
    } catch (err) {
        res.status(500).send("Signup Error: " + err.message);
    }
});

// --- UPDATED LOGIN ROUTE in api/index.js ---
app.post('/api/login', async (req, res) => {
    try {
        await connectToDatabase();
        const { username, password } = req.body;
        const user = await User.findOne({ email: username });
        
        if (!user) return res.send("User not found.");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send("Incorrect password.");

        // Instead of a plain redirect, we send an HTML page that sets the login state
        res.send(`
            <script>
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = '/index.html';
            </script>
        `);
    } catch (err) {
        res.status(500).send("Login Error");
    }
});

module.exports = app;