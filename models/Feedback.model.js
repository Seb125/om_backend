const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const feedbackSchema = new Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required.']
    },
    feedback: {
      type: String,
      required: [true, 'Review is required.']
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company'
    }
  }
  ,
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const Feedback = model("Feedback", feedbackSchema);

module.exports = Feedback;
