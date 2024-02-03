// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("../db");

const bcrypt = require('bcryptjs');

const Feedback = require("../models/Feedback.model");
const Company = require("../models/Company.model");
const User = require("../models/User.model");
const feedbackData = require("./feedbackData.json");
const crypto = require("crypto");

const saltRounds = 10;

const seedDatabase = async () => {
    // create company first to add the company ID to the user profile
    const company = await Company.create({ name: "Acme Corporation", accessToken: crypto.randomBytes(20).toString('hex') });

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync("123456", salt);
    // Create a new user in the database
    const createdUser = await User.create({ email: "admin@acme.com", password: hashedPassword, name: "admin", company: company._id });

    const feedbackEntries = feedbackData.map(entry => {
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
        return ({
            rating: entry.rating,
            feedback: entry.feedback,
            company: company._id,
            createdAt: createdAt
        })
    })

    await Feedback.insertMany(feedbackEntries);
    console.log("done...")
    process.exit(0);
}

seedDatabase();
