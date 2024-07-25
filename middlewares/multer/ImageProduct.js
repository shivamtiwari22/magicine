import multer from "multer";
import paths from "path";
import { v4 as uuidv4 } from "uuid";


const storage = (path) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },

    filename: function (req, file, cb) {
      const uniqueSuffix = `${Date.now()}-${uuidv4()}${paths.extname(file.originalname)}`;
      cb(null, uniqueSuffix);
    },
  });

const uploadProduct = (path) => multer({ storage: storage(path) });

export default uploadProduct;
