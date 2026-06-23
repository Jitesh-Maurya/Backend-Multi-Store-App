const express = require("express");
const Vendor = require("../models/vendor");
const vendorRouter = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

vendorRouter.post("/api/vendor/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingEmail = await Vendor.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ msg: "Vendor with same email already exits" });
    } else {
      const salt = await bcryptjs.genSalt(10); //industry standard - we use 10 value for salt
      const hashedPassword = await bcryptjs.hash(password, salt);
      let vendor = new Vendor({
        fullName,
        email,
        password: hashedPassword,
      });

      vendor = await vendor.save();
      res.json({ vendor });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

//signin api endpoint
vendorRouter.post("/api/vendor/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await Vendor.findOne({ email });
    if (!findUser) {
      return res.status(400).json({ msg: "Vendor not found with this email" });
    } else {
      const isMatch = await bcryptjs.compare(password, findUser.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect Password" });
      } else {
        const token = jwt.sign({ id: findUser._id }, "passwordKey");
        //remove sensitive information - like the password
        const { password, ...vendorWithoutPassword } = findUser._doc;
        //send the response
        res.json({ token, vendor: vendorWithoutPassword });
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//fetch all vendors(exclude password)
vendorRouter.get("/api/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password"); //exclude password field
    return res.status(200).json(vendors);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = vendorRouter;
