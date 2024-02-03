const router = require("express").Router();
const Feedback = require("../models/Feedback.model");
const Company = require("../models/Company.model");
const User = require("../models/User.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stopwords = require('natural').stopwords;

const stopWords = stopwords;

function analyzeWordFrequency(text) {
  const words = tokenizer.tokenize(text);

  const frequency = {};

  words.forEach(word => {
    const lowercaseWord = word.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    if (!stopWords.includes(lowercaseWord)) {
      if (frequency[lowercaseWord]) {
        frequency[lowercaseWord]++;
      } else {
        frequency[lowercaseWord] = 1;
      }
    }
  });

  // Display the word frequency results
  console.log('Word Frequency Analysis:', frequency);

}

router.get("/word-frequency", (req, res) => {
  const textToAnalyze = "This is an example sentence. This sentence is just for demonstration purposes.";
  //console.log(stopWords)
  analyzeWordFrequency(textToAnalyze);
  res.status(200).json({ message: "Frequency analysis is done" });
})

// router.get("/testimonials/:company", async (req, res, next) => {
//   try {
//   const id = req.params.company;
//   const testimonials = (await Testimonial.find()).filter(item => item.company === id);
//   } catch(err) {
//     console.log(err)
//     next(err)
//   }

// })

router.post("/feedback", async (req, res) => {
  try {
    const { rating, feedback, accessToken, companyId } = req.body;

    if (!accessToken) {
      return res.status(401).json({ error: 'Access token is missing.' });
    }

    // Check if access token matches with a company_id
    // For testing create company Document in database: Access Token: access, company_id: 123456
    const companyDocument = await Company.findOne({
      _id: companyId,
      accessToken: accessToken
    });


    if (companyDocument) {
      await Feedback.create({ rating: rating, feedback: feedback, company: companyId })
      res.json({ message: "Tango is Starting" });
    } else {
      return res.status(401).json({ error: "Invalid access token or company Id" })
    }
  } catch (err) {
    return res.status(500).json({ error: "Service Error" })
  }
});

router.get("/feedback", isAuthenticated, async (req, res) => {
  try {
    const { _id } = req.payload;
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(404).json({ message: "Not Found" })
    }
    const feedback = await Feedback.find({ company: user.company }).populate('company');
    return res.status(200).json(feedback)
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

module.exports = router;
