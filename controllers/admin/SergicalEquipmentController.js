import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";

const deepMerge = (target, source) => {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
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
      const equipment = await Sergical_Equipment.find({
        delete_at: null,
      }).sort({
        createdAt: -1,
      });

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

      deepMerge(equipment, equipmentData);

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
      const equipmemnt = await Sergical_Equipment.find().sort({
        createdAt: -1,
      });

      // if (!equipmemnt) {
      //   return handleResponse(404, "No equipment available", {}, resp);
      // }

      const trash = await equipmemnt.filter(
        (equipmemnt) => equipmemnt.delete_at !== null
      );

      if (trash.length == 0) {
        return handleResponse(404, "No equipment available", {}, resp);
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
}

export default SergicalEquipmentController;
