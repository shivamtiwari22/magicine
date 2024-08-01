import Product from "../../src/models/adminModel/GeneralProductModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import Tags from "../../src/models/adminModel/Tags.js";
import csvtojson from "csvtojson";
import fs from "fs";
import SequenceModel from "../../src/models/sequence.js";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { format } from "fast-csv";
import moment from "moment";
import { type } from "os";
import Uses from "../../src/models/adminModel/UsesModel.js";
import Form from "../../src/models/adminModel/FormModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import InventoryWithVarientModel from "../../src/models/adminModel/InventoryWithVarientModel.js"
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const saveImageAndGetUrl = (imagePath, staticDir, baseUrl) => {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Source file does not exist: ${imagePath}`);
  }

  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${path.basename(imagePath)}`;
  const targetPath = path.join(staticDir, fileName);

  try {
    fs.copyFileSync(imagePath, targetPath);
  } catch (err) {
    console.error(`Error copying file: ${err.message}`);
    throw err;
  }

  return `${baseUrl}/${fileName}`;
};

const convertToBoolean = (value) => {
  if (typeof value === "string") {
    if (value.toUpperCase() === "TRUE") return true;
    if (value.toUpperCase() === "FALSE") return false;
  }
  return value;
};

const getNextSequenceValue = async (modelName) => {
  let sequence = await SequenceModel.findOneAndUpdate(
    { modelName: modelName },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, new: true }
  );
  return sequence.sequenceValue;
};

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
        type: "Product",
      });

      const base_url = `${req.protocol}://${req.get("host")}`;

      if (images) {
        if (images.featured_image && images.featured_image.length > 0) {
          newProduct.featured_image = `${base_url}/${images.featured_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.gallery_image && images.gallery_image.length > 0) {
          newProduct.gallery_image = images.gallery_image.map(
            (items) => `${base_url}/${items.path.replace(/\\/g, "/")}`
          );
        }
      }

      let tagId = [];
      if (tags) {
        let tagsArray;

        try {
          tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags);
        } catch (e) {
          tagsArray = [tags];
        }

        const newTags = [];

        for (const tag in tagsArray) {
          const existingTag = await Tags.findOne({ name: tag });
          if (!existingTag) {
            const newTag = new Tags({
              name: tag,
              created_by: user.id,
              count: 1,
            });
            const savedTag = await newTag.save();
            newTags.push(savedTag);
          } else {
            newTags.push(existingTag);
            existingTag.count += 1;
            await existingTag.save();
          }
        }

        tagId = newTags.map((tag) => tag.id);
      }

      newProduct.tags = tagId;

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
      const { brand, manufacture, status, fromDate, toDate, search } = req.query;

      let filter = {};

      if (status) {
        filter.status = status;
      }
      if (brand) {
        filter.brand = brand;
      }
      if (manufacture) {
        filter.marketer = manufacture;
      }

      if (fromDate && toDate) {
        const from = moment(fromDate, "YYYY-MM-DD").startOf('day').toDate();
        const to = moment(toDate, "YYYY-MM-DD").endOf('day').toDate();

        filter.createdAt = { $gte: from, $lte: to };
      }

      const products = await Product.find(filter).sort({ createdAt: -1 });

      const allProducts = products.filter(product => product.deleted_at === null);

      if (!allProducts || allProducts.length === 0) {
        return handleResponse(200, "No products available", {}, resp);
      }

      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];

        if (product.created_by) {
          const createdBY = await User.findOne({ id: product.created_by });
          product.created_by = createdBY;
        }

        if (product.category && Array.isArray(product.category)) {
          product.category = await Promise.all(
            product.category.map(async (categoryId) => {
              const category = await Category.findOne({ id: categoryId });
              return category && category.status === true ? category : null;
            })
          );

          product.category = product.category.filter(category => category !== null);
        }

        if (product.linked_items && product.linked_items.length > 0) {
          const linkedItemsDetails = await Promise.all(
            product.linked_items.map(async (linkedItemId) => {
              const linkedItem = await Product.findOne({ id: linkedItemId });
              return linkedItem && linkedItem.status === true ? linkedItem : null;
            })
          );

          product.linked_items = linkedItemsDetails.filter(item => item !== null);
        }


        if (product.tags && product.tags.length > 0) {
          const tagsDetail = await Promise.all(
            product.tags.map(async (tagId) => {
              const numericTagId = Number(tagId);
              if (isNaN(numericTagId)) {
                throw new Error(`Invalid tagId: ${tagId}`);
              }
              return await Tags.findOne({ id: numericTagId });
            })
          );
          product.tags = tagsDetail;
        }

        if (product.marketer) {
          const marketer = await Marketer.findOne({ id: product.marketer });
          product.marketer = marketer && marketer.status === true ? marketer : null;
        }

        if (product.brand) {
          const brand = await Brand.findOne({ id: product.brand });
          product.brand = brand && brand.status === true ? brand : null;
        }


        if (product.uses) {
          const GetUses = await Uses.findOne({ id: product.uses });
          product.uses = GetUses;
        }

        if (product.form) {
          const GetForm = await Form.findOne({ id: product.form });
          product.form = GetForm;
        }
      }

      const filteredProduct = allProducts.filter((product) => {
        let matches = true;

        if (search) {
          const searchRegex = new RegExp(search, "i");
          matches = matches && (
            searchRegex.test(product.product_name) ||
            searchRegex.test(product.brand) ||
            searchRegex.test(product.marketer) ||
            searchRegex.test(product.status)
          );
        }

        return matches;
      });

      return handleResponse(
        200,
        "All products fetched successfully.",
        { filteredProduct },
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
        return handleResponse(200, "No products available", {}, resp);
      }

      if (allProducts.marketer) {
        const getMarketer = await Marketer.findOne({
          id: allProducts.marketer,
        });
        allProducts.marketer = getMarketer && getMarketer.status === true ? getMarketer : null;
      }
      if (allProducts.brand) {
        const getBrand = await Brand.findOne({ id: allProducts.brand });
        allProducts.brand = getBrand && getBrand.status === true ? getBrand : null;
      }

      if (allProducts.uses) {
        const getBrand = await Uses.findOne({ id: allProducts.uses });
        allProducts.uses = getBrand;
      }

      if (allProducts.form) {
        const getBrand = await Form.findOne({ id: allProducts.form });
        allProducts.form = getBrand;
      }

      if (allProducts.created_by) {
        const createdBY = await User.findOne({ id: allProducts.created_by });
        allProducts.created_by = createdBY;
      }

      if (allProducts.category && Array.isArray(allProducts.category)) {
        allProducts.category = await Promise.all(
          allProducts.category.map(async (categoryId) => {
            const categoryData = await Category.findOne({ id: categoryId });
            return categoryData && categoryData.status === true ? categoryData : null;
          })
        );
        allProducts.category = allProducts.category.filter(item => item !== null)
      }


      if (allProducts.tags && Array.isArray(allProducts.tags)) {
        allProducts.tags = await Promise.all(
          allProducts.tags.map(async (tagsId) => {
            const tagsData = await Tags.findOne({ id: tagsId });
            return tagsData;
          })
        );
      }
      if (allProducts.linked_items && allProducts.linked_items.length > 0) {
        const linkedItemsDetails = await Promise.all(
          allProducts.linked_items.map(async (linkedItemId) => {
            const linkedItem = await Product.findOne({ id: linkedItemId });
            return linkedItem && linkedItem.status === true ? linkedItem : null;
          })
        );
        allProducts.linked_items = linkedItemsDetails.filter(item => item !== null);
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

        if (product.has_variant) {
          await InventoryWithVarient.deleteMany({ modelType: product.type, modelId: id });
        } else {
          await InvertoryWithoutVarient.deleteMany({ itemType: product.type, itemId: id });
        }

        handleResponse(200, "General Product deleted successfully.", {}, resp);
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
      const { featured_image, gallery_image, tags, ...productData } = req.body;
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

      const base_url = `${req.protocol}://${req.get("host")}`;

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

      let tagId = [];
      if (tags) {
        let tagsArray;
        try {
          tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags);
        } catch (err) {
          tagsArray = [tags];
        }

        const currentTags = existingProduct.tags.map((tag) => tag.toString());

        const newTags = [];
        const tagPromises = tagsArray.map(async (tag) => {
          let existingTag = await Tags.findOne({ name: tag });
          if (!existingTag) {
            const newTag = new Tags({
              name: tag,
              created_by: user.id,
              count: 1,
            });
            const savedTag = await newTag.save();
            newTags.push(savedTag);
            return savedTag.id;
          } else {
            newTags.push(existingTag);
            existingTag.count += 1;
            await existingTag.save();
            return existingTag.id;
          }
        });

        tagId = await Promise.all(tagPromises);

        const removedTags = currentTags.filter(
          (tag) => !tagsArray.includes(tag)
        );
        for (const tag of removedTags) {
          const tagDoc = await Tags.findOne({ id: tag });
          if (tagDoc) {
            tagDoc.count -= 1;
            await tagDoc.save();
          }
        }
      }

      existingProduct.tags = tagId;

      await existingProduct.save();

      return handleResponse(
        200,
        "General Product Updated Successfully",
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

        return handleResponse(200, "General Product added to trash.", product, resp);
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

      const { createdAt, status } = req.query;
      const baseQuery = {};

      if (createdAt) {
        baseQuery.createdAt = { $gte: new Date(createdAt) };
      }
      if (status !== undefined) {
        const statusBoolean = status === "true";
        baseQuery.status = statusBoolean;
      }

      const allProducts = await Product.find(baseQuery);
      const trashProduct = allProducts.filter(
        (product) => product.deleted_at !== null
      );

      if (trashProduct.length == 0) {
        return handleResponse(200, "No products available in trash", {}, resp);
      }

      for (const key of trashProduct) {
        if (key.brand) {
          const brandData = await Brand.findOne({ id: key.brand })
          key.brand = brandData
        }
        if (key.marketer) {
          const marketerData = await Marketer.findOne({ id: key.marketer })
          key.marketer = marketerData
        }

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
        return handleResponse(
          200,
          "General Product restored successfully.",
          product,
          resp
        );
      } else {
        return handleResponse(400, "Product already restored", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //import product
  static ImportProductCSV = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const csvFile = req.files && req.files.csvFile && req.files.csvFile[0];
      if (!csvFile) {
        return handleResponse(400, "No file uploaded", {}, resp);
      }

      const filePath = csvFile.path;

      if (!filePath) {
        return handleResponse(400, "File does not exist", {}, resp);
      }

      const productData = [];
      const csvData = await csvtojson().fromFile(filePath);

      const filteredData = csvData.filter(item => {
        return Object.values(item).some(value => value.trim() !== "");
      });


      for (const item of filteredData) {
        const existingProduct = await Product.findOne({ product_name: item["Product Name"] });
        if (existingProduct) {
          return handleResponse(409, "Product with this name already exists.", {}, resp);
        }

        const tags = item.Tags ? item.Tags.split(",") : [];

        let tagId = [];
        const newTags = [];
        for (const tag of tags) {
          const existingTag = await Tags.findOne({ name: tag });
          if (!existingTag) {
            const newTag = new Tags({ name: tag, created_by: user.id });
            const savedTag = await newTag.save();
            newTags.push(savedTag);
            tagId.push(savedTag.id);
          } else {
            newTags.push(existingTag);
            tagId.push(existingTag.id);
          }
        }


        const categoryData = item?.category ? item?.category.split(",").map(category => category.trim()) : [];
        let categoryId = [];
        let newCategoryData = [];

        for (const category of categoryData) {
          const trimmedCategory = category.trim().toLowerCase();
          const slug = trimmedCategory.replace(/\s+/g, '-');

          const existingCategory = await Category.findOne({ category_name: category });
          if (!existingCategory) {
            const newCategory = new Category({ category_name: category, slug: slug, created_by: user.id });
            const saveCategory = await newCategory.save();
            newCategoryData.push(saveCategory);
            categoryId.push(saveCategory.id);
          } else {
            newCategoryData.push(existingCategory);
            categoryId.push(existingCategory.id);
          }
        }



        const customId = await getNextSequenceValue("product");

        const product = new Product({
          id: customId,
          product_name: item["Product Name"],
          featured_image: item["Featured Image"],
          status: item.Status === "TRUE" ? true : false,
          slug: item["Slug"],
          gallery_image: item["Gallery Image"],
          hsn_code: item["HSN Code"],
          category: categoryId,
          has_variant: item["Has Variant"] === "TRUE" ? true : false,
          marketer: parseInt(item.Marketer),
          brand: item["Brand"],
          weight: item["Weight"],
          length: item.Length ? item.Length : null,
          width: item.Width ? item.Width : null,
          height: item.Height ? item.Height : null,
          form: item.Form,
          packOf: item["pack_of"],
          tags: tagId,
          long_description: item["Long Description"],
          short_description: item["Short Description"],
          minimum_order_quantity: item["Minimum Order Quantity"],
          linked_items: item["Linked Items"] ? item["Linked Items"].split(",") : [],
          meta_title: item["Meta Title"],
          meta_description: item["Meta Description"],
          meta_keywords: item["Meta Keywords"],
          type: item.Type,
          og_tag: item["OG Tag"],
          schema_markup: item["Schema Markup"],
          created_by: user.id,
          uses: item["Uses"],
          type: "Product",
          age: item["Age"].split(","),
          recently_bought: item["Recently Bought"],
          product_highlight: item["Product HighLight"],
          isEnquired: item["isEnquired"]
        });

        productData.push(product);
      }

      await Product.insertMany(productData);

      return handleResponse(201, "Products imported successfully", { data: productData }, resp);
    } catch (err) {
      if (err.name === "ValidationError") {
        const validationErrors = Object.keys(err.errors).map((field) => ({
          field: field,
          message: err.errors[field].message,
        }));
        return handleResponse(400, "Validation error.", { errors: validationErrors }, resp);
      } else {
        console.error("Error:", err);
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };

  //export product data
  static ExportProductCSV = async (req, resp) => {
    try {
      const products = await Product.find().lean();

      if (products.length === 0) {
        return handleResponse(200, "No products available", {}, resp);
      }

      const csvStream = format({
        headers: [
          "Product Name",
          "Featured Image",
          "Status",
          "Slug",
          "Gallery Image",
          "HSN Code",
          "category",
          "Has Variant",
          "Marketer",
          "Brand",
          "Weight",
          "Length",
          "Width",
          "Height",
          "Form",
          "Pack Of",
          "Tags",
          "Long Description",
          "Short Description",
          "Minimum Order Quantity",
          "Linked Items",
          "Meta Title",
          "Meta Description",
          "Meta Keywords",
          "Type",
          "OG Tag",
          "Schema Markup",
          "Created At",
          "Uses",
          "Age",
          "Recently Bought",
          "Product HighLight",
          "isEnquired",
        ],
      });

      resp.setHeader('Content-Type', 'text/csv');
      resp.setHeader('Content-Disposition', 'attachment; filename=Product.csv');

      csvStream.pipe(resp);

      products.forEach((product) => {
        csvStream.write({
          "Product Name": product.product_name,
          "Featured Image": product.featured_image,
          "Status": product.status,
          "Slug": product.slug,
          "Gallery Image": product.gallery_image.join(","),
          "HSN Code": product.hsn_code,
          "category": Array.isArray(product.category) && product.category.length > 0 ? product.category.join(",") : "",
          "Has Variant": product.has_variant,
          "Marketer": product.marketer,
          "Brand": product.brand,
          "Weight": product.weight,
          "Length": product.length,
          "Width": product.width,
          "Height": product.height,
          "Form": product.form,
          "Pack Of": product.packOf,
          "Tags": product.tags.join(","),
          "Long Description": product.long_description,
          "Short Description": product.short_description,
          "Minimum Order Quantity": product.minimum_order_quantity,
          "Linked Items": product.linked_items.join(", "),
          "Meta Title": product.meta_title,
          "Meta Description": product.meta_description,
          "Meta Keywords": product.meta_keywords,
          "Type": product.type,
          "OG Tag": product.og_tag,
          "Schema Markup": product.schema_markup,
          "Created At": moment(product.createdAt).toISOString(),
          "Uses": product.uses,
          "Age": product.age,
          "Recently Bought": product.recently_bought,
          "Product HighLight": product.product_highlight,
          "isEnquired": product.isEnquired
        });
      });

      csvStream.end();

    } catch (err) {
      console.error("Error exporting products:", err);
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static GetProductWithInventory = async (req, resp) => {
    try {
      const { brand, manufacture, status, fromDate, toDate, search, type } = req.query;

      let filter = {};

      if (status) {
        filter.status = status;
      }
      if (brand) {
        filter.brand = brand;
      }
      if (manufacture) {
        filter.marketer = manufacture;
      }

      if (fromDate && toDate) {
        const from = moment(fromDate, "YYYY-MM-DD").startOf('day').toDate();
        const to = moment(toDate, "YYYY-MM-DD").endOf('day').toDate();

        filter.createdAt = { $gte: from, $lte: to };
      }

      // Fetch products with the specified filter
      const products = await Product.find(filter).sort({ createdAt: -1 });
      // const allProducts = products.filter(product => product.deleted_at === null);

      if (products.length === 0) {
        return handleResponse(200, "No products available", {}, resp);
      }

      // Fetch IDs of products in InventoryWithVarient and InventoryWithoutVarient
      const inventoryWithVariantIds = await InventoryWithVarientModel.distinct('modelId', { modelType: "Product" });
      const inventoryWithoutVariantIds = await InvertoryWithoutVarient.distinct('itemId', { itemType: "Product" });


      const validProductIds = new Set([
        ...inventoryWithVariantIds,
        ...inventoryWithoutVariantIds
      ]);


      let filteredProducts = products.filter(product => validProductIds.has(product.id));

      for (const product of filteredProducts) {
        if (product.created_by) {
          product.created_by = await User.findOne({ id: product.created_by });
        }

        if (product.category && Array.isArray(product.category)) {
          product.category = await Promise.all(
            product.category.map(async (categoryId) => {
              const category = await Category.findOne({ id: categoryId });
              return category && category.status === true ? category : null;
            })
          );
          product.category = product.category.filter(category => category !== null);
        }

        if (product.linked_items && product.linked_items.length > 0) {
          const linkedItemsDetails = await Promise.all(
            product.linked_items.map(async (linkedItemId) => {
              const linkedItem = await Product.findOne({ id: linkedItemId });
              return linkedItem && linkedItem.status === true ? linkedItem : null;
            })
          );
          product.linked_items = linkedItemsDetails.filter(item => item !== null);
        }

        if (product.tags && product.tags.length > 0) {
          const tagsDetail = await Promise.all(
            product.tags.map(async (tagId) => {
              const numericTagId = Number(tagId);
              if (isNaN(numericTagId)) {
                throw new Error(`Invalid tagId: ${tagId}`);
              }
              return await Tags.findOne({ id: numericTagId });
            })
          );
          product.tags = tagsDetail;
        }

        if (product.marketer) {
          product.marketer = await Marketer.findOne({ id: product.marketer });
          if (product.marketer && product.marketer.status !== true) {
            product.marketer = null;
          }
        }

        if (product.brand) {
          product.brand = await Brand.findOne({ id: product.brand });
          if (product.brand && product.brand.status !== true) {
            product.brand = null;
          }
        }

        if (product.uses) {
          product.uses = await Uses.findOne({ id: product.uses });
        }

        if (product.form) {
          product.form = await Form.findOne({ id: product.form });
        }
      }

      // Classify and filter products based on type if provided
      if (type) {
        filteredProducts = filteredProducts.filter(product => {
          if (type === 'Product') {
            return inventoryWithVariantIds.includes(product.id);
          } else if (type === 'Medicine') {
            return inventoryWithoutVariantIds.includes(product.id) && product.modelType === 'Medicine';
          } else if (type === 'Equipment') {
            return inventoryWithoutVariantIds.includes(product.id) && product.modelType === 'Equipment';
          }
          return false;
        });
      }

      const searchRegex = search ? new RegExp(search, "i") : null;

      const filteredProduct = filteredProducts.filter(product => {
        if (searchRegex) {
          return searchRegex.test(product.product_name) ||
            searchRegex.test(product.brand) ||
            searchRegex.test(product.marketer) ||
            searchRegex.test(product.status);
        }
        return true;
      });

      return handleResponse(
        200,
        "All products fetched successfully.",
        { filteredProduct },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

}

export default ProductController;
