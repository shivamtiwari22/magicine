import Product from "../../src/models/adminModel/GeneralProductModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import Tags from "../../src/models/adminModel/Tags.js";

class ProductController {
  // add product
  static AddProduct = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const images = req.files;

      const { featured_image, gallery_image, tags, ...productData } = req.body;

      const existingProduct = await Product.findOne({
        product_name: productData.product_name,
      });

      if (existingProduct) {
        return handleResponse(400, "Product already exists", {}, resp);
      }

      const newProduct = new Product({
        ...productData,
        created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}/api`;

      if (images) {
        if (
          images &&
          images.featured_image &&
          images.featured_image.length > 0
        ) {
          newProduct.featured_image = `${base_url}/${images.featured_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.gallery_image && images.gallery_image.length > 0) {
          newProduct.gallery_image = images.gallery_image.map(
            (items) => `${base_url}/${items.path.replace(/\\/g, "/")}`
          );
        }
      }

      let tagIds = [];
      if (tags && tags.length > 0) {
        let tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags);

        const existingTags = await Tags.findOne({ name: { $in: tagsArray } });
        const existingTagNames = existingTags.map((tag) => tag.name);

        const newTagNames = tagsArray.filter(
          (tag) => !existingTagNames.includes(tag)
        );

        const newTags = await Tags.insertMany(
          newTagNames.map((name) => ({ name }))
        );

        tagIds = [...existingTags, ...newTags].map((tag) => tag.id);
      }

      newProduct.tags = tagIds;

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

      for (const product of allProducts) {
        if (product.created_by) {
          const createdBY = await User.findOne({ id: product.created_by });
          product.created_by = createdBY;
        }

        if (product.categories && Array.isArray(product.categories)) {
          product.categories = await Promise.all(
            product.categories.map(async (categoryId) => {
              const categoryData = await Category.findOne({ id: categoryId });
              return categoryData;
            })
          );
        }
        if (product.linked_items && product.linked_items.length > 0) {
          const categoryDetails = await Promise.all(
            product.linked_items.map(async (categoryId) => {
              return await Product.findOne({ id: categoryId });
            })
          );
          product.linked_items = categoryDetails;
        }

        if (product.marketer) {
          const GetMarketer = await Marketer.findOne({ id: product.marketer });
          product.marketer = GetMarketer;
        }

        if (product.brand) {
          const GetBrand = await Brand.findOne({ id: product.brand });
          product.brand = GetBrand;
        }
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

      if (allProducts.marketer) {
        const getMarketer = await Marketer.findOne({
          id: allProducts.marketer,
        });
        allProducts.marketer = getMarketer;
      }
      if (allProducts.brand) {
        const getBrand = await Brand.findOne({ id: allProducts.brand });
        allProducts.brand = getBrand;
      }
      if (allProducts.created_by) {
        const createdBY = await User.findOne({ id: allProducts.created_by });
        allProducts.created_by = createdBY;
      }

      if (allProducts.categories && Array.isArray(allProducts.categories)) {
        allProducts.categories = await Promise.all(
          allProducts.categories.map(async (categoryId) => {
            const categoryData = await Category.findOne({ id: categoryId });
            return categoryData;
          })
        );
      }
      if (allProducts.linked_items && allProducts.linked_items.length > 0) {
        const categoryDetails = await Promise.all(
          allProducts.linked_items.map(async (categoryId) => {
            return await Product.findOne({ id: categoryId });
          })
        );
        allProducts.linked_items = categoryDetails;
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
        id: { $ne: id },
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

      const base_url = `${req.protocol}://${req.get("host")}/api`;

      if (images && images.featured_image && images.featured_image.length > 0) {
        existingProduct.featured_image = `${base_url}/${images.featured_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }

      if (images && images.gallery_image && images.gallery_image.length > 0) {
        existingProduct.gallery_image = images.gallery_image.map(
          (item) => `${base_url}/${item.path.replace(/\\/g, "/")}`
        );
      }

      await existingProduct.save();

      return handleResponse(
        200,
        "Product updated successfully",
        existingProduct,
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

      if (trashProduct.length == 0) {
        return handleResponse(404, "No products available in trash", {}, resp);
      }
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
      } else {
        return handleResponse(400, "Product already restored", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default ProductController;
