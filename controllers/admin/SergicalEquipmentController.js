import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import { get } from "mongoose";
import { ReturnDocument } from "mongodb";

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
        ...equipmentData,
        created_by: user.id,
      });
      const base_url = `${req.protocol}://${req.get("host")}/api`;
      if (images) {
        if (images && images.featured_image) {
          newEquipment.featured_image = `${base_url}/${images.featured_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.gallery_image) {
          newEquipment.gallery_image = images.gallery_image.map(
            (item) => `${base_url}/${item.path.replace(/\\/g, "/")}`
          );
        }
      }

      await newEquipment.save();
      return handleResponse(201, "Equipment created", newEquipment, resp);
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
      const equipmemnt = await Sergical_Equipment.find({
        delete_at: null,
      }).sort({
        createdAt: -1,
      });

      if (equipmemnt.length == 0) {
        return handleResponse(404, "No equipment available", {}, resp);
      }

      for (const getEquipment in equipmemnt) {
        if (getEquipment.created_by) {
          const createdBy = await User.findOne({
            id: getEquipment.created_by,
          });
          getEquipment.created_by = createdBy;
        }
        if (getEquipment.marketer) {
          const GetMarketer = await Marketer.findOne({
            id: getEquipment.marketer,
          });
          getEquipment.marketer = GetMarketer;
        }
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

  // update equipment
  static UpdateSergicalEquipment = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const images = req.files;
      const { featured_image, gallery_image, ...equipmentData } = req.body;

      const equipment = await Sergical_Equipment.findOne({ id });
      if (!equipment) {
        return handleResponse(404, "Equipment not found", {}, resp);
      }
      const existingEquipment = await Marketer.findOne({
        product_name: equipmentData.product_name,
        id: { $ne: id },
      });

      if (existingEquipment) {
        return handleResponse(409, "Equipment already exists", {}, resp);
      }

      for (const key in equipmentData) {
        if (Object.hasOwnProperty.call(equipmentData, key)) {
          existingEquipment[key] = equipmentData[key];
        }
      }

      const base_url = `${req.protocol}://${req.get("host")}/api`;

      if (images && images.featured_image && images.featured_image.length > 0) {
        existingEquipment.featured_image = `${base_url}/${images.featured_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }

      if (images && images.gallery_image && images.gallery_image.length > 0) {
        existingEquipment.gallery_image = images.gallery_image.map(
          (item) => `${base_url}/${item.path.replace(/\\/g, "/")}`
        );
      }

      await existingEquipment.save();
      return handleResponse(200, "Equipment updated", existingEquipment, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default SergicalEquipmentController;
