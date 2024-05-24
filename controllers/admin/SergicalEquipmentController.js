import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";

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
      const { createdAt, status } = req.query;
      let baseQuery = {};

      if (createdAt) {
        baseQuery.createdAt = { $gte: new Date(createdAt) };
      }
      if (status !== undefined) {
        const statusBoolean = status === "true";
        baseQuery.status = statusBoolean;
      }

      const allEquipment = await Sergical_Equipment.find(baseQuery).sort({
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
}

export default SergicalEquipmentController;
