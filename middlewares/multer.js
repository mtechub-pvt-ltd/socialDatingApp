const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);  
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".PNG" && ext !== ".gif" && ext !== ".mp4" && ext !== ".ogg" && ext !== ".wmv"&& ext !== ".x-flv"&& ext !== ".avi"
    && ext !== ".webm" && ext !== ".mkv" &&  ext !== ".avchd" && ext !== ".mov" ) {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});