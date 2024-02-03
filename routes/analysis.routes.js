const router = require("express").Router();
const Feedback = require("../models/Feedback.model");
const Company = require("../models/Company.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { kmeans } = require('ml-kmeans');
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

  return frequency

}


router.get("/average", isAuthenticated, async (req, res, next) => {
    try {
        const { _id } = req.payload;
        const userData = await User.findOne({ _id })
        feedbackData = await Feedback.find();
        const filteredData = feedbackData.filter(feedback => {

            return feedback.company.equals(userData.company);
        });
        // average rating
        const averageRating = filteredData.length > 0 ? filteredData.reduce((acc, curr) => {
            return acc + curr.rating;
        }, 0)/filteredData.length : 0;

        // number of feedbacks
        const numberFeedbacks = filteredData.length;

        // average number of words per feedback
        const averageWordNumber = filteredData.length > 0 ? filteredData.reduce((acc, curr) => {
          return acc + curr.feedback.length;
      }, 0)/filteredData.length : 0;
        console.log(averageWordNumber)
        // average number of feedbacks/ month
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
       const feedbacksPerMonth = filteredData.reduce((acc, curr) => {
          //console.log(curr.createdAt.getMonth() + 1)

          acc[monthNames[curr.createdAt.getMonth()]]? acc[monthNames[curr.createdAt.getMonth()]] += 1 : acc[monthNames[curr.createdAt.getMonth()]] = 1


          return acc
      }, {});
      console.log(feedbacksPerMonth)


        res.status(200).json({"averageRating": (averageRating.toFixed(2)), "numberFeedbacks": numberFeedbacks, "averageWordNumber": averageWordNumber.toFixed(2), "feedbacksPerMonth": feedbacksPerMonth})
    } catch (error) {
        console.log(error)
    }

});

