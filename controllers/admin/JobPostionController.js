import handleResponse from "../../config/http-response.js";
import validateFields from "../../config/validateFields.js";
import Application from "../../src/models/adminModel/ApplicationModel.js";
import path from "path";
import moment from "moment";
import fs from "fs";
import { format } from "@fast-csv/format";
import Position from "../../src/models/adminModel/PositionModel.js";

class JobPositionController {
  static postApplication = async (req, res) => {
    const { name, email, contact_no, position_id } = req.body;

    const requiredFields = [
      { field: "name", value: name },
      { field: "email", value: email },
      { field: "contact_no", value: contact_no },
      { field: "position_id", value: position_id },
    ];

    const validationErrors = validateFields(requiredFields);

    if (validationErrors.length > 0) {
      return handleResponse(
        400,
        "Validation error",
        { errors: validationErrors },
        res
      );
    }

    const resume = req.file ? req.file.path : null;
    try {
      const newContact = new Application({
        name,
        email,
        position_id,
        contact_no,
        resume,
      });

      await newContact.save();

      return handleResponse(
        201,
        "Your Application Submitted Successfully",
        {},
        res
      );
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static allApplications = async (req, res) => {
    try {
      // parse  query parameters
      const { name, email, contact_no, fromDate, toDate } = req.query;

      let app = await Application.find().sort({ id: -1 }).lean();
      let imageName = null;
      for (const item of app) {
        if (item.resume) {
          imageName = path.basename(item.resume);
        }

        const profilePicURL = imageName
          ? `${req.protocol}://${req.get(
            "host"
          )}/api/public/user/resume/${imageName}`
          : null;

        item.resume = profilePicURL;
        item.applied_on = moment(item.createdAt).format("DD-MM-YYYY");

        const position = await Position.findOne({ id: item.position_id });
        if (position) {
          item.job_title = position.title;
        } else {
          item.job_title = "";
        }
      }

      //   apply filter
      const filteredApp = app.filter((user) => {
        let matches = true;

        if (name) matches = matches && new RegExp(name, "i").test(user.name);
        if (email) matches = matches && new RegExp(email, "i").test(user.email);
        if (contact_no)
          matches =
            matches && new RegExp(contact_no, "i").test(user.contact_no);
        if (fromDate && toDate) {
          const createdAt = moment(user.createdAt, "YYYY-MM-DD");
          const from = moment(fromDate, "YYYY-MM-DD").startOf("day");
          const to = moment(toDate, "YYYY-MM-DD").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      return handleResponse(200, "fetched", filteredApp, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static deleteApp = async (req, res) => {
    try {
      const { id } = req.params;
      const zone = await Application.findOne({ id });
      if (!zone) {
        return handleResponse(404, "Application not found.", {}, res);
      }

      await zone.deleteOne();
      handleResponse(200, "Application deleted successfully", {}, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static appCsv = async (req, res) => {
    try {
      const users = await Application.find();

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      const csvStream = format({
        headers: ["Id", "Name", "Email", "Contact Number", "Applied On"],
      });
      const writableStream = fs.createWriteStream("applications.csv");

      writableStream.on("finish", () => {
        res.download("applications.csv", "application.csv", (err) => {
          if (err) {
            console.error("Error downloading file:", err);
            handleResponse(500, err, {}, res);
          }
        });
      });

      csvStream.pipe(writableStream);

      users.forEach((user) => {
        csvStream.write({
          Id: user.id,
          Name: user.name,
          Email: user.email,
          "Contact Number": user.contact_no,
          "Applied On": moment(user.createdAt).format("DD-MM-YYYY"),
        });
      });

      csvStream.end();
    } catch (error) {
      console.error("Error exporting users to CSV:", error);
      handleResponse(500, error.message, {}, res);
    }
  };

  //   Position functions

  static addPosition = async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "Unauthorized", {}, res);
      }

      const { ...jobposition } = req.body;

      const requiredFields = [
        { field: "title", value: jobposition.title },
        { field: "description", value: jobposition.description },
        { field: "location", value: jobposition.location },
        { field: "no_positions", value: jobposition.no_positions },
        { field: "slug", value: jobposition.slug },
      ];

      const validationErrors = validateFields(requiredFields);

      if (validationErrors.length > 0) {
        return handleResponse(
          400,
          "Validation error",
          { errors: validationErrors },
          res
        );
      }

      const existingPositionTitle = await Position.findOne({
        title: jobposition.title,
        id: { $ne: jobposition.id },
      });
      if (existingPositionTitle) {
        return handleResponse(
          409,
          "Position already exists with title",
          {},
          res
        );
      }

      const existingPositionSlug = await Position.findOne({
        slug: jobposition.slug,
        id: { $ne: jobposition.id },
      });
      if (existingPositionSlug) {
        return handleResponse(
          409,
          "Position already exists with this slug",
          {},
          res
        );
      }

      const newContact = new Position({
        ...jobposition,
        created_by: user.id,
      });

      await newContact.save();

      return handleResponse(201, "Position Created Successfully", {}, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static allPosition = async (req, res) => {
    try {
      let app = await Position.find().sort({ id: -1 }).lean();
      return handleResponse(200, "Fetched", app, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static positionById = async (req, res) => {
    let { id } = req.params;

    try {
      let app = await Position.findOne({ id });
      if (!app) {
        return handleResponse(404, "Application not found.", {}, res);
      }

      return handleResponse(200, "Fetched", app, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static deletePosition = async (req, res) => {
    try {
      const { id } = req.params;
      const zone = await Position.findOne({ id });
      if (!zone) {
        return handleResponse(404, "Position not found.", {}, res);
      }

      await zone.deleteOne();
      handleResponse(200, "Position deleted successfully", {}, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updatePositionStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const zone = await Position.findOne({ id });
      if (!zone) {
        return handleResponse(404, "Position not found.", {}, res);
      }

      zone.status = zone.status == true ? false : true;
      await zone.save();
      handleResponse(200, "status updated successfully", zone, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updatePosition = async (req, res) => {
    try {
      const { id } = req.params;

      const { ...jobPosition } = req.body;

      // const requiredFields = [
      //   { field: "title", value: jobPosition.title },
      //   { field: "description", value: jobPosition.description },
      //   { field: "location", value: jobPosition.location },
      //   { field: "no_positions", value: jobPosition.no_positions },
      //   { field: "slug", value: jobPosition.slug },
      // ];

      // const validationErrors = validateFields(requiredFields);

      // if (validationErrors.length > 0) {
      //   return handleResponse(
      //     400,
      //     "Validation error",
      //     { errors: validationErrors },
      //     res
      //   );
      // }

      const existingJob = await Position.findOne({ id: id });
      if (!existingJob) {
        return handleResponse(404, "Position not found", {}, res);
      }

      const exisitingTitle = await Position.findOne({
        title: jobPosition.title,
        id: { $ne: id },
      });
      const exisitingSlug = await Position.findOne({
        slug: jobPosition.slug,
        id: { $ne: id },
      });

      if (exisitingTitle) {
        return handleResponse(
          409,
          "Position already exists with this title",
          {},
          res
        );
      }
      if (exisitingSlug) {
        return handleResponse(
          409,
          "Position already exists with this slug",
          {},
          res
        );
      }

      for (const key in jobPosition) {
        if (Object.hasOwnProperty.call(jobPosition, key)) {
          existingJob[key] = jobPosition[key];
        }
      }

      await existingJob.save();
      return handleResponse(
        200,
        "Position updated successfully",
        existingJob,
        res
      );
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };
}

export default JobPositionController;
