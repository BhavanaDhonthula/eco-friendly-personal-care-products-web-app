const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const startServerAndConnectToDatabase = (app) => {
  app.listen(8000, () =>
    console.log("Server Started and Running at http://localhost:8000"),
  );

  mongoose
    .connect(process.env.CONNECTION_STRING)
    .then(() => {
      console.log("MongoDB connected Successfully");
    })
    .catch((err) => {
      console.log("mongoError:", err);
    });
};

module.exports = startServerAndConnectToDatabase;
