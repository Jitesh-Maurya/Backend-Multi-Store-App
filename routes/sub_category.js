const express = require("express");
const SubCategory = require("../models/sub_category");
// const Category = require('../models/category');
const subCategoryRouter = express.Router();

subCategoryRouter.post("/api/subcategories", async (req, res) => {
  try {
    const { categoryId, categoryName, image, subCategoryName } = req.body;
    const subcategory = new SubCategory({
      categoryId,
      categoryName,
      image,
      subCategoryName,
    });
    await subcategory.save();
    return res.status(201).send(subcategory);
  } catch (e) {
    //    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: e.message });
  }
});

subCategoryRouter.get("/api/subcategories", async (req, res) => {
  try {
    const subcategories = await SubCategory.find();
    return res.status(200).json(subcategories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// get categoryName
subCategoryRouter.get(
  "/api/category/:categoryName/subcategories",
  async (req, res) => {
    try {
      const { categoryName } = req.params;
      const subcategories = await SubCategory.find({
        categoryName: categoryName,
      });
      if (!subcategories || subcategories.length == 0) {
        return res.status(404).json({ msg: "Subcategories not found" });
      } else {
        return res.status(200).json(subcategories);
      }
    } catch (e) {
      // console.error('Error fetching category:', error);
      res.status(500).json({ error: e.message });
    }
  },
);

// subCategoryRouter.get('/api/category/:categoryName/subcategories', async (req, res) => {
//     try {
//         const categoryName = req.params.categoryName;
//         // Assuming you have a relationship between Category and SubCategory models
//         // Adjust this query according to your database schema
//         const subcategories = await SubCategory.find({ categoryName: categoryName });
//         if (!subcategories) {
//             return res.status(404).json({ error: 'Subcategories not found' });
//         }
//         res.status(200).json(subcategories);
//     } catch (error) {
//         console.error('Error fetching subcategories:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

module.exports = subCategoryRouter;
