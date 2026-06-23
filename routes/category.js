const express = require("express");
const Category = require("../models/category");

const categoryRouter = express.Router();

// Create a new category
categoryRouter.post("/api/categories", async (req, res) => {
  try {
    const { name, image, banner } = req.body; // Destructuring to extract only the 'name' property
    const category = new Category({ name, image, banner }); // Passing 'name' ,'image' directly to the Category constructor
    await category.save();
    return res.status(201).send(category);
  } catch (e) {
    // console.error("Error creating category:", error);
    res.status(500).json({ error: e.message });
  }
});

// get category

categoryRouter.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
    // return res.status(200).json({categories});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = categoryRouter;