router.get("/ratings", isAuthenticated, async (req, res, next) => {
  try {
      const { _id } = req.payload;
      const userData = await User.findOne({ _id })
      feedbackData = await Feedback.find();
      const filteredData = feedbackData.filter(feedback => {

          return feedback.company.equals(userData.company);
      });

      

      // prepare data for histogramm

      // Extract ratings from feedback data
      const allRatings = filteredData.map((feedback) => feedback.rating);

      // Count occurrences of each rating
      const ratingCounts = allRatings.reduce((acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {});

      //console.log(ratingCounts)

      // prepare data for timeline

      const dataObject = filteredData.reduce((acc, obj) => {
        // Extract the date and value from each object
        const { createdAt, rating } = obj;
        
        // Add the date and value to the accumulator object
        acc[createdAt] = rating;
      
        // Return the updated accumulator for the next iteration
        return acc;
      }, {});
      //console.log(dataObject)

      //smooting time data
      // Step 1: Convert date strings to Date objects
      const parsedData = Object.entries(dataObject).map(([dateString, rating]) => ({
        date: new Date(dateString),
        rating
      }));

      // Step 2: Sort the data based on the date
      parsedData.sort((a, b) => a.date - b.date);
      const parsedArray = parsedData.reduce((acc, curr) => {
        acc.push(curr["rating"])
        return acc;
      }, [])
      //console.log("parsedArray", parsedArray)

      function avg (v) {
        return v.reduce((a,b) => a+b, 0)/v.length;
      }
      
      function smoothOut (vector, variance) {
        var t_avg = avg(vector)*variance;
        var ret = Array(vector.length);
        for (var i = 0; i < vector.length; i++) {
          (function () {
            var prev = i>0 ? ret[i-1] : vector[i];
            var next = i<vector.length ? vector[i] : vector[i-1];
            ret[i] = avg([t_avg, avg([prev, vector[i], next])]);
          })();
        }
        return ret;
      }
    
    
    const smoothedValues = smoothOut(parsedArray, 0.6);
    const timeData = parsedData.map((element, index) => {
      return ({
        date: element["date"],
        rating: smoothedValues[index]
      })
    })

    
    // again some data transformation to fit the expected data input 

    const timeObjectData = timeData.reduce((acc, obj) => {
      // Extract the date and value from each object
      const { date, rating } = obj;
      
      // Add the date and value to the accumulator object
      acc[date] = rating;
    
      // Return the updated accumulator for the next iteration
      return acc;
    }, {});
     
      res.status(200).json({"timeData": timeObjectData, "histogram": ratingCounts})
  } catch (error) {
      console.log(error)
  }

});




router.get("/keywords", isAuthenticated, async (req, res, next) => {
  try {
      const { _id } = req.payload;
      const userData = await User.findOne({ _id })
      feedbackData = await Feedback.find();
      const filteredData = feedbackData.filter(feedback => {

          return feedback.company.equals(userData.company);
      });
      let text = "";
      filteredData.forEach(data => {
        text+= data.feedback;
      });
      const words = analyzeWordFrequency(text);
      const myArray = Object.entries(words);
      //console.log("entries", myArray)
      myArray.sort((a, b) => b[1] - a[1]);
      const popularWords = Object.fromEntries(myArray.slice(0,10));

      //console.log(popularWords);
      res.status(200).json({"popularWords": popularWords})
  } catch (error) {
      console.log(error)
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
    const filteredData = feedbackData.filter(feedback => {

        return feedback.company.equals(userData.company);
    });
    filteredData.forEach((feedback, index) => {
      const preprocessedText = preprocessText(feedback.feedback);
      tfidf.addDocument(preprocessedText.join(' '), { id: index }); // Include document index as an identifier
      
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

    //console.log(tfidfDataMatrix);

    // // Now, tfidfDataMatrix is ready for k-means clustering
    // //console.log(tfidfDataMatrix)
    const data = tfidfDataMatrix.map((item) => item.tfidf);
    //console.log(data)
    // Assuming you want 3 clusters (you can adjust this)
    const ans = kmeans(tfidfDataMatrix, 3);

    // // Get the cluster assignments for each document
    

    // // Log the cluster assignments
    //console.log(ans.clusters);
    const myClusters = ans.clusters;
    let cl1 = [];
    let cl2 = [];
    let cl3 = [];
    filteredData.forEach((feed, index) => {
      if(myClusters[index] === 0) {
        cl1.push(feed)
      } else if(myClusters[index] === 1) {
        cl2.push(feed)
      } else if (myClusters[index] === 2) {
        cl3.push(feed)
      }
    })

    // most frequent words analysis for each cluster
    // cluster 1
    let textcl1 = "";
    cl1.forEach(data => {
      textcl1+= data.feedback;
    });
    const wordscl1 = analyzeWordFrequency(textcl1);
    const myArraycl1 = Object.entries(wordscl1);
    //console.log("entries", myArray)
    myArraycl1.sort((a, b) => b[1] - a[1]);
    const popularWordscl1 = Object.fromEntries(myArraycl1.slice(0,10));
    //console.log(popularWordscl1);

    // cluster 2
    let textcl2 = "";
    cl2.forEach(data => {
      textcl2+= data.feedback;
    });
    const wordscl2 = analyzeWordFrequency(textcl2);
    const myArraycl2 = Object.entries(wordscl2);
    //console.log("entries", myArray)
    myArraycl2.sort((a, b) => b[1] - a[1]);
    const popularWordscl2 = Object.fromEntries(myArraycl2.slice(0,10));
    //console.log(popularWordscl2);

    // cluster 3
    let textcl3 = "";
    cl3.forEach(data => {
      textcl3+= data.feedback;
    });
    const wordscl3 = analyzeWordFrequency(textcl3);
    const myArraycl3 = Object.entries(wordscl3);
    //console.log("entries", myArray)
    myArraycl2.sort((a, b) => b[1] - a[1]);
    const popularWordscl3 = Object.fromEntries(myArraycl3.slice(0,10));
    //console.log(popularWordscl3);

    
  res.status(200).json({"clusters": [cl1, cl2, cl3], "clusterKeywords": [popularWordscl1, popularWordscl2, popularWordscl3]})
  } catch (error) {
    console.log(error);
  }
});



// router.get("/rating-distribution", async (req, res, next) => {
//   try {
      
//       feedbackData = await Feedback.find();
     
//       // prepare data for histogramm

//       // Extract ratings from feedback data
//       const allRatings = feedbackData.map((feedback) => feedback.rating);

//       // Count occurrences of each rating
//       const ratingCounts = allRatings.reduce((acc, rating) => {
//         acc[rating] = (acc[rating] || 0) + 1;
//         return acc;
//       }, {});

//       // Transform counts into format suitable for the histogram chart
//       const histogramChartData = Object.entries(ratingCounts).map(([rating, count]) => ({
//         label: `${rating} stars`,
//         value: count,
//       }));
//       //console.log(histogramChartData)
//       res.status(200).json({"ratings": histogramChartData})
//     } catch(err) {
//       console.log(err)
//     }
//   })

module.exports = router;