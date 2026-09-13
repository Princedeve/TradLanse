const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const researchRouter = require("./router/research.js");

const app = express();

const PORT = process.env.PORT;

// Database
async function connectDB() {
    try {
        await mongoose.connect(process.env.ATLASDB_URL);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    }
}

connectDB();

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", researchRouter);

// 404
app.use((req, res) => {
    res.status(404).send("Page Not Found!");
});

// Server
app.listen(PORT, () => {
    console.log(`TradeLens running on http://localhost:${PORT}`);
});