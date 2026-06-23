const express = require("express");
// const { auth } = require('../middleware/auth');
const Product = require("../models/product");
const productRouter = express.Router();
const { auth, vendorAuth } = require("../middleware/auth");

productRouter.post("/api/add-product", auth, vendorAuth, async (req, res) => {
  try {
    const {
      productName,
      productPrice,
      quantity,
      description,
      category,
      vendorId,
      fullName,
      subCategory,
      images,
    } = req.body;
    const product = new Product({
      productName,
      productPrice,
      quantity,
      description,
      category,
      vendorId,
      fullName,
      subCategory,
      images,
    });

    await product.save();
    return res.status(201).send(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

//get products
productRouter.get("/api/popular-products", async (req, res) => {
  try {
    // Find products where popular is true and sort by default creation order
    const product = await Product.find({ popular: true });
    if (!product || product.length == 0) {
      return res.status(404).json({ msg: "Products not found" });
    } else {
      return res.status(200).json(product); // Send the products as JSON response
    }
  } catch (e) {
    res.status(500).json({ error: e.message }); // Send error response
  }
});

// Add a new route to get recommended products
productRouter.get("/api/recommended-products", async (req, res) => {
  try {
    // Find products where popular is true and sort by default creation order
    const product = await Product.find({ recommend: true });
    if (!product || product.length == 0) {
      return res.status(404).json({ msg: "Products not found" });
    } else {
      return res.status(200).json(product); // Send the products as JSON response
    }
  } catch (e) {
    res.status(500).json({ error: e.message }); // Send error response
  }
});
//retrieving products by category
productRouter.get("/api/products-by-category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, popular: true });
    if (!products || products.length == 0) {
      return res.status(404).json({ msg: "Product not found" });
    } else {
      return res.status(200).json(products);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//new route for retrieving related products by subcategory
productRouter.get("/api/related-products-by-subcategory/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    // first, find the product to get it's subcategory 
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    } else {
      //find related products base on the subcategory of the retrieved product 
      const relatedProducts = await Product.find({
        subCategory: product.subCategory,
        _id: { $ne: productId } // exclude the current product
      });
      if (!relatedProducts || relatedProducts.length == 0) {
        return res.status(404).json({ msg: "No related products found" });
      }
      return res.status(200).json(relatedProducts);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//route for retrieving the top 10 highest rated products
productRouter.get("/api/top-rated-products", async (req, res) => {
  try {
    //fetch all products and sort them by average rating in decending order (highest rated first)
    //sort product by average rating, with -1 indicating decending order
    const topRatedProducts = await Product.find({}).sort({ averageRating: -1 }).limit(10); //limit the result to top 10 highest rated products
    //check if there are any top-rated products found
    if (!topRatedProducts || topRatedProducts.length === 0) {
      return res.status(404).json({ msg: "No top-rated products found" });
    }
    //return the top-rated product as a response
    return res.status(200).json(topRatedProducts);
  } catch (e) {
    //handle any server errors that occur during the request
    return res.status(500).json({ error: e.message });
  }
});

productRouter.get('/api/products-by-subcategory/:subCategory', async (req, res) => {
  try {
    const { subCategory } = req.params;
    const products = await Product.find({ subCategory: subCategory, });
    if (!products || products.length == 0) {
      return res.status(404).json({ msg: "Product not found in this subcategory" });
    }
    return res.status(200).json(products);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

//route for searching products by name or description
productRouter.get('/api/search-products', async (req, res) => {
  try {
    //extract the query parameter from the request query string
    const { query } = req.query;
    //validate that a query parameter is provided
    //if missing, return a 400 status with an error message
    if (!query) {
      return res.status(400).json({ msg: "Query parameter is required" });
    }
    //search for the product collection for documents where either 'ProductName' or 'description' 
    //contains the specified query string
    const products = await Product.find({
      $or: [
        //Regex will match any productName containing the query string,
        //For example, if the user search for "apple", the regex will check
        //if "apple" is part of any productName, so products name "green apple pie",
        //or "fresh apples", would all match because they contain the word "apple"
        { productName: { $regex: query, $options: 'i' } }, //'i' is for insensitive search, so it will match "Apple", "apple", "APPLE", etc.
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    //check if any products were found, if no product match the query
    //return a 404 status with an error message
    if (!products || products.length == 0) {
      return res.status(404).json({ msg: "No products found matching the query" });
    }
    //if product are found, return 200
    return res.status(200).json(products);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

//Route to edit an existing product
productRouter.put('/api/edit-product/:productId', auth, vendorAuth, async (req, res) => {
  try {
    //Extract product ID from the request parameter
    const { productId } = req.params;

    //Check if the product exists and if the vendor  is authrorized to edit it 
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found " });
    }
    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized to edit this product" });
    }

    //Destructure req.body to exclude  vendorid
    const { vendorId, ...updateData } = req.body;

    //update the product with  the fields provided in updateData
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },//update only fields in the updateData 
      { new: true }//return the updated  product document  in the response
    );

    //return the updated product with 200 ok status
    return res.status(200).json(updatedProduct);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = productRouter;





//get product by category
// productRouter.get('/category/products', async (req, res) => {
//     try {
//         // Check if category query parameter is provided
//         const category = req.query.category;
//         let products;
//         if (category) {
//             // Find products where category matches the query parameter
//             products = await Product.find({ category: category });
//         } else {
//             // If no category provided, return all products
//             products = await Product.find();
//         }
//         res.status(200).json(products); // Send the products as JSON response
//     } catch (error) {
//         res.status(500).json({ error: error.message }); // Send error response
//     }
// });