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

const seedDatabase = async (user) => {


    const feedbackEntries = feedbackData.map(entry => {
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
        return ({
            rating: entry.rating,
            feedback: entry.feedback,
            company: user.company,
            createdAt: createdAt
        })
    })

    await Feedback.insertMany(feedbackEntries);
    console.log("done...")
    
}

module.exports = seedDatabase;