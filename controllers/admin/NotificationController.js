import handleResponse from "../../config/http-response.js";
import Notifications from "../../src/models/adminModel/Notification.js";

class Notification {
  static addNotification = async (req, resp) => {
    try {
      if (req.body.to) {
        const ids = req.body.to;

        const newReview = new Notifications({
          to: ids,
          title: req.body.title,
          url: req.body.url,
          order_id: req.body.order_id,
          content: req.body.content,
          schedule: req.body.schedule,
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

  static getAllNotification = async (req, res) => {
    try {
      const allField = await Notifications.find().sort({ id: -1 });
      const fields = allField.filter(
        (category) => category.deleted_at === null
      );

      const allData = [];

      fields.forEach((field) => {
        const newDOB = new Date(field.createdAt).toISOString().split("T")[0];

        const passUserData = {
          _id: field._id,
          title: field.title,
          order_id: field.order_id,
          content: field.content,
          status: field.status,
          created_at: field.createdAt,
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

  static getSingleNotification = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const field = await Notifications.findOne({ id: id });

      if (!field) {
        handleResponse(404, "Not Found", {}, res);
      }

      handleResponse(200, "Notification fetched Successfully", field, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateNotification = async (req, res) => {
    try {
      if (req.body.to) {
        const field = await Notifications.findOne({ id: req.params.id });

        if (!field) {
          handleResponse(404, "Not Found", {}, res);
        }

        const ids = req.body.to;
        field.to = ids;
        field.title = req.body.title;
        field.order_id = req.body.order_id;
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

  static allSoftDeleteNotification = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const category = await Notifications.find();

      const deletedCategory = category.filter(
        (category) => category.deleted_at !== null
      );

      const allData = [];

      deletedCategory.forEach((field) => {
        const newDOB = new Date(field.createdAt).toISOString().split("T")[0];

        const passUserData = {
          _id: field._id,
          title: field.title,
          order_id: field.order_id,
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
        "data fetch successfully",
        deletedCategory,
        resp
      );
    } catch (err) {
      return 500, err.message, {}, resp;
    }
  };

  static SoftDeleteNotification = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await Notifications.findOne({ id });
      if (!category) {
        return handleResponse(404, "Field not found", {}, resp);
      }

      if (!category.deleted_at) {
        category.deleted_at = new Date();
        await category.save();
      } else {
        return handleResponse(400, "data already added to trash.", {}, resp);
      }

      return handleResponse(200, "data added to trash", category, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static restoreNotification = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await Notifications.findOne({
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

  static deleteNotification = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await Notifications.findOne({ id });

      if (!category) {
        return handleResponse(404, "Data not found.", {}, resp);
      }

      if (category.deleted_at !== null) {
        await Notifications.findOneAndDelete({ id });

        handleResponse(200, "Data deleted successfully.", {}, resp);
      } else {
        return handleResponse(
          400,
          "For deleting this data you have to add it to the trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default Notification;
