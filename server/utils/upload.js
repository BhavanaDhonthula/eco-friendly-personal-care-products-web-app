const multer = require("multer");
const path = require("path");

// All uploaded images (product thumbnails, product images, store logos)
// are stored in server/major-project-imgs and served statically at
// http://localhost:8000/major-project-imgs/<filename>
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "major-project-imgs"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

module.exports = upload;
