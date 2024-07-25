import multer from "multer";
import { v4 as uuidv4 } from "uuid"
import path from "path"

const storage = (uploadPath) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueSuffix);
    },
  });

const fileUpload = (uploadPath) => multer({ storage: storage(uploadPath) });


export default fileUpload;
