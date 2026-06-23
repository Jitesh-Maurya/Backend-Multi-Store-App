const mongoose = require("mongoose");

const vendorSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    //unique: true,   //Prevent Race Condition
    validate: {
      validator: (value) => {
        const result = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return result.test(value);
      },
      message: "Please enter a valid email address",
    },
  },
  state: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  locality: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "vendor",
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return value.length >= 8;
      },
      message: "Password must be at least 8 characters long",
    },
  },
  // type: {
  //     type: String,
  //     default: "user"
  // },
});

// const Vendor = mongoose.model("Vendor", vendorSchema);
const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
