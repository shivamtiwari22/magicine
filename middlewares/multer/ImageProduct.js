import multer from "multer";
import paths from "path";

const storage = (path) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },

    filename: function (req, file, cb) {
      cb(
        null,
        Date.now() + paths.extname(file.originalname)
      );
    },
  });

const uploadProduct = (path) => multer({ storage: storage(path) });

export default uploadProduct;
