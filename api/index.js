const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const app = express();

// Middleware to read the data coming from your HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB using the Environment Variable you'll set in Vercel
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to Database"));

// --- SIGNUP ROUTE ---
app.post('/api/signup', async (req, res) => {
    try {
        const { name, surname, email, number, birthday, gender, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.send("Email already registered.");

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name, surname, email, number, birthday, gender,
            password: hashedPassword
        });

        await newUser.save();
        // Redirect back to login after successful signup
        res.redirect('/loginform.html?signup=success');
    } catch (err) {
        res.status(500).send("Signup Error: " + err.message);
    }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by email (your login form uses 'username' name attribute)
        const user = await User.findOne({ email: username });
        if (!user) return res.send("User not found.");

        // Compare encrypted password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send("Incorrect password.");

        // Successful login - Redirect to your main index page
        res.redirect('/index.html');
    } catch (err) {
        res.status(500).send("Login Error");
    }
});

module.exports = app;