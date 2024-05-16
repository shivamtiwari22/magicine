import Medicine from "../../src/models/adminModel/MedicineModel.js";
import handleResponse from "../../config/http-response.js";

class MedicineController {
  //add medicine
  static AddMedicine = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const images = req.files;
      const { gallery_image, featured_image, ...medicineData } = req.body;

      const existingMedicine = await Medicine.findOne({
        product_name: medicineData.product_name,
      });

      if (existingMedicine) {
        return handleResponse(409, "Medicine already exists", {}, resp);
      }

      const newMedicineData = {
        ...medicineData,
        created_by: user.id,
      };

      if (images && images.featured_image) {
        newMedicineData.featured_image = images.featured_image[0].path;
      }

      if (images && images.gallery_image) {
        newMedicineData.gallery_image = images.gallery_image.map(
          (item) => item.path
        );
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

      const { featured_image, gallery_image, ...medicineData } = req.body;
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

      if (images && images.featured_image) {
        medicine.featured_image = images.featured_image[0].path;
      }
      if (images && images.gallery_image) {
        medicine.gallery_image = images.gallery_image.map((item) => item.path);
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
      const medicine = await Medicine.find().sort({ createdAt: -1 });
      const allMedicine = await medicine.filter(
        (medicine) => medicine.deleted_at === null
      );

      if (allMedicine.length < 1) {
        return handleResponse(200, "No Medicine data available.", {}, resp);
      }
      return handleResponse(
        200,
        "Medicine fetched successfully",
        { allMedicine },
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
      const medicine = await Medicine.find();
      if (!medicine) {
        return handleResponse(200, "No medicine data available.", {}, resp);
      }
      const trashMedicine = await medicine.filter(
        (medicine) => medicine.deleted_at !== null
      );

      if (trashMedicine.length < 1) {
        return handleResponse(200, "No medicine data in trash.", {}, resp);
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
          400,
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
}

export default MedicineController;
