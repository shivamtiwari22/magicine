import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import handleResponse from "../../config/http-response.js";

class MarketerController {
  // add manufacturer
  static AddMarketer = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const manufacturerData = req.body;

      const existingManufacturer = await Marketer.findOne({
        manufacturer_name: manufacturerData.manufacturer_name,
      });

      if (existingManufacturer) {
        return handleResponse(
          409,
          "This manufacturer already exists.",
          {},
          resp
        );
      }

      const newManufacturer = new Marketer({
        ...manufacturerData,
        created_by: user.id,
      });

      await newManufacturer.save();
      return handleResponse(
        201,
        "Manufacturer created.",
        { newManufacturer },
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

  //   update manufacturer
  static UpdateMarketer = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }
      const { id } = req.params;
      const manufacturerData = req.body;

      const manufacturer = await Marketer.findOne({ id });
      console.log("manufacturere", manufacturer);

      if (!manufacturer) {
        return handleResponse(404, "Manufacturer not found.", {}, resp);
      }

      const existingManufacturer = await Marketer.findOne({
        manufacturer_name: manufacturerData.manufacturer_name,
      });

      if (existingManufacturer) {
        return handleResponse(409, "This Marketer already exists.", {}, resp);
      }

      for (const key in manufacturerData) {
        if (Object.hasOwnProperty.call(manufacturerData, key)) {
          manufacturer[key] = manufacturerData[key];
        }
      }

      await manufacturer.save();
      return handleResponse(
        200,
        "Tag updated successfully",
        { manufacturer },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static DeleteMarketer = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const marketer = await Marketer.findOne({ id });

      if (!marketer) {
        return handleResponse(404, "Marketer not found.", {}, resp);
      }

      if (marketer.deleted_at !== null) {
        await Marketer.findOneAndDelete({ id });
        return handleResponse(200, "Marketer deleted successfully.", {}, resp);
      } else {
        return handleResponse(
          400,
          "This marketer is not marked for deletion.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get marketer
  static GetMarketer = async (req, resp) => {
    try {
      const manufacturer = await Marketer.find().sort({
        createdAt: -1,
      });
      const getmanufacturer = manufacturer.filter(
        (manufacturer) => manufacturer.deleted_at === null
      );
      return handleResponse(
        200,
        "Manufacturer fetched successfully.",
        { manufacturer: getmanufacturer },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //Soft delete
  static SoftDeleteMarketer = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const manufacturer = await Marketer.findOne({ id });

      if (!manufacturer) {
        return handleResponse(404, "Manufacturer not found.", {}, resp);
      }

      const isDeleted = manufacturer.deleted_at;

      if (isDeleted !== null) {
        return handleResponse(
          409,
          "This manufacturer already added to trash..",
          {},
          resp
        );
      }

      const softDeleted = await Marketer.findOneAndUpdate(
        { id },
        { deleted_at: new Date() }
      );

      return handleResponse(
        200,
        "Manufacturer deleted successfully.",
        { softDeleted },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get soft deleted Manufacturer
  static GetSoftDeleted = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }
      const trash = await Marketer.find();
      const getDeleted = await trash.filter(
        (trash) => trash.deleted_at !== null
      );

      return handleResponse(
        200,
        "Manufacturer fetched successfully.",
        { getDeleted },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore soft deleted Manufacturer
  static RestoreSoftDeleteMarketer = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const manufacturer = await Marketer.findOne({ id });

      if (!manufacturer) {
        return handleResponse(404, "Manufacturer not found.", {}, resp);
      }

      if (Marketer.deleted_at === null) {
        return handleResponse(
          409,
          "This manufacturer already restored",
          {},
          resp
        );
      }

      const softDeleted = await Marketer.findOneAndUpdate(
        { id },
        { deleted_at: null }
      );

      return handleResponse(
        200,
        "Manufacturer deleted successfully.",
        { softDeleted },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get marketer id

  static GetMarketerId = async (req, resp) => {
    try {
      const { id } = req.params;

      const marketer = await Marketer.findOne({ id }).sort({
        createdAt: -1,
      });

      if (!marketer) {
        return handleResponse(404, "Marketer not found.", {}, resp);
      }

      return handleResponse(
        200,
        "Manufacturer fetched successfully.",
        { marketer },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default MarketerController;
