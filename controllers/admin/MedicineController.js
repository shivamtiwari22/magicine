import Medicine from "../../src/models/adminModel/MedicineModel.js";
import handleResponse from "../../config/http-response.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import Tags from "../../src/models/adminModel/Tags.js";
import path from "path";
import { format } from "fast-csv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import csvtojson from "csvtojson";
import fs from "fs";
import SequenceModel from "../../src/models/sequence.js";
import moment from "moment";
import Uses from "../../src/models/adminModel/UsesModel.js";
import Form from "../../src/models/adminModel/FormModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import Review from "../../src/models/adminModel/ReviewsModel.js";

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

class MedicineController {
  //add medicine
  static AddMedicine = async (req, resp) => {

    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const images = req.files;
      const {
        gallery_image,
        featured_image,
        tags,
        has_variant,
        more_details = null,
        ...medicineData
      } = req.body;


      const existingMedicine = await Medicine.findOne({
        product_name: medicineData.product_name,
      });

      if (existingMedicine) {
        return handleResponse(409, "Medicine already exists.", {}, resp);
      }

      const newMedicineData = {
        ...medicineData,
        created_by: user.id,
        has_variant: has_variant,
        type: "Medicine",
      };

      const base_url = `${req.protocol}://${req.get("host")}`;

      if (images && images.featured_image) {
        newMedicineData.featured_image = `${base_url}/${images.featured_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }

      if (images && images.gallery_image) {
        newMedicineData.gallery_image = images.gallery_image.map(
          (item) => `${base_url}/${item.path.replace(/\\/g, "/")}`
        );
      }

      let tagId = [];
      if (tags) {
        let tagsArray;

        try {
          tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags);

          if (!Array.isArray(tagsArray)) {
            tagsArray = [tagsArray];
          }
        } catch (e) {
          console.error('Error parsing tags:', e);
          tagsArray = [];
        }

        const newTags = [];

        for (const tag of tagsArray) {
          const tagName = typeof tag === 'string' ? tag : tag?.name;

          if (!tagName) {
            continue;
          }

          const existingTag = await Tags.findOne({ name: tagName });
          if (!existingTag) {
            const newTag = new Tags({
              name: tagName,
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

      newMedicineData.tags = tagId;

      if (more_details) {
        try {
          newMedicineData.more_details = JSON.parse(more_details);
        } catch (e) {
          return handleResponse(
            400,
            "Invalid JSON format for more_details.",
            {},
            resp
          );
        }
      } else {
        newMedicineData.more_details = null;
      }

      const newMedicine = new Medicine(newMedicineData);

      await newMedicine.save();

      return handleResponse(
        201,
        "Medicine added successfully",
        { newMedicine },
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
        console.log("err", err);
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };

  //update medicine
  static UpdateMedicine = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;

      const medicine = await Medicine.findOne({ id });
      if (!medicine) {
        return handleResponse(404, "Medicine not found", {}, resp);
      }
      const images = req.files;

      const {
        featured_image,
        gallery_image,
        tags,
        more_details = null,
        ...medicineData
      } = req.body;

      const existingMedicine = await Medicine.findOne({
        product_name: medicineData.product_name,
        id: { $ne: medicine.id },
      });

      if (existingMedicine) {
        return handleResponse(409, "Medicine already exists", {}, resp);
      }

      for (const key in medicineData) {
        if (Object.hasOwnProperty.call(medicineData, key)) {
          medicine[key] = medicineData[key];
        }
      }
      const base_url = `${req.protocol}://${req.get("host")}`;
      if (images && images.featured_image) {
        medicine.featured_image = `${base_url}/${images.featured_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }
      if (images && images.gallery_image) {
        medicine.gallery_image = images.gallery_image.map(
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

        const currentTags = medicine.tags.map((tag) => tag.toString());

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

      medicine.tags = tagId;
      if (more_details) {
        try {
          medicine.more_details = JSON.parse(more_details);
        } catch (e) {
          return handleResponse(
            400,
            "Invalid JSON format for more_details.",
            {},
            resp
          );
        }
      } else {
        medicine.more_details = null;
      }

      await medicine.save();

      return handleResponse(
        200,
        "Medicine updated successfully",
        { medicine },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get medicine
  static GetMedicine = async (req, resp) => {
    try {
      const { brand, manufacture, status, fromDate, toDate, search } = req.query;

      let filter = {};

      // Add filters based on query parameters
      if (status) {
        filter.status = status;
      }
      if (brand) {
        filter.brand = brand;
      }
      if (manufacture) {
        filter.marketer = manufacture;
      }


      const medicines = await Medicine.find(filter).sort({ createdAt: -1 });

      const allMedicine = medicines.filter(
        (medicine) => medicine.deleted_at === null
      );

      if (allMedicine.length < 1) {
        return handleResponse(200, "No Medicine data available.", {}, resp);
      }

      for (const medicine of allMedicine) {
        // if (medicine.created_by) {
        //   const createdBy = await User.findOne({
        //     id: medicine.created_by,
        //   });
        //   medicine.created_by = createdBy;
        // }
        if (medicine.brand) {
          const brand = await Brand.findOne({ id: medicine.brand });
          medicine.brand = brand && brand.status === true ? brand : null;
        }
        if (medicine.marketer) {
          const marketer = await Marketer.findOne({
            id: medicine.marketer,
          });
          medicine.marketer = marketer && marketer.status === true ? marketer : null;
        }

        if (medicine.uses) {
          const marketer = await Uses.findOne({
            id: medicine.uses,
          });
          medicine.uses = marketer;
        }

        if (medicine.form) {
          const marketer = await Form.findOne({
            id: medicine.form,
          });
          medicine.form = marketer;
        }

        if (medicine.tags && Array.isArray(medicine.tags)) {
          medicine.tags = await Promise.all(
            medicine.tags.map(async (tagsId) => {
              const tagsData = await Tags.findOne({ id: tagsId });
              return tagsData;
            })
          );
        }
        if (medicine.category && Array.isArray(medicine.category)) {
          const categoryData = await Promise.all(
            medicine.category.map(async (categoryId) => {
              const category = await Category.findOne({ id: categoryId });
              return category && category.status === true ? category : null;
            })
          );

          medicine.category = categoryData.filter((category) => category !== null);
        }

        if (medicine.substitute_product && Array.isArray(medicine.substitute_product)) {
          const medicineData = await Promise.all(
            medicine.substitute_product.map(async (medicineId) => {
              const medicine = await Medicine.findOne({
                id: medicineId,
              });
              return medicine && medicine.status === "active" ? medicine : null;
            })
          );
          medicine.substitute_product = medicineData.filter(medicine => medicine !== null);
        }
        if (medicine.linked_items && Array.isArray(medicine.linked_items)) {
          const linkedItemsData = await Promise.all(
            medicine.linked_items.map(async (linkedItemId) => {
              const linkedItem = await Medicine.findOne({
                id: linkedItemId,
              });
              return linkedItem && linkedItem.status === "active" ? linkedItem : null;
            })
          );
          medicine.linked_items = linkedItemsData.filter(item => item !== null);
        }
      }


      const filteredMedicine = allMedicine.filter((user) => {
        let matches = true;

        if (search) {
          const searchRegex = new RegExp(search, "i");
          matches = matches && (
            searchRegex.test(user.product_name) ||
            searchRegex.test(user.brand) ||
            searchRegex.test(user.marketer) ||
            searchRegex.test(user.status)
          );
        }

        if (fromDate && toDate) {
          const createdAt = moment(user.createdAt, "YYYY-MM-DD");
          const from = moment(fromDate, "YYYY-MM-DD").startOf("day");
          const to = moment(toDate, "YYYY-MM-DD").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });





      return handleResponse(
        200,
        "Medicine fetched successfully",
        { filteredMedicine },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get medicine id
  static GetMedicineID = async (req, resp) => {
    try {
      const { id } = req.params;
      const medicine = await Medicine.findOne({ id });
      if (!medicine) {
        return handleResponse(404, "Medicine not found", {}, resp);
      }

      if (medicine.created_by) {
        const createdBy = await User.findOne({
          id: medicine.created_by,
        });
        medicine.created_by = createdBy;
      }
      if (medicine.brand) {
        const brand = await Brand.findOne({ id: medicine.brand });
        medicine.brand = brand && brand.status === true ? brand : null;
      }
      if (medicine.marketer) {
        const marketer = await Marketer.findOne({
          id: medicine.marketer,
        });
        medicine.marketer = marketer && marketer.status === true ? marketer : null;
      }

      if (medicine.uses) {
        const marketer = await Uses.findOne({
          id: medicine.uses,
        });
        medicine.uses = marketer;
      }


      if (medicine.form) {
        const marketer = await Form.findOne({
          id: medicine.form,
        });
        medicine.form = marketer;
      }

      if (medicine.tags && Array.isArray(medicine.tags)) {
        medicine.tags = await Promise.all(
          medicine.tags.map(async (tagsId) => {
            const tagsData = await Tags.findOne({ id: tagsId });
            return tagsData;
          })
        );
      }
      if (medicine.substitute_product && Array.isArray(medicine.substitute_product)) {
        medicine.substitute_product = await Promise.all(
          medicine.substitute_product.map(async (medicineId) => {
            const medicineData = await Medicine.findOne({ id: medicineId });
            return medicineData && medicineData.status === "active" ? medicineData : null;
          })
        );

        medicine.substitute_product = medicine.substitute_product.filter(item => item !== null);
      }



      if (medicine.category && Array.isArray(medicine.category)) {
        const categoryData = await Promise.all(
          medicine.category.map(async (categoryId) => {
            const category = await Category.findOne({ id: Number(categoryId) });
            return category && category.status === true ? category : null;
          })
        );
        medicine.category = categoryData.filter(category => category !== null);
      }

      if (medicine.linked_items && Array.isArray(medicine.linked_items)) {
        const linkedItemsData = await Promise.all(
          medicine.linked_items.map(async (linkedItemId) => {
            const linkedItem = await Medicine.findOne({
              id: linkedItemId,
            });
            return linkedItem && linkedItem.status === "active" ? linkedItem : null;
          })
        );
        medicine.linked_items = linkedItemsData.filter(item => item !== null);
      }

      return handleResponse(
        200,
        "Medicine fetched successfully",
        { medicine },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //delete medicine
  static DeleteMedicine = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const medicine = await Medicine.findOne({ id });
      if (!medicine) {
        return handleResponse(404, "Medicine not found", {}, resp);
      }
      if (medicine.deleted_at !== null) {
        await Medicine.findOneAndDelete({ id });

        if (medicine.has_variant) {
          await InventoryWithVarient.deleteMany({ modelType: "Medicine", modelId: id })
        } else {
          await InvertoryWithoutVarient.deleteMany({ itemType: "Medicine", itemId: id })
        }

        await Review.deleteMany({ modelType: "Medicine", product: id })

        return handleResponse(200, "Medicine deleted successfully", {}, resp);

      } else {
        return handleResponse(
          400,
          "For deleting this medicine you have to add it to the trash first.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // soft delete
  static SoftDeleteMedicine = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const medicine = await Medicine.findOne({ id });
      if (!medicine) {
        return handleResponse(404, "Medicine not found", {}, resp);
      }
      if (medicine.deleted_at === null) {
        medicine.deleted_at = new Date();
        await medicine.save();
        return handleResponse(
          200,
          "Medicine added to trash.",
          { medicine },
          resp
        );
      } else {
        return handleResponse(
          400,
          "Medicine already added to trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get medicine trash
  static GetMedicineTrash = async (req, resp) => {
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

      if (status) {
        baseQuery.status = { $regex: status, $options: "i" };
      }

      const medicines = await Medicine.find(baseQuery);

      if (!medicines || medicines.length === 0) {
        return handleResponse(200, "No medicine data available.", {}, resp);
      }

      const trashMedicine = medicines.filter(
        (medicine) => medicine.deleted_at !== null
      );

      if (trashMedicine.length === 0) {
        return handleResponse(200, "No medicine data in trash.", {}, resp);
      }

      for (const key of trashMedicine) {
        if (key.marketer) {
          const marketerData = await Marketer.findOne({ id: key.marketer })
          key.marketer = marketerData
        }
        if (key.brand) {
          const brandData = await Brand.findOne({ id: key.brand })
          key.brand = brandData
        }
      }

      return handleResponse(
        200,
        "Medicine fetched successfully",
        { trashMedicine },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore trash
  static RestoreMedicine = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const medicine = await Medicine.findOne({ id });

      if (!medicine) {
        return handleResponse(404, "Medicine not found", {}, resp);
      }

      if (medicine.deleted_at !== null) {
        medicine.deleted_at = null;
        await medicine.save();
        return handleResponse(
          200,
          "Medicine restored successfully..",
          { medicine },
          resp
        );
      } else {
        return handleResponse(400, "Medicine already restored.", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //import medicine
  static ImportMedicineCSV = async (req, resp) => {
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

      if (!fs.existsSync(filePath)) {
        return handleResponse(400, "File does not exist", {}, resp);
      }

      // const staticDir = path.join(
      //   __dirname,
      //   "..",
      //   "..",
      //   "public",
      //   "medicine",
      //   "images"
      // );
      // const baseUrl = `${req.protocol}://${req.get(
      //   "host"
      // )}/api/public/medicine/images`;

      const medicineData = [];

      const csvData = await csvtojson().fromFile(filePath);

      const filteredData = csvData.filter(item => {
        return Object.values(item).some(value => value.trim() !== "");
      });

      for (const item of filteredData) {
        const existingMedicine = await Medicine.findOne({
          product_name: item.Product,
        });
        if (existingMedicine) {
          return handleResponse(
            409,
            `Medicine ${item.Product} already exists, skipping...`,
            {},
            resp
          );
        }

        const tags = item.Tags ? item.Tags.split(",") : [];
        const tagIds = [];
        for (const tag of tags) {
          const existingTag = await Tags.findOne({ name: tag });
          if (!existingTag) {
            const newTag = new Tags({ name: tag, created_by: user.id });
            const savedTag = await newTag.save();
            tagIds.push(savedTag.id);
          } else {
            tagIds.push(existingTag.id);
          }
        }


        const categoryData = item?.category ? item?.category.split(",").map(category => category.trim()) : [];
        let categoryId = [];
        let newCategoryData = [];

        for (const category of categoryData) {
          const trimmedCategory = category.trim().toLowerCase();
          const slug = trimmedCategory.replace(/\s+/g, '-');

          const existingCategory = await Category.findOne({ category_name: trimmedCategory });
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


        const customId = await getNextSequenceValue("Medicine");


        let moreDetails = [];
        if (item.MoreDetails) {
          try {
            let cleanedJsonString = item.MoreDetails;
            if (
              cleanedJsonString.startsWith('"') &&
              cleanedJsonString.endsWith('"')
            ) {
              cleanedJsonString = cleanedJsonString.slice(1, -1);
            }
            cleanedJsonString = cleanedJsonString.replace(/""/g, '"');
            moreDetails = JSON.parse(cleanedJsonString);
          } catch (err) {
            console.error("Invalid JSON in MoreDetails:", item.MoreDetails);
            throw err;
          }
        }

        let linkedItems = [];
        if (item.LinkedItems) {
          linkedItems = item.LinkedItems.split(",")
            .map((num) => Number(num.trim()))
            .filter((n) => !isNaN(n));
        }



        medicineData.push({
          id: customId,
          product_name: item["Product Name"],
          featured_image: item["Featured Image"],
          status: item["Status"],
          slug: item["Slug"],
          gallery_image: item["Gallery Image"],
          hsn_code: item["HSN Code"],
          category: categoryId,
          has_variant: convertToBoolean(item["Has Variant"]),
          storage: item["Storage"],
          marketer: Number(item["Marketer"]),
          brand: Number(item["Brand"]),
          indication: item["Indication"],
          composition: item["Composition"],
          generic_name: item["Generic Name"],
          weight: item["Weight"],
          more_details: moreDetails,
          length: item["Length"],
          width: item["Width"],
          height: item["Height"],
          form: item["Form"],
          prescription_required: convertToBoolean(item["Prescription Required"]),
          packOf: item["Pack Of"],
          tags: tagIds,
          short_description: item["Short Description"],
          minimum_order_quantity: item["Minimum Order Quantity"],
          linked_items: item["Linked Items"].split(","),
          meta_title: item["Meta Title"],
          meta_description: item["Meta Description"],
          strength: item["Strength"],
          meta_keywords: item["Meta Keywords"],
          og_tag: item["OG Tag"],
          schema_markup: item["Schema Markup"],
          type: item["Type"],
          created_by: user.id,
          uses: item["Uses"],
          age: item["Age"].split(","),
          substitute_product: item["Substitute Product"].split(","),
          isEnquired: item["isEnquired"]

        });
      }

      await Medicine.insertMany(medicineData);

      return handleResponse(
        201,
        "Products imported successfully",
        { data: medicineData },
        resp
      );
    } catch (err) {
      console.error("Error occurred:", err);
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

  //export medicine data
  static ExportMedicineCSV = async (req, resp) => {
    try {
      const medicine = await Medicine.find();

      if (medicine.length == 0) {
        return handleResponse(200, "No medicines available", {}, resp);
      }

      // export medicine
      const csvStream = format({
        headers: [
          "Product Name",
          "Featured Image",
          "Status",
          "Slug",
          "Gallery Image",
          "HSN Code",
          "Category",
          "Has Variant",
          "Storage",
          "Marketer",
          "Brand",
          "Indication",
          "Composition",
          "Generic Name",
          "Weight",
          "More Details",
          "Length",
          "Width",
          "Height",
          "Form",
          "Prescription Required",
          "Pack Of",
          "Tags",
          "Short Description",
          "Minimum Order Quantity",
          "Linked Items",
          "Meta Title",
          "Meta Description",
          "Meta Keywords",
          "OG Tag",
          "Schema Markup",
          "Type",
          "Created By",
          "Created At",
          "Updated At",
          "Deleted At",
          "Strength",
          "Uses",
          "Age",
          "Substitute Product",
          "Type",
          "isEnquired"
        ],
      });

      const writableStream = fs.createWriteStream("Medicine.csv");
      writableStream.on("finish", () => {
        resp.download("Medicine.csv", "Medicine.csv", (err) => {
          if (err) {
            return handleResponse(
              400,
              "Eror downloading Medicine.csv",
              {},
              resp
            );
          }
        });
      });

      csvStream.pipe(writableStream);
      medicine.forEach((medicine) => {
        csvStream.write({
          "Product Name": medicine.product_name,
          "Featured Image": medicine.featured_image,
          Status: medicine.status,
          Slug: medicine.slug,
          "Gallery Image": medicine.gallery_image,
          "HSN Code": medicine.hsn_code,
          Category: medicine.category,
          "Has Variant": medicine.has_variant,
          Marketer: medicine.marketer,
          Brand: medicine.brand,
          Storage: medicine.storage,
          "Prescription Required": medicine.prescription_required,
          Indication: medicine.indication,
          Composition: medicine.composition,
          "Generic Name": medicine.generic_name,
          Weight: medicine.weight,
          Length: medicine.length,
          Width: medicine.width,
          Height: medicine.height,
          Form: medicine.form,
          "Pack Of": medicine.packOf,
          Tags: medicine.tags,
          "Short Description": medicine.short_description,
          "Minimum Order Quantity": medicine.minimum_order_quantity,
          "Linked Items ": medicine.linked_items,
          "Meta Title": medicine.meta_title,
          "Meta Description": medicine.meta_description,
          "Meta Keywords": medicine.meta_keywords,
          "OG Tag": medicine.og_tag,
          "Schema Markup": medicine.schema_markup,
          "More Details": medicine.more_details,
          Type: medicine.type,
          "Created By": medicine.created_by,
          "Created At": moment(medicine.createdAt).format("YYYY-MM-DD"),
          "Updated At": moment(medicine.updatedAt).format("YYYY-MM-DD"),
          "Deleted At": medicine.deleted_at
            ? moment(medicine.deleted_at).format("YYYY-MM-DD")
            : null,
          "Strength": medicine.strength,
          "Uses": medicine.uses,
          "Age": medicine.age.join(","),
          "Substitute Product": medicine.substitute_product.join(","),
          "Type": medicine.type,
          "isEnquired": medicine.isEnquired
        });
      });
      csvStream.end();
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };


  static GetMedicineWithInventory = async (req, resp) => {
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
      const products = await Medicine.find(filter).sort({ createdAt: -1 });
      // const allProducts = products.filter(product => product.deleted_at === null);

      if (products.length === 0) {
        return handleResponse(200, "No products available", {}, resp);
      }

      // Fetch IDs of products in InventoryWithVarient and InventoryWithoutVarient
      const inventoryWithVariantIds = await InventoryWithVarient.distinct('modelId', { modelType: "Medicine" });
      const inventoryWithoutVariantIds = await InvertoryWithoutVarient.distinct('itemId', { itemType: "Medicine" });


      const validProductIds = new Set([
        ...inventoryWithVariantIds,
        ...inventoryWithoutVariantIds
      ]);


      let filteredProducts = products.filter(product => validProductIds.has(product.id));

      for (const medicine of filteredProducts) {
        if (medicine.brand) {
          const brand = await Brand.findOne({ id: medicine.brand });
          medicine.brand = brand && brand.status === true ? brand : null;
        }
        if (medicine.marketer) {
          const marketer = await Marketer.findOne({
            id: medicine.marketer,
          });
          medicine.marketer = marketer && marketer.status === true ? marketer : null;
        }

        if (medicine.uses) {
          const marketer = await Uses.findOne({
            id: medicine.uses,
          });
          medicine.uses = marketer;
        }

        if (medicine.form) {
          const marketer = await Form.findOne({
            id: medicine.form,
          });
          medicine.form = marketer;
        }

        if (medicine.tags && Array.isArray(medicine.tags)) {
          medicine.tags = await Promise.all(
            medicine.tags.map(async (tagsId) => {
              const tagsData = await Tags.findOne({ id: tagsId });
              return tagsData;
            })
          );
        }
        if (medicine.category && Array.isArray(medicine.category)) {
          const categoryData = await Promise.all(
            medicine.category.map(async (categoryId) => {
              const category = await Category.findOne({ id: categoryId });
              return category && category.status === true ? category : null;
            })
          );

          medicine.category = categoryData.filter((category) => category !== null);
        }

        if (medicine.substitute_product && Array.isArray(medicine.substitute_product)) {
          const medicineData = await Promise.all(
            medicine.substitute_product.map(async (medicineId) => {
              const medicine = await Medicine.findOne({
                id: medicineId,
              });
              return medicine && medicine.status === "active" ? medicine : null;
            })
          );
          medicine.substitute_product = medicineData.filter(medicine => medicine !== null);
        }
        if (medicine.linked_items && Array.isArray(medicine.linked_items)) {
          const linkedItemsData = await Promise.all(
            medicine.linked_items.map(async (linkedItemId) => {
              const linkedItem = await Medicine.findOne({
                id: linkedItemId,
              });
              return linkedItem && linkedItem.status === "active" ? linkedItem : null;
            })
          );
          medicine.linked_items = linkedItemsData.filter(item => item !== null);
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

      const filteredMedicine = filteredProducts.filter(product => {
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
        { filteredMedicine },
        resp
      );
    } catch (err) {
      console.log("err", err);
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default MedicineController;
