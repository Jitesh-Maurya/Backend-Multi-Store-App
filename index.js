const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter = require("./routes/auth");
const bannerRouter = require("./routes/banner");
const categoryRouter = require("./routes/category");
const subCategoryRouter = require("./routes/sub_category");
const productRouter = require("./routes/product");
const productReviewRouter = require("./routes/product_review");
const vendorRouter = require("./routes/vendor");
const orderRouter = require("./routes/order");

const PORT = process.env.PORT || 3000;

const app = express();
const DB =
  "mongodb+srv://jiteshmaurya03_db_user:comeback@cluster0.tbdlaav.mongodb.net/?appName=Cluster0";

// app.get("/hello",(req,res)=>{
//     res.send('<h1>Hello kushali</h1>');
// })

app.use(express.json());
app.use(cors());
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);
app.use(vendorRouter);
app.use(orderRouter);

mongoose.connect(DB).then(() => {
  console.log("MongoDB Connected");
});

app.listen(PORT, "0.0.0.0", function () {
  console.log(`server is running on port ${PORT}`);
});
