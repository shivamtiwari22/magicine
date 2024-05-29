import moment from "moment";
import handleResponse from "../../config/http-response.js";
import PushNotifications from "../../src/models/adminModel/PushNotification.js";
import User from "../../src/models/adminModel/AdminModel.js";

class PushNotification {
  static addPush = async (req, resp) => {
    try {
      if (req.body.to) {
        const ids = req.body.to;

        const newReview = new PushNotifications({
          to: ids,
          type: req.body.type,
          url: req.body.url,
          content: req.body.content,
          schedule: req.body.schedule ? moment(req.body.schedule).format('YYYY-MM-DD HH:mm:ss') : null,
          status: req.body.schedule ? "schedule" : "sent",
          created_by: req.user._id,
        });

        await newReview.save();

        handleResponse(200, "Store Successfully", newReview, resp);
      } else {
        handleResponse(400, "to is required", {}, resp);
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
          resp
        );
      } else {
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };

  static getAllPush = async (req, res) => {
    try {
      const allField = await PushNotifications.find().sort({ id: -1 });
      const fields = allField.filter(
        (category) => category.deleted_at === null
      );

      const allData = [];

      fields.forEach((field) => {
        const newDOB = new Date(field.createdAt).toISOString().split("T")[0];
        const schedule_date = field.schedule ? moment(field.schedule).format("YYYY-MM-DD HH:mm:ss") : "N/A";

        const passUserData = {
          _id: field._id,
          type: field.type,
          content: field.content,
          status: field.status,
          created_at: field.createdAt,
          schedule: schedule_date,
          date: newDOB,
          id: field.id,
        };

        allData.push(passUserData);
      });

      handleResponse(200, "all Notification fetched", allData, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static getSinglePush = async (req, res) => {
    try {
      const { id } = req.params;
      const field = await PushNotifications.findOne({ id: id }).lean();

      if (!field) {
        handleResponse(404, "Not Found", {}, res);
      }

      field.schedule_date = field.schedule ? moment(field.schedule).format("YYYY-MM-DD") : "N/A";
      field.schedule_time = field.schedule ? moment(field.schedule).format("HH:mm:ss") : "N/A";

      const users = await User.find({ id: { $in: field.to } }, 'email id').lean();

      // // Replace `to` field with user data
      field.to = users.map(user => ({ email: user.email, id: user.id }));


      handleResponse(200, "Push Notification fetched Successfully", field, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updatePush = async (req, res) => {
    try {
      if (req.body.to) {
        const field = await PushNotifications.findOne({ id: req.params.id });

        if (!field) {
          handleResponse(404, "Not Found", {}, res);
        }

        const ids = req.body.to;
        field.to = ids;
        field.type = req.body.type;
        field.url = req.body.url;
        field.content = req.body.content;
        field.schedule = req.body.schedule;
        field.status = req.body.schedule ? "schedule" : "sent";
        await field.save();

        handleResponse(200, "Updated Successfully", field, res);
      } else {
        handleResponse(400, "to is required", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static softDeletePush = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const category = await PushNotifications.find();

      const deletedCategory = category.filter(
        (category) => category.deleted_at !== null
      );

      const allData = [];

      deletedCategory.forEach((field) => {
        const newDOB = new Date(field.createdAt).toISOString().split("T")[0];

        const passUserData = {
          _id: field._id,
          type: field.type,
          content: field.content,
          status: field.status,
          created_at: field.createdAt,
          date: newDOB,
          id: field.id,
        };

        allData.push(passUserData);
      });

      return handleResponse(
        200,
        "Fetch Value in trash successful",
        deletedCategory,
        resp
      );
    } catch (err) {
      return 500, err.message, {}, resp;
    }
  };

  static SoftDeletePush = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await PushNotifications.findOne({ id });
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

  static restorePush = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await PushNotifications.findOne({
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

  static deletePush = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await PushNotifications.findOne({ id });

      if (!category) {
        return handleResponse(404, "Field not found.", {}, resp);
      }

      if (category.deleted_at !== null) {
        await PushNotifications.findOneAndDelete({ id });

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

export default PushNotification;
