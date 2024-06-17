import handleResponse from "../../config/http-response.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import CustomFiled from "../../src/models/adminModel/CustomField.js";
import CustomFiledValue from "../../src/models/adminModel/CustomFieldValue.js";

class CustomField {
  static addCustom = async (req, res) => {
    try {
      const { attribute_name, attribute_type, list_order, category_id } =
        req.body;

      

      if (
        attribute_name &&
        attribute_type &&
        list_order &&
        Array.isArray(category_id)
      ) {
        const doc = new CustomField({
          attribute_type: attribute_type,
          attribute_name: attribute_name,
          list_order: list_order,
          category_id: category_id,
          created_by: req.user._id,
        });


        
        await doc.save();
        handleResponse(201, "Created Successfully", doc, res);
      } else {
        handleResponse(
          400,
          "All fields are required and category_id must be an array",
          {},
          res
        );
      }
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
          res
        );
      } else {
        console.log(err);
        return handleResponse(500, err.message, {}, res);
      }
    }
  };

  static getAllFields = async (req, res) => {
    try {
      const FormatFields = [];
      const allField = await CustomFiled.find().sort({ id: -1 });

      const fields = allField.filter(
        (category) => category.deleted_at === null
      );

      const categoryIds = fields.reduce(
        (acc, curr) => acc.concat(curr.category_id),
        []
      );

      const categories = await Category.find({ id: { $in: categoryIds } });

      const categoryMap = categories.reduce((map, category) => {
        map[category.id] = category.category_name;
        return map;
      }, {});

      fields.forEach((field) => {
        const categoryNames = field.category_id
          .map((id) => categoryMap[id])
          .join(", ");

        const passUserData = {
          _id: field._id,
          attribute_name: field.attribute_name,
          attribute_type: field.attribute_type,
          list_order: field.list_order,
          created_at: field.createdAt,
          category: categoryNames,
          id: field.id,
        };

        FormatFields.push(passUserData);
      });

      handleResponse(200, "all fields fetch", FormatFields, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static getFieldById = async (req, res) => {
    try {
      const field = await CustomFiled.findOne({ id: req.params.id });

      if (!field) {
        handleResponse(404, "Not Found", {}, res);
      }

      handleResponse(200, "field get success", field, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateCustomField = async (req, res) => {
    try {
      const { attribute_name, attribute_type, list_order, category_id } =
        req.body;

      const field = await CustomFiled.findOne({ id: req.params.id });

      if (!field) {
        handleResponse(404, "Not Found", {}, res);
      }

      field.attribute_name = attribute_name;
      field.attribute_type = attribute_type;
      field.list_order = list_order;
      field.category_id = category_id;
      await field.save();
      handleResponse(200, "Updated Successfully", field, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  //delete field
  static deleteField = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await CustomFiled.findOne({ id });

      if (!category) {
        return handleResponse(404, "Field not found.", {}, resp);
      }

      if (category.deleted_at !== null) {
        await CustomFiled.findOneAndDelete({ id });

        handleResponse(200, "Field deleted successfully.", {}, resp);
      } else {
        return handleResponse(
          400,
          "For deleting this field you have to add it to the trash.",
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

      const category = await CustomFiled.findOne({ id });
      if (!category) {
        return handleResponse(404, "Field not found", {}, resp);
      }

      if (!category.deleted_at) {
        category.deleted_at = new Date();
        await category.save();
      } else {
        return handleResponse(400, "Field already added to trash.", {}, resp);
      }

      return handleResponse(200, "field added to trash", category, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get soft deleted
  static getSoftDeleteField = async (req, resp) => {
    try {
      const user = req.user;

      const FormatFields = [];
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const category = await CustomFiled.find();

      const deletedCategory = category.filter(
        (category) => category.deleted_at !== null
      );

      const categoryIds = deletedCategory.reduce(
        (acc, curr) => acc.concat(curr.category_id),
        []
      );

      const categories = await Category.find({ id: { $in: categoryIds } });

      const categoryMap = categories.reduce((map, category) => {
        map[category.id] = category.category_name;
        return map;
      }, {});

      deletedCategory.forEach((field) => {
        const categoryNames = field.category_id
          .map((id) => categoryMap[id])
          .join(", ");

        const passUserData = {
          _id: field._id,
          attribute_name: field.attribute_name,
          attribute_type: field.attribute_type,
          list_order: field.list_order,
          created_at: field.createdAt,
          category: categoryNames,
          id: field.id,
        };

        FormatFields.push(passUserData);
      });

      return handleResponse(
        200,
        "Fetch Field in trash successful",
        FormatFields,
        resp
      );
    } catch (err) {
      return 500, err.message, {}, resp;
    }
  };

  //restore field
  static restoreField = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await CustomFiled.findOne({
        id: id,
      });
      if (!category) {
        return handleResponse(404, "Field not found", {}, resp);
      }

      category.deleted_at = null;

      await category.save();

      return handleResponse(200, "Field restored.", category, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //  here we manage custom field values

  static addCustomValue = async (req, res) => {
    try {
      const { attribute_name, color, list_order, custom_id } = req.body;

      if (attribute_name && list_order && custom_id) {
        const doc = new CustomFiledValue({
          attribute_name: attribute_name,
          list_order: list_order,
          color: color,
          custom_id: custom_id,
          created_by: req.user._id,
        });

        await doc.save();
        handleResponse(201, "Crated Successfully", doc, res);
      } else {
        handleResponse(400, "All fields are required", {}, res);
      }
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
          res
        );
      } else {
        return handleResponse(500, err.message, {}, res);
      }
    }
  };

  static getAllValues = async (req, res) => {
    try {
      const custom = await CustomFiled.findById(req.params.id);

      if (!custom) {
        return handleResponse(404, "Field not found", {}, res);
      }

      const allField = await CustomFiledValue.find({
        custom_id: req.params.id,
      }).sort({ id: -1 });

      const fields = allField.filter(
        (category) => category.deleted_at === null
      );

      handleResponse(
        200,
        "all fields fetch",
        { custom_field: custom, value: fields },
        res
      );
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static getValueById = async (req, res) => {
    try {
      const field = await CustomFiledValue.findOne({ id: req.params.id });

      if (!field) {
        handleResponse(404, "Not Found", {}, res);
      }

      handleResponse(200, "field get success", field, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateValue = async (req, res) => {
    try {
      const { attribute_name, color, list_order } = req.body;

      const field = await CustomFiledValue.findOne({ id: req.params.id });

      if (!field) {
        handleResponse(404, "Not Found", {}, res);
      }

      field.attribute_name = attribute_name;
      field.list_order = list_order;
      field.color = color;
      await field.save();
      handleResponse(200, "Updated Successfully", field, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static getSoftDeleteValue = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const custom = await CustomFiled.findById(req.params.id);

      if (!custom) {
        return handleResponse(404, "Field not found", {}, resp);
      }

      const category = await CustomFiledValue.find({
        custom_id: req.params.id,
      }).sort({ id: -1 });

      const deletedCategory = category.filter(
        (category) => category.deleted_at !== null
      );

      return handleResponse(
        200,
        "Data fetch successful",
        deletedCategory,
        resp
      );
    } catch (err) {
      return 500, err.message, {}, resp;
    }
  };

  static restoreValue = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await CustomFiledValue.findOne({
        id: id,
      });

      if (!category) {
        return handleResponse(404, "Field not found", {}, resp);
      }

      category.deleted_at = null;

      await category.save();

      return handleResponse(200, "value restored.", category, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static SoftDeleteValue = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await CustomFiledValue.findOne({ id });
      if (!category) {
        return handleResponse(404, "Field not found", {}, resp);
      }

      if (!category.deleted_at) {
        category.deleted_at = new Date();
        await category.save();
      } else {
        return handleResponse(400, "Field already added to trash.", {}, resp);
      }

      return handleResponse(200, "field added to trash", category, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static deleteFieldValue = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await CustomFiledValue.findOne({ id });

      if (!category) {
        return handleResponse(404, "Field not found.", {}, resp);
      }

      if (category.deleted_at !== null) {
        await CustomFiledValue.findOneAndDelete({ id });

        handleResponse(200, "Field deleted successfully.", {}, resp);
      } else {
        return handleResponse(
          400,
          "For deleting this field you have to add it to the trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default CustomField;
