import multer from "multer";
import path from "path";

const storage = (uploadPath) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

const fileUpload = (uploadPath) => multer({ storage: storage(uploadPath) });

export default fileUpload;
