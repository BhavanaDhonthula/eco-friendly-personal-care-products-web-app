const express = require("express");
const cors = require("cors");
const path = require("path");

const startServerAndConnectToDatabase = require("./Logics/starServerAndConnectDb");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/major-project-imgs",
  express.static(path.join(__dirname, "major-project-imgs")),
);

app.use("/", authRoutes);

// FIX: orderRoutes must be mounted BEFORE productRoutes.
// productRoutes registers GET /products which Express matches against
// GET /products/:productId/comments, intercepting it and returning the
// product list instead of comments. Specific routes must come first.
app.use("/", orderRoutes);
app.use("/", productRoutes);

app.use("/", cartRoutes);
app.use("/", addressRoutes);

app.get("/", (req, res) => {
  res.send("EcoGlow API is running");
});

startServerAndConnectToDatabase(app);

module.exports = app;
