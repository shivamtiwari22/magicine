import Product from "../../src/models/adminModel/GeneralProductModel.js";
import handleResponse from "../../config/http-response.js";
import { all } from "axios";


class ProductController {
  // add product
  static AddProduct = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const galleryImages = req.files;

      if (
        !galleryImages.gallery_image ||
        !Array.isArray(galleryImages.gallery_image)
      ) {
        return handleResponse(
          400,
          "Gallery images are missing or invalid",
          {},
          resp
        );
      }

      const { featured_image, gallery_image, ...productData } = req.body;

      const existingProduct = await Product.findOne({
        product_name: productData.product_name,
      });

      if (existingProduct) {
        return handleResponse(400, "Product already exists", {}, resp);
      }

      const newProduct = new Product({
        ...productData,
        featured_image: galleryImages.featured_image[0].path,
        gallery_image: galleryImages.gallery_image.map((items) => items.path),
        created_by: user.id,
      });
      await newProduct.save();

      return handleResponse(
        201,
        "Product added successfully",
        { newProduct },
        resp
      );
    } catch (err) {
      if (err.name === "ValidationError") {
        const validationErrors = Object.keys(err.errors).map((field) => ({
          field: field,
          message: err.errors[field].message,
        }));
        return handleResponse(
          400,
          "Validation error.",
          { errors: validationErrors },
          resp
        );
      } else {
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };

  // get products
  static GetProduct = async (req, resp) => {
    try {
      const allProducts = await Product.find({ deleted_at: null }).sort({
        createdAt: -1,
      });

      if (allProducts.length < 1) {
        return handleResponse(404, "No products available", {}, resp);
      }

      return handleResponse(
        200,
        "All products fetched successfully.",
        { allProducts },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
  // get products id
  static GetProductID = async (req, resp) => {
    try {
      const { id } = req.params;
      const allProducts = await Product.findOne({ id }).sort({
        createdAt: -1,
      });

      if (!allProducts) {
        return handleResponse(404, "No products available", {}, resp);
      }

      return handleResponse(
        200,
        "All products fetched successfully.",
        { allProducts },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // delete products
  static DeleteProduct = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const product = await Product.findOne({ id });
      // console.log(product);

      if (!product) {
        return handleResponse(404, "Product not found", {}, resp);
      }

      if (product.deleted_at !== null) {
        await Product.findOneAndDelete({ id });

        handleResponse(200, "product deleted successfully.", {}, resp);
      } else {
        return handleResponse(
          400,
          "For deleting this product you have to add it to the trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //update product
  static UpdateProduct = async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, res);
      }

      const { id } = req.params;
      const { featured_image, gallery_image, ...productData } = req.body;

      const images = req.files;

      const existingProductName = await Product.findOne({
        product_name: productData.product_name,
      });

      if (existingProductName) {
        return handleResponse(409, "Product already exists", {}, res);
      }

      const existingProduct = await Product.findOne({ id });

      if (!existingProduct) {
        return handleResponse(404, "Product not found", {}, res);
      }

      for (const key in productData) {
        if (Object.hasOwnProperty.call(productData, key)) {
          existingProduct[key] = productData[key];
        }
      }

      if (images && images.featured_image && images.featured_image.length > 0) {
        existingProduct.featured_image = images.featured_image[0].path;
      }

      if (images && images.gallery_image && images.gallery_image.length > 0) {
        existingProduct.gallery_image = images.gallery_image.map(
          (item) => item.path
        );
      }

      await existingProduct.save();

      return handleResponse(
        200,
        "Product updated successfully",
        { existingProduct },
        res
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  // soft delete
  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const product = await Product.findOne({ id });
      if (!product) {
        return handleResponse(404, "Product not found", {}, resp);
      }

      if (product.deleted_at === null) {
        product.deleted_at = new Date();
        await product.save();

        return handleResponse(200, "Product added to trash.", {}, resp);
      } else {
        return handleResponse(400, "Product already added to trash", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get trash
  static GetTrash = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const allProducts = await Product.find();
      const trashProduct = allProducts.filter(
        (product) => product.deleted_at !== null
      );
      return handleResponse(
        200,
        "Product fetched successfully from trash",
        { trashProduct },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // restore trash
  static RestoreTrash = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const product = await Product.findOne({ id });
      if (!product) {
        return handleResponse(404, "Product not found", {}, resp);
      }

      if (product.deleted_at !== null) {
        product.deleted_at = null;
        await product.save();

        return handleResponse(200, "Product restored successfully.", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default ProductController;
