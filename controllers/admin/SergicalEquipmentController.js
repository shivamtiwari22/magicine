import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import { format } from "fast-csv";
import fs from "fs";
import moment from "moment";
import { fileURLToPath } from "url";
import path from "path";
import { dirname } from "path";
import csvtojson from "csvtojson";
import SequenceModel from "../../src/models/sequence.js";

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
  return Boolean(value);
};

const getNextSequenceValue = async (modelName) => {
  let sequence = await SequenceModel.findOneAndUpdate(
    { modelName: modelName },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, new: true }
  );
  return sequence.sequenceValue;
};

class SergicalEquipmentController {
  //add sergical equipment
  static AddSergicalEquipment = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const images = req.files;
      const { featured_image, gallery_image, ...equipmentData } = req.body;

      const existingEquipment = await Sergical_Equipment.findOne({
        product_name: equipmentData.product_name,
      });

      if (existingEquipment) {
        return handleResponse(409, "Equipment already exists", {}, resp);
      }

      const newEquipment = new Sergical_Equipment({
        created_by: user.id,
        type: "Equipment",
        has_variant: false,
      });

      if (equipmentData["description.name"]) {
        newEquipment.description = {
          name: equipmentData["description.name"],
          status: equipmentData["description.status"],
          content: equipmentData["description.content"],
        };
      }

      if (equipmentData["short_description.name"]) {
        newEquipment.short_description = {
          name: equipmentData["short_description.name"],
          status: equipmentData["short_description.status"],
          content: equipmentData["short_description.content"],
        };
      }

      Object.assign(newEquipment, equipmentData);

