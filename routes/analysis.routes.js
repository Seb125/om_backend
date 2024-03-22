const router = require("express").Router();
const Feedback = require("../models/Feedback.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { kmeans } = require("ml-kmeans");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopwords = require("natural").stopwords;
const stopWords = stopwords;

// function to analyze the frequency of each word in the text input
function analyzeWordFrequency(text) {
  // tokenization of the text with the tokenizer object provided by the "natural" library
  const words = tokenizer.tokenize(text);
  // object to store frequency of each word in the text
  const frequency = {};
  // for each word is is checked if it is not present in the array of stopwords (words to be excluded from analysis)
  // then if it is already stored as a key in the frequency object its count isincreased, otherwise the count is initialized by 1
  words.forEach((word) => {
    const lowercaseWord = word.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    if (!stopWords.includes(lowercaseWord)) {
      if (frequency[lowercaseWord]) {
        frequency[lowercaseWord]++;
      } else {
        frequency[lowercaseWord] = 1;
      }
    }
  });
  return frequency;
}

router.get("/average", isAuthenticated, async (req, res, next) => {
  try {
    // middleware isAuthenticated does the JWT token validation and jwt.verify method 
    // decodes/validates the token and returns the payload with the user id
    const { _id } = req.payload;
    const userData = await User.findOne({ _id });
    const feedbackData = await Feedback.find();
    // filteredData only contains Feedbacks associated with the company, the user has registered with
    const filteredData = feedbackData.filter((feedback) => {
      return feedback.company.equals(userData.company);
    });
    // average rating is calculated using reduce
    const averageRating =
      filteredData.length > 0
        ? filteredData.reduce((acc, curr) => {
            return acc + curr.rating;
          }, 0) / filteredData.length
        : 0;
    // number of feedbacks
    const numberFeedbacks = filteredData.length;
    // average number of words per feedback
    const averageWordNumber =
      filteredData.length > 0
        ? filteredData.reduce((acc, curr) => {
            return acc + curr.feedback.length;
          }, 0) / filteredData.length
        : 0;
    res
      .status(200)
      .json({
        averageRating: averageRating.toFixed(2),
        numberFeedbacks: numberFeedbacks,
        averageWordNumber: averageWordNumber.toFixed(2),
      });
  } catch (error) {
    console.log(error);
  }
});

router.get("/ratings", isAuthenticated, async (req, res, next) => {
  try {
    // middleware isAuthenticated does the JWT token validation and jwt.verify method 
    // decodes/validates the token and returns the payload with the user id
    const { _id } = req.payload;
    const userData = await User.findOne({ _id });
    const feedbackData = await Feedback.find();
    // filteredData only contains Feedbacks associated with the company, the user has registered with
    const filteredData = feedbackData.filter((feedback) => {
      return feedback.company.equals(userData.company);
    });
    // prepare data for the Pie Chart
    // Extract ratings from feedback data
    const allRatings = filteredData.map((feedback) => feedback.rating);
    // Count occurrences of each rating
    const ratingCounts = allRatings.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});
    // prepare data for timeline chart
    const dataObject = filteredData.reduce((acc, obj) => {
      // Extract the date and value from each object
      const { createdAt, rating } = obj;
      // Add the date and value to the accumulator object
      acc[createdAt] = rating;
      // Return the updated accumulator for the next iteration
      return acc;
    }, {});
    //smooting time data
    // Step 1: Convert date strings to Date objects
    const parsedData = Object.entries(dataObject).map(
      ([dateString, rating]) => ({
        date: new Date(dateString),
        rating,
      })
    );
    // Step 2: Sort the data based on the date
    parsedData.sort((a, b) => a.date - b.date);
    // transform object into an array
    const parsedArray = parsedData.reduce((acc, curr) => {
      acc.push(curr["rating"]);
      return acc;
    }, []);
    // average function used below in smoothOut function
    function avg(v) {
      return v.reduce((a, b) => a + b, 0) / v.length;
    }
    // smoothing function to make ratings over time less jumpy
    function smoothOut(vector, variance) {
      var t_avg = avg(vector) * variance;
      var ret = Array(vector.length);
      for (var i = 0; i < vector.length; i++) {
        (function () {
          var prev = i > 0 ? ret[i - 1] : vector[i];
          var next = i < vector.length ? vector[i] : vector[i - 1];
          ret[i] = avg([t_avg, avg([prev, vector[i], next])]);
        })();
      }
      return ret;
    }
    const smoothedValues = smoothOut(parsedArray, 0.6); // second argument sets the degree of smoothing
    // combining dates from parsedData with smoothed rating values
    const timeData = parsedData.map((element, index) => {
      return {
        date: element["date"],
        rating: smoothedValues[index],
      };
    });
    // finally some data transformation to fit the expected data input of the timeline chart
    const timeObjectData = timeData.reduce((acc, obj) => {
      // Extract the date and value from each object
      const { date, rating } = obj;
      // Add the date and value to the accumulator object
      acc[date] = rating;
      // Return the updated accumulator for the next iteration
      return acc;
    }, {});
    res.status(200).json({ timeData: timeObjectData, histogram: ratingCounts });
  } catch (error) {
    console.log(error);
  }
});

