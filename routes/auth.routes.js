// routes/auth.routes.js

const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Company = require("../models/Company.model");
const crypto = require("crypto");

const router = express.Router();


const saltRounds = 10;

// POST /auth/signup  - Creates a new user in the database
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, company } = req.body;
    // Check if the email or password or name is provided as an empty string 
    if (email === '' || password === '' || name === '' || company === '') {
      res.status(400).json({ message: "Provide email, password, name and company" });
      return;
    }

    // Use regex to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Provide a valid email address.' });
      return;
    }

    // Use regex to validate the password format
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
      return;
    }

    // Check the users collection if a user with the same email already exists
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    // Check the company collection
    const foundCompany = await Company.findOne({ name: company })
    if (foundCompany) {
      return res.status(400).json({ message: "Company already exists." });
    }

    // create company first to add the company ID to the user profile
    const newCompany = await Company.create({ name: company, accessToken: crypto.randomBytes(20).toString('hex') });

    // here I am seeding the database with the new company
    //seeding database with feedbacks associated with the new company and new admin
    //await seedDatabase(newCompany._id);

    // If the email is unique, proceed to hash the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);


    // Create a new user in the database
    const createdUser = await User.create({ email, password: hashedPassword, name, company: newCompany._id });

    // Deconstruct the newly created user object to omit the password
    // We should never expose passwords publicly
    const { _id } = createdUser;

    // Create a new object that doesn't expose the password
    const user = { email, name, _id };

    // Send a json response containing the user object
    res.status(201).json({ user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" })
  }
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string 
  if (email === '' || password === '') {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }
  console.log(email, password)
  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {

      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." })
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, name, image } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, name, image };

        // Create and sign the token
        const authToken = jwt.sign(
          payload,
          process.env.TOKEN_SECRET,
          { algorithm: 'HS256', expiresIn: "6h" }
        );

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      }
      else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }

    })
    .catch(err => res.status(500).json({ message: "Internal Server Error" }));
});


// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(403).json({ message: "not logged in" });
    }

    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    res.status(202).json(verify);
  } catch (err) {
    res.json({ errorMessage: err });
  }
});

module.exports = router;
