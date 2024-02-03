const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    company: {
      type: Schema.Types.ObjectId, ref: 'Company'
    },
    image: {
      type: String,
      default: "https://res.cloudinary.com/dexnyholt/image/upload/v1706911614/opinion_magnet/avatar_m1jdrw.png"
    },
    meeting: {
      type: String
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
