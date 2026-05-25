const express = require("express");
const startServerAndConnectToDatabase = require("./Logics/starServerAndConnectDb");
const { Product, User, Seller } = require("./databaseSchema");
const multer = require("multer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(cors());
app.use("/major-project-imgs", express.static("major-project-imgs"));

startServerAndConnectToDatabase(app);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "major-project-imgs/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const imgInputs = multer({ storage });

app.post(
  "/products",
  imgInputs.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "productImgs", maxCount: 4 },
  ]),

  async (req, res) => {
    try {
      const thumbnail = req.files?.thumbnail?.[0]?.filename;

      const productImgs =
        req.files?.productImgs?.map((file) => file.filename) || [];

      let ingredients = [];
      let specifications = [];

      try {
        ingredients = req.body.ingredients
          ? JSON.parse(req.body.ingredients)
          : [];
      } catch {}

      try {
        specifications = req.body.specifications
          ? JSON.parse(req.body.specifications)
          : [];
      } catch {}

      const newProduct = new Product({
        ...req.body,
        ingredients,
        specifications,
        thumbnail,
        productImgs,
      });

      await newProduct.save();
      res.send({ succ_msg: "Product Added Successfully" });
    } catch (err) {
      console.error(err);

      res.status(500).send({ err_msg: "Error while adding a product" });
    }
  },
);

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    res.status(500).send({
      err_msg: "Error while getting products. Please refresh the page.",
    });
  }
});

app.get("/productDetailsPage/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const productData = await Product.find({ _id: id });
    res.send(productData);
  } catch (err) {
    res.status(500).send({ err_msg: "Error while getting product data." });
  }
});

app.post("/register", async (req, res) => {
  const userData = req.body;
  const { email, password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const dbUser = await User.findOne({ email });
  console.log(dbUser);

  if (dbUser === null) {
    const newUser = new User({ ...userData, password: hashedPassword });
    await newUser.save();
    res.json({ succ_msg: "User Registered" });
  } else {
    res.status(400).json({ err_msg: "User already exist" });
  }
});

app.post("/login", async (req, res) => {
  const userData = req.body;
  const { email, password } = userData;

  const dbUser = await User.findOne({ email });

  if (dbUser !== null) {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const payload = { email };
      const jwtToken = jwt.sign(payload, "access_token", { expiresIn: 30 });
      res.json({ jwtToken });
    } else {
      res.status(400).json({ err_msg: "Invalid Password" });
    }
  } else {
    res.status(400).json({ err_msg: "Invalid User Credentials" });
  }
});

app.post(
  "/seller-register",
  imgInputs.single("storeLogo"),
  async (req, res) => {
    const sellerData = req.body;

    const { email, shopName } = sellerData;
    const storeLogo = req.file?.path;

    const existingSeller = await Seller.findOne({ email });

    if (existingSeller === null) {
      const newSeller = new Seller({
        ...sellerData,
        storeLogo,
      });
      await newSeller.save();
      res.send({ succ_msg: "Registration Successful" });
    } else {
      res.status(400).send({ err_msg: "Seller Already Exist" });
    }
  },
);

app.post("/seller-login", async (req, res) => {
  const sellerDetails = req.body;
  const { storeName, email } = sellerDetails;

  const existingSeller = await Seller.findOne({ email, storeName });

  if (existingSeller !== null) {
    const payload = { email, storeName };
    const sellerJwtToken = jwt.sign(payload, "Seller_access_token", {
      expiresIn: 30,
    });
    res.send({ sellerJwtToken });
  } else {
    res.status(400).send({ err_msg: "Invalid Seller Credentials" });
  }
});
