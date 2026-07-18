const jwt = require("jsonwebtoken");

// Verifies the customer's JWT (sent via Authorization: Bearer <token>).
// On success attaches req.userId and req.userEmail.
const authenticateUserToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ err_msg: "Invalid JWT Token" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) {
      return res.status(401).json({ err_msg: "Invalid JWT Token" });
    }
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  });
};

// Verifies the seller's JWT (sent via Authorization: Bearer <token>).
// On success attaches req.sellerId and req.sellerEmail.
const authenticateSellerToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ err_msg: "Invalid JWT Token" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err || !payload.sellerId) {
      return res.status(401).json({ err_msg: "Invalid JWT Token" });
    }
    req.sellerId = payload.sellerId;
    req.sellerEmail = payload.email;
    next();
  });
};

module.exports = { authenticateUserToken, authenticateSellerToken };
