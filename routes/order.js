const express = require("express");
const orderRouter = express.Router();
const Order = require("../models/order");
const Stripe = require("stripe")("sk_test_51TPY1EJyoDFgyZdppToxM8tnvyvMtC4jXfdlKcsGrCvCAKC6WRBJljeyWMSHLMXZxCj5Ir3fACYYtYnggPQzvqzr00AQyr54G1");
const { auth, vendorAuth } = require("../middleware/auth");


//Post route for creating orders
orderRouter.post("/api/orders", auth, async (req, res) => {
  try {
    const {
      fullName,
      email,
      state,
      city,
      locality,
      productName,
      productPrice,
      quantity,
      category,
      image,
      vendorId,
      buyerId,
      paymentStatus,
      paymentIntentId,
      paymentMethod,
    } = req.body;
    const createdAt = new Date().getMilliseconds(); //Get the current date
    //create new order instance with the extracted field
    const order = new Order({
      fullName,
      email,
      state,
      city,
      locality,
      productName,
      productPrice,
      quantity,
      category,
      image,
      vendorId,
      buyerId,
      createdAt,
      paymentStatus,
      paymentIntentId,
      paymentMethod,
    });
    await order.save();
    return res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// //Payment api
// orderRouter.post("/api/payment", async (req, res) => {
//   try {
//     const { orderId, paymentMethodId, currency = "usd" } = req.body;
//     //validate the presence of required fields
//     if (!orderId || !paymentMethodId || !currency) {
//       return res.status(400).json({ msg: "Missing required fields" });
//     }
//     //Query for the order by orderId
//     const order = await Order.findById(orderId);
//     if (!order) {
//       console.log("Order not found for id:", orderId);
//       return res.status(404).json({ msg: "Order not found" });
//     }
//     //calculate the total amount(price * quantity) 
//     const totalAmount = order.productPrice * order.quantity;
//     //ensure the amount is at least $0.50 USD or it's equivalent
//     const minimumAmount = 0.50;
//     if (totalAmount < minimumAmount) {
//       return res.status(400).json({ error: "Total amount must be at least $0.50 USD" });
//     }
//     //convert total amount to cents as Stripe expects the amount in the smallest currency unit
//     const amountInCents = Math.round(totalAmount * 100);
//     //now create the payment intent with the correct amount
//     const paymentIntent = await Stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency,
//       payment_method: paymentMethodId,
//       automatic_payment_methods: { enabled: true },
//     });
//     console.log("Payment Status  : ", paymentIntent.status);
//     return res.json({
//       staus: "success",
//       paymentIntentId: paymentIntent.id,
//       amount: paymentIntent.amount / 100,
//       currency: paymentIntent.currency,
//     })
//   } catch (e) {
//     return res.status(500).json({ error: e.message });
//   }
// });

orderRouter.post('/api/payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await Stripe.paymentIntents.create({
      amount,
      currency,
    });

    return res.status(200).json(paymentIntent);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

orderRouter.get('/api/payment-intent/:id', auth, async (req, res) => {
  try {
    const paymentIntent = await Stripe.paymentIntents.retrieve(req.params.id);
    return res.status(200).json(paymentIntent);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

//Get route for fetching order by buyer id
orderRouter.get("/api/orders/:buyerId", auth, async (req, res) => {
  try {
    //Extract the buyerId from the request parameters
    const { buyerId } = req.params;
    //Find all orders in the database that match the buyerId
    const orders = await Order.find({ buyerId });
    //If no orders are found, return a 404 status with message
    if (orders.length == 0) {
      return res.status(404).json({ msg: "No orders found for this buyer" });
    }
    //If orders are found, return them with a 200 status code
    return res.status(200).json(orders);
  } catch (e) {
    //Handle any errors that occur during the order retrieval process
    res.status(500).json({ error: e.message });
  }
});

//Delete route for deleting a specific order by _id
orderRouter.delete("/api/orders/:id", auth, async (req, res) => {
  try {
    //extract the id from the request parameter
    const { id } = req.params;
    //find and delete the order from the database using the extracted _id
    const deletedOrder = await Order.findByIdAndDelete(id);
    //check if an order was found and deleted
    if (!deletedOrder) {
      //if no order was found with provided _id return 404
      return res.status(404).json({ msg: "Order not found" });
    } else {
      //if the order was successfully deleted, return 200 status with a success message
      return res.status(200).json({ msg: "Order was deleted successfully" });
    }
  } catch (e) {
    //if an error occurs during the process, return a 500 status with error status
    res.status(500).json({ error: e.message });
  }
});

//Get route for fetching order by vendor id
orderRouter.get("/api/orders/vendors/:vendorId", auth, vendorAuth, async (req, res) => {
  try {
    //Extract the vendorId from the request parameters
    const { vendorId } = req.params;
    //Find all orders in the database that match the vendorId
    const orders = await Order.find({ vendorId });
    //If no orders are found, return a 404 status with message
    if (orders.length == 0) {
      return res.status(404).json({ msg: "No orders found for this vendor" });
    }
    //If orders are found, return them with a 200 status code
    return res.status(200).json(orders);
  } catch (e) {
    //Handle any errors that occur during the order retrieval process
    res.status(500).json({ error: e.message });
  }
});

orderRouter.patch('/api/orders/:id/delivered', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, { delivered: true, processing: false }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ msg: "Order not found" })
    } else {
      return res.status(200).json(updatedOrder);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

orderRouter.patch('/api/orders/:id/processing', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, { processing: false, delivered: false }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ msg: "Order not found" })
    } else {
      return res.status(200).json(updatedOrder);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

orderRouter.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json(orders);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = orderRouter;


