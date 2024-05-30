import Carrier from "../../src/models/adminModel/CarrierModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class CarrierController {
  //add
  static AddCarrier = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { logo, ...carrierData } = req.body;
      const images = req.files;

      const existingCarrier = await Carrier.findOne({ name: carrierData.name });
      if (existingCarrier) {
        return handleResponse(400, "Carrier already exists", {}, resp);
      }

      const newCarrier = new Carrier({
        ...carrierData,
        created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}/api`;
      if (images) {
        if (images.logo) {
          newCarrier.logo = `${base_url}/${images.logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
      }

      await newCarrier.save();
      return handleResponse(
        200,
        "Carrier added successfully.",
        newCarrier,
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

  //get
  static GetCarrier = async (req, resp) => {
    try {
      const carriers = await Carrier.find().sort({
        createdAt: -1,
      });
      const getCarrier = await carriers.filter(
        (carrier) => carrier.deleted_at === null
      );

      if (getCarrier.length == 0) {
        return handleResponse(200, "No Carrier available.", {}, resp);
      }

      for (const key of getCarrier) {
        if (key.created_by) {
          const createdBy = await User.findOne({ id: key.created_by });
          key.created_by = createdBy;
        }
      }
      return handleResponse(
        200,
        "Carriers fetched successfully.",
        getCarrier,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get id
  static GetCarrierID = async (req, resp) => {
    try {
      const { id } = req.params;
      const carriers = await Carrier.findOne({ id });

      if (!carriers) {
        return handleResponse(404, "Carrier not found.", {}, resp);
      }

      if (carriers.created_by) {
        const createdBy = await User.findOne({ id: carriers.created_by });
        carriers.created_by = createdBy;
      }

      return handleResponse(
        200,
        "Carriers fetched successfully.",
        carriers,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //update
  static async UpdateCarrier(req, resp) {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }
      const { id } = req.params;
      const { logo, ...carrierData } = req.body;
      const images = req.files;

      const carrier = await Carrier.findOne({ id });
      if (!carrier) {
        return handleResponse(404, "Carrier not found", {}, resp);
      }

      const existingCarrier = await Carrier.findOne({
        name: carrierData.name,
        id: { $ne: id },
      });
      if (existingCarrier) {
        return handleResponse(409, "Carrier already exists", {}, resp);
      }

      for (const key in carrierData) {
        if (Object.hasOwnProperty.call(carrierData, key)) {
          carrier[key] = carrierData[key];
        }
      }

      const base_url = `${req.protocol}://${req.get("host")}/api`;
      if (images) {
        if (images.logo) {
          carrier.logo = `${base_url}/${images.logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
      }
      await carrier.save();

      return handleResponse(
        200,
        "Carrier updated successfully.",
        carrier,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  }

  //soft delete
  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const carrier = await Carrier.findOne({ id });
      if (!carrier) {
        return handleResponse(404, "Carrier not found", {}, resp);
      }

      if (carrier.deleted_at !== null) {
        return handleResponse(400, "Carrier already added to trash.", {}, resp);
      }

      const softDeleted = await Carrier.findOneAndUpdate(
        { id },
        { deleted_at: new Date() }
      );
      await softDeleted.save();
      return handleResponse(200, "Carrier added to trash.", softDeleted, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore
  static Restore = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const carrier = await Carrier.findOne({ id });
      if (!carrier) {
        return handleResponse(404, "Carrier not found", {}, resp);
      }

      if (carrier.deleted_at === null) {
        return handleResponse(400, "Carrier already restored.", {}, resp);
      }

      const softDeleted = await Carrier.findOneAndUpdate(
        { id },
        { deleted_at: null }
      );
      await softDeleted.save();
      return handleResponse(
        200,
        "Carrier successfully restored.",
        softDeleted,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get-trash
  static GetTrash = async (req, resp) => {
    try {
      const carriers = await Carrier.find().sort({
        createdAt: -1,
      });
      const getCarrier = await carriers.filter(
        (carrier) => carrier.deleted_at !== null
      );

      if (getCarrier.length == 0) {
        return handleResponse(200, "No Carrier available in trash.", {}, resp);
      }

      for (const key of getCarrier) {
        if (key.created_by) {
          const createdBy = await User.findOne({ id: key.created_by });
          key.created_by = createdBy;
        }
      }
      return handleResponse(
        200,
        "Carrier trash fetched successfully.",
        getCarrier,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //delete trash
  static DeleteTrash = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const carrier = await Carrier.findOne({ id });
      if (!carrier) {
        return handleResponse(404, "Carrier not found", {}, resp);
      }

      if (carrier.deleted_at === null) {
        return handleResponse(
          400,
          "Add carrier to trash for deleting it.",
          {},
          resp
        );
      }
      await Carrier.findOneAndDelete({ id });
      return handleResponse(
        200,
        "Carrier successfully deleted from trash.",
        {},
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default CarrierController;