      const base_url = `${req.protocol}://${req.get("host")}/api`;
      if (images) {
        if (images.featured_image) {
          newEquipment.featured_image = `${base_url}/${images.featured_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images.gallery_image) {
          newEquipment.gallery_image = images.gallery_image.map(
            (item) => `${base_url}/${item.path.replace(/\\/g, "/")}`
          );
        }
      }

      await newEquipment.save();
      return handleResponse(201, "Equipment created", { newEquipment }, resp);
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

  //get sergical equipment
  static GetSergicalEquipment = async (req, resp) => {
    try {
      
      const { brand, product_name , status } = req.query;
  
      let filter = {};

      // Add filters based on query parameters
      if (status) {
        filter.status = status;
      }
      if (brand) {
        filter.brand = new RegExp(brand, "i");
      }

      if (product_name) {
        filter.product_name = new RegExp(product_name, "i");
      }

      const allEquipment = await Sergical_Equipment.find(filter).sort({
        createdAt: -1,
      });

      const equipment = await allEquipment.filter(
        (equipment) => equipment.delete_at === null
      );

      if (equipment.length == 0) {
        return handleResponse(200, "No equipment available", {}, resp);
      }

      for (const surgicalEquipment of equipment) {
        if (surgicalEquipment.created_by) {
          const createdBy = await User.findOne({
            id: surgicalEquipment.created_by,
          });
          surgicalEquipment.created_by = createdBy;
        }

        if (surgicalEquipment.marketer) {
          const getMarketer = await Marketer.findOne({
            id: surgicalEquipment.marketer,
          });
          surgicalEquipment.marketer = getMarketer;
        }

        if (
          surgicalEquipment.linked_items &&
          Array.isArray(surgicalEquipment.linked_items)
        ) {
          surgicalEquipment.linked_items = await Promise.all(
            surgicalEquipment.linked_items.map(async (linkedItemsId) => {
              const linkedItemsData = await Sergical_Equipment.findOne({
                id: linkedItemsId,
              });
              return linkedItemsData;
            })
          );
        }
      }

      return handleResponse(
        200,
        "Surgical Equipment fetched successfully.",
        equipment,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // update equipment
  static async UpdateSurgicalEquipment(req, resp) {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const images = req.files;
      const { featured_image, gallery_image, ...equipmentData } = req.body;

      const equipment = await Sergical_Equipment.findOne({ id: id });
      if (!equipment) {
        return handleResponse(404, "Equipment not found", {}, resp);
      }

      const existingEquipment = await Sergical_Equipment.findOne({
        product_name: equipmentData.product_name,
        id: { $ne: id },
      });

      if (existingEquipment) {
        return handleResponse(409, "Equipment already exists", {}, resp);
      }

      const base_url = `${req.protocol}://${req.get("host")}/api`;

      if (images && images.featured_image && images.featured_image.length > 0) {
        equipment.featured_image = `${base_url}/${images.featured_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }

      if (images && images.gallery_image && images.gallery_image.length > 0) {
        equipment.gallery_image = images.gallery_image.map(
          (item) => `${base_url}/${item.path.replace(/\\/g, "/")}`
        );
      }

      const setNestedField = (obj, path, value) => {
        const keys = path.split(".");
        let temp = obj;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!temp[keys[i]]) {
            temp[keys[i]] = {};
          }
          temp = temp[keys[i]];
        }
        temp[keys[keys.length - 1]] = value;
      };

      for (const key in equipmentData) {
        if (equipmentData.hasOwnProperty(key)) {
          setNestedField(equipment, key, equipmentData[key]);
        }
      }

      await equipment.save();
      return handleResponse(200, "Equipment updated", equipment, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  }

  //delete equipment
  static DeleteEquipment = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const equipment = await Sergical_Equipment.findOne({ id: id });

      if (!equipment) {
        return handleResponse(404, "Equipment not found", {}, resp);
      }

      if (equipment.delete_at !== null) {
        await Sergical_Equipment.findOneAndDelete({ id });
        return handleResponse(200, "Equipment deleted successfully", {}, resp);
      } else {
        return handleResponse(
          400,
          "For deleting this equipment first add it to trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //soft delete
  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const equipment = await Sergical_Equipment.findOne({ id });
      if (!equipment) {
        return handleResponse(404, "Equipment not found", {}, resp);
      }
      if (equipment.delete_at !== null) {
        return handleResponse(400, "Already added to trash.", {}, resp);
      }
      equipment.delete_at = new Date();
      await equipment.save();
      return handleResponse(
        200,
        "Equipment successfully added to trash.",
        equipment,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore
  static RestoreEquipment = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const equipment = await Sergical_Equipment.findOne({ id });
      if (!equipment) {
        return handleResponse(404, "Equipment not found", {}, resp);
      }
      if (equipment.delete_at === null) {
        return handleResponse(400, "Equipment already restored.", {}, resp);
      }
      equipment.delete_at = null;
      await equipment.save();
      return handleResponse(
        200,
        "Equipment restored successfully",
        equipment,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get trash
  static GetTrash = async (req, resp) => {
    try {
      const { createdAt, status } = req.query;
      let baseQuery = {};

      if (createdAt) {
        baseQuery.createdAt = { $gte: new Date(createdAt) };
      }
      if (status !== undefined) {
        const statusBoolean = status === "true";
        baseQuery.status = statusBoolean;
      }

      const equipmemnt = await Sergical_Equipment.find(baseQuery).sort({
        createdAt: -1,
      });

      const trash = await equipmemnt.filter(
        (equipmemnt) => equipmemnt.delete_at !== null
      );

      if (trash.length == 0) {
        return handleResponse(200, "No equipment available", {}, resp);
      }

      return handleResponse(
        200,
        "Surgical Equipment trash fetched successfully.",
        trash,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get sergical equipment id
  static GetSergicalEquipmentID = async (req, resp) => {
    try {
      const { id } = req.params;
      const equipmemnt = await Sergical_Equipment.findOne({
        id,
      }).sort({
        createdAt: -1,
      });

      if (!equipmemnt) {
        return handleResponse(404, "Surgical equipment not found.", {}, resp);
      }

      if (equipmemnt.created_by) {
        const createdBy = await User.findOne({
          id: equipmemnt.created_by,
        });
        equipmemnt.created_by = createdBy;
      }
      if (equipmemnt.marketer) {
        const GetMarketer = await Marketer.findOne({
          id: equipmemnt.marketer,
        });
        equipmemnt.marketer = GetMarketer;
      }
      if (equipmemnt.linked_items && Array.isArray(equipmemnt.linked_items)) {
        equipmemnt.linked_items = await Promise.all(
          equipmemnt.linked_items.map(async (linkedItemsId) => {
            const linkedItemsData = await Sergical_Equipment.findOne({
              id: linkedItemsId,
            });
            return linkedItemsData;
          })
        );
      }

      return handleResponse(
        200,
        "Surgical Equipment fetched successfully.",
        equipmemnt,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static sergicalCsv = async (req, res) => {
    try {
      const products = await Sergical_Equipment.find();
      if (products.length === 0) {
        return handleResponse(200, "No data available", {}, res);
      }

      const csvStream = format({
        headers: [
          "Id",
          "Product Name",
          "Featured Image",
          "Status",
          "Slug",
          "Gallery Image",
          "HSN Code",
          "Short Description",
          "Description",
          "Linked Items",
          "Meta Title",
          "Meta Description",
          "Meta Keywords",
          "Type",
          "OG Tags",
          "Schema Markup",
          "Created At",
        ],
      });

      const writableStream = fs.createWriteStream("SurgicalEquipments.csv");
      writableStream.on("finish", () => {
        res.download("Product.csv", "SurgicalEquipments.csv", (err) => {
          if (err) {
            return handleResponse(
              400,
              "Error downloading SurgicalEquipments.csv",
              {},
              res
            );
          }
        });
      });

      csvStream.pipe(writableStream);

      products.forEach((product) => {
        csvStream.write({
          Id: product.id,
          "Product Name": product.product_name,
          "Featured Image": product.featured_image,
          Status: product.status,
          Slug: product.slug,
          "Gallery Image": product.gallery_image.join(", "),
          "HSN Code": product.hsn_code,
          Marketer: product.marketer,
          Description: product.description.content,
          "Short Description": product.short_description.content,
          "Linked Items": product.linked_items.join(", "),
          "Meta Title": product.meta_title,
          "Meta Description": product.meta_description,
          "Meta Keywords": product.meta_keywords,
          "OG Tag": product.og_tag,
          "Schema Markup": product.schema_markup,
          "Created At": moment(product.createdAt).format("YYYY-MM-DD"),
        });
      });

      csvStream.end();
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  // Import Sergical file

  static ImportSergicalCSV = async (req, resp) => {
    try {
      const user = req.user;
      const csvFile = req.files && req.files.csvFile && req.files.csvFile[0];
      if (!csvFile) {
        return handleResponse(400, "No file uploaded", {}, resp);
      }
      const filePath = csvFile.path;

      if (!fs.existsSync(filePath)) {
        return handleResponse(400, "File does not exist", {}, resp);
      }

      const staticDir = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "surgical-equipments",
        "images"
      );
      const baseUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/public/surgical-equipments/images`;

      const productData = [];
      const csvData = await csvtojson({
        noheader: false,
        delimiter: "\t",
      }).fromFile(filePath);
      for (const item of csvData) {
        const existingProduct = await Sergical_Equipment.findOne({
          product_name: item.Product,
        });
        if (existingProduct) {
          console.warn(`Product ${item.Product} already exists, skipping...`);
          continue;
        }

        const customId = await getNextSequenceValue("Sergical_Equipment");

        const featuredImageUrl = saveImageAndGetUrl(
          item.Featured,
          staticDir,
          baseUrl
        );
        const galleryImagesUrls = item.Gallery
          ? item.Gallery.split(",").map((imagePath) =>
              saveImageAndGetUrl(imagePath, staticDir, baseUrl)
            )
          : [];

        productData.push({
          id: customId,
          product_name: item.Product,
          featured_image: featuredImageUrl,
          status: convertToBoolean(item.Status),
          slug: item.Slug,
          gallery_image: galleryImagesUrls,
          hsn_code: item.HSN_Code,
          marketer: item.Marketer,
          description: item.description,
          short_description: item.ShortDescription,
          linked_items: item.LinkedItems ? item.LinkedItems.split(",") : [],
          meta_title: item.MetaTitle,
          meta_description: item.MetaDescription,
          meta_keywords: item.MetaKeywords,
          type: "Equipments",
          og_tag: item.OGTag,
          schema_markup: item.SchemaMarkup,
          created_by: user.id,
        });
      }

      await Sergical_Equipment.insertMany(productData);

      return handleResponse(
        201,
        "Sergical Equipments imported successfully",
        { data: productData },
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
}

export default SergicalEquipmentController;