router.get("/keywords", isAuthenticated, async (req, res, next) => {
  try {
     // middleware isAuthenticated does the JWT token validation and jwt.verify method 
    // decodes/validates the token and returns the payload with the user id
    const { _id } = req.payload;
    const userData = await User.findOne({ _id });
    const feedbackData = await Feedback.find();
    // filteredData only contains Feedbacks associated with the company, the user has registered with
    const filteredData = feedbackData.filter((feedback) => {
      return feedback.company.equals(userData.company);
    });
    // concatinating all feedbacks to one long text
    let text = "";
    filteredData.forEach((data) => {
      text += data.feedback;
    });
    // utilizing the analyzeWordFrequency function defined above
    const words = analyzeWordFrequency(text);
    const wordsArray = Object.entries(words);
    wordsArray.sort((a, b) => b[1] - a[1]);
    // in the worted array I only want to return the 10 most frequently used words in the feedbacks
    const popularWords = Object.fromEntries(wordsArray.slice(0, 10));
    res.status(200).json({ popularWords: popularWords });
  } catch (error) {
    console.log(error);
  }
});

router.get("/clustering", isAuthenticated, async (req, res, next) => {
  try {
    const { _id } = req.payload;
    const userData = await User.findOne({ _id });
    const feedbackData = await Feedback.find({ company: userData.company });
    const preprocessText = (text) => {
      const tokens = tokenizer.tokenize(text);
      return tokens;
    };
    // Create a 2D array to store the TF-IDF matrix
    const tfidfDataMatrix = [];
    // Create a set to collect unique terms across all documents
    const termsSet = new Set();
    // Add documents to the TF-IDF model
    const tfidf = new natural.TfIdf();
    const filteredData = feedbackData.filter((feedback) => {
      return feedback.company.equals(userData.company);
    });
    filteredData.forEach((feedback, index) => {
      const preprocessedText = preprocessText(feedback.feedback);
      tfidf.addDocument(preprocessedText.join(" "), { id: index }); // Include document index as an identifier
      // Collect unique terms for each document
      preprocessedText.forEach((term) => {
        termsSet.add(term);
      });
    });
    // Convert the set of terms to an array
    const termsArray = Array.from(termsSet);
    // Iterate over all documents
    tfidf.documents.forEach((document, documentIndex) => {
      // Create an array to store TF-IDF values for the current document
      const tfidfValues = new Array(termsArray.length).fill(0);
      // Get TF-IDF terms for the current document
      tfidf.listTerms(documentIndex).forEach((item) => {
        const termIndex = termsArray.indexOf(item.term);
        tfidfValues[termIndex] = item.tfidf;
      });
      // Add the TF-IDF values to the matrix
      tfidfDataMatrix.push(tfidfValues);
    });
    // // Now, tfidfDataMatrix is ready for k-means clustering
    const data = tfidfDataMatrix.map((item) => item.tfidf);
    // Assuming you want 3 clusters (you can adjust this)
    const ans = kmeans(tfidfDataMatrix, 3);
    // Get the cluster assignments for each document
    const myClusters = ans.clusters;
    let cl1 = [];
    let cl2 = [];
    let cl3 = [];
    filteredData.forEach((feed, index) => {
      if (myClusters[index] === 0) {
        cl1.push(feed);
      } else if (myClusters[index] === 1) {
        cl2.push(feed);
      } else if (myClusters[index] === 2) {
        cl3.push(feed);
      }
    });
    // most frequent words analysis for each cluster
    // cluster 1
    let textcl1 = "";
    cl1.forEach((data) => {
      textcl1 += data.feedback;
    });
    const wordscl1 = analyzeWordFrequency(textcl1);
    const myArraycl1 = Object.entries(wordscl1);
    myArraycl1.sort((a, b) => b[1] - a[1]);
    const popularWordscl1 = Object.fromEntries(myArraycl1.slice(0, 10));
    // cluster 2
    let textcl2 = "";
    cl2.forEach((data) => {
      textcl2 += data.feedback;
    });
    const wordscl2 = analyzeWordFrequency(textcl2);
    const myArraycl2 = Object.entries(wordscl2);
    myArraycl2.sort((a, b) => b[1] - a[1]);
    const popularWordscl2 = Object.fromEntries(myArraycl2.slice(0, 10));
    // cluster 3
    let textcl3 = "";
    cl3.forEach((data) => {
      textcl3 += data.feedback;
    });
    const wordscl3 = analyzeWordFrequency(textcl3);
    const myArraycl3 = Object.entries(wordscl3);
    myArraycl2.sort((a, b) => b[1] - a[1]);
    const popularWordscl3 = Object.fromEntries(myArraycl3.slice(0, 10));
    // clusters were obtained by using kmeans with TF-IDF value of each feedback
    // for each cluster of feedbacks the most frequently used words were extracted and are provided in the routes response
    res
      .status(200)
      .json({
        clusters: [cl1, cl2, cl3],
        clusterKeywords: [popularWordscl1, popularWordscl2, popularWordscl3],
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
