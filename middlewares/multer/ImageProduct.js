import multer from "multer";
import pat from "path";

const storage = (path) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },

  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}${pat.extname(file.originalname)}`);
  },
});

const uploadProduct = (path) => multer({ storage: storage(path) });

export default uploadProduct;
