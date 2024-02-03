const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const companySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'Name is required.']
    },
    accessToken: {
      type: String,
      required: [true, 'Access token is required.']
    }
  }
  ,
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const Company = model("Company", companySchema);

module.exports = Company;
