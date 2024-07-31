import Customer_support from "../../src/models/adminModel/CustomerSupportPolicy.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Contact from "../../src/models/adminModel/ContactModel.js";
import validateFields from "../../config/validateFields.js";
import moment from "moment";
import Subscriber from "../../src/models/adminModel/SubscribersModel.js";
import fs from "fs";
import { format } from "@fast-csv/format";
import ProductEnquiry from "../../src/models/adminModel/ProductEnquiryModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import PrescriptionRequest from "../../src/models/adminModel/PrescriptionRequestModel.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import { log } from "console";

class CustomerPolicyController {
  //add customer policy
  static AddCustomerPolicy = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { banner_image, ...customerPolicy } = req.body;

      let existingPolicy = await Customer_support.findOne({
        created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}`;

      if (existingPolicy) {
        if (images && images.banner_image) {
          existingPolicy.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        Object.assign(existingPolicy, customerPolicy);
        await existingPolicy.save();
        return handleResponse(
          200,
          "Customer Support Policy updated successfully.",
          existingPolicy,
          resp
        );
      } else {
        const newCustomerSupport = new Customer_support({
          created_by: user.id,
          ...customerPolicy,
        });

        if (images && images.banner_image) {
          newCustomerSupport.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newCustomerSupport.save();
        return handleResponse(
          201,
          "Customer Support Policy created successfully.",
          newCustomerSupport,
          resp
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
          resp
        );
      } else {
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };

  //get customer policy
  static GetCustomerPolicy = async (req, resp) => {
    try {
      const customerSupport = await Customer_support.find();
      if (!customerSupport) {
        return handleResponse(
          404,
          "No Customer Support Policy found.",
          {},
          resp
        );
      }

      for (const shipping of customerSupport) {
        if (shipping.created_by) {
          const createdBy = await User.findOne({
            id: shipping.created_by,
          });
          shipping.created_by = createdBy;
        }
      }

      return handleResponse(
        200,
        "Customer Support Policy fetched successfully.",
        customerSupport,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static addContact = async (req, res) => {
    try {
      const { name, email, contact_no, message } = req.body;

      const requiredFields = [
        { field: "name", value: name },
        { field: "email", value: email },
        { field: "message", value: message },
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

      const newContact = new Contact({
        name,
        email,
        contact_no,
        message,
      });

      await newContact.save();

      handleResponse(201, "Contact data stored successfully", newContact, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  static AllContacts = async (req, res) => {
    try {
      const { name, email, fromDate, toDate } = req.query;

      const contacts = await Contact.find().sort({ id: -1 }).lean();

      const formattedContacts = contacts.map((contact) => ({
        ...contact,
        enquired_on: moment(contact.createdAt).format("DD-MM-YYYY"),
      }));

      const filteredContacts = formattedContacts.filter((user) => {
        let matches = true;

        if (name) matches = matches && RegExp(name, "i").test(user.name);
        if (email) matches = matches && new RegExp(email, "i").test(user.email);
        if (fromDate && toDate) {
          const createdAt = moment(user.enquired_on, "DD-MM-YYYY");
          const from = moment(fromDate, "DD-MM-YYYY").startOf("day");
          const to = moment(toDate, "DD-MM-YYYY").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      handleResponse(200, "Contacts get successfully", filteredContacts, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  static contactCsv = async (req, res) => {
    try {
      const users = await Contact.find(
        {},
        "id name email contact_no message createdAt"
      );

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No Contacts found" });
      }

      const csvStream = format({
        headers: [
          "Id",
          "Name",
          "Email",
          "Contact Number",
          "Message",
          "Enquired On",
        ],
      });
      const writableStream = fs.createWriteStream("contact.csv");

      writableStream.on("finish", () => {
        res.download("contact.csv", "contact.csv", (err) => {
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
          Message: user.message,
          "Enquired On": moment(user.createdAt).format("DD/MM/YYYY"),
        });
      });

      csvStream.end();
    } catch (error) {
      console.error("Error exporting contact to CSV:", error);
      handleResponse(500, error.message, {}, res);
    }
  };

  // Subscribers

  static PostSubscribers = async (req, res) => {
    try {
      const { email } = req.body;

      const requiredFields = [{ field: "email", value: email }];

      const validationErrors = validateFields(requiredFields);

      if (validationErrors.length > 0) {
        return handleResponse(
          400,
          "Validation error",
          { errors: validationErrors },
          res
        );
      }

      // Create a new contact document
      const newContact = new Subscriber({
        email,
      });
      // Save the contact document to the database
      await newContact.save();

      handleResponse(201, "Contact data stored successfully", newContact, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  static AllSubscribers = async (req, res) => {
    try {
      // Parse query parameters
      const { email, fromDate, toDate } = req.query;

      const contacts = await Subscriber.find().sort({ id: -1 }).lean();
      // Format created_at date
      const formattedContacts = contacts.map((contact) => ({
        ...contact,
        date_of_subscription: moment(contact.createdAt).format("DD-MM-YYYY"),
      }));

      const filteredContacts = formattedContacts.filter((user) => {
        let matches = true;

        if (email) matches = matches && new RegExp(email, "i").test(user.email);
        if (fromDate && toDate) {
          const createdAt = moment(user.date_of_subscription, "DD-MM-YYYY");
          const from = moment(fromDate, "DD-MM-YYYY").startOf("day");
          const to = moment(toDate, "DD-MM-YYYY").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      handleResponse(
        200,
        "Subscribers get successfully",
        filteredContacts,
        res
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  static deleteSubscriberById = async (req, res) => {
    try {
      const { id } = req.params;
      const zone = await Subscriber.findOne({ id });
      if (!zone) {
        return handleResponse(404, "Subscriber not found.", {}, res);
      }

      await zone.deleteOne();
      handleResponse(200, "Subscriber deleted successfully", {}, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateSubscriberById = async (req, res) => {
    try {
      const { id } = req.params;
      const zone = await Subscriber.findOne({ id });
      if (!zone) {
        return handleResponse(404, "Subscriber not found.", {}, res);
      }

      zone.status = zone.status == true ? false : true;
      await zone.save();
      handleResponse(200, "Subscriber status updated successfully", zone, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static subscribersCsv = async (req, res) => {
    try {
      const users = await Subscriber.find({}, "id email status createdAt"); // Fetch all users from the database

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No subscribers found" });
      }

      const csvStream = format({
        headers: ["Id", "Email", "Date of Subscription", "Status"],
      });
      const writableStream = fs.createWriteStream("subscriber.csv");

      writableStream.on("finish", () => {
        res.download("subscriber.csv", "subscriber.csv", (err) => {
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
          Email: user.email,
          "Date of Subscription": moment(user.createdAt).format("DD/MM/YYYY"),
          Status: user.status,
        });
      });

      csvStream.end();
    } catch (error) {
      console.error("Error exporting subscriber to CSV:", error);
      handleResponse(500, error.message, {}, res);
    }
  };

  // Product enquiry

  static addProductEnquiry = async (req, res) => {
    try {
      const { name, email, contact_no, product_id } = req.body;

      // Validate required fields

      const requiredFields = [
        { field: "name", value: name },
        { field: "email", value: email },
        { field: "contact_no", value: contact_no },
        { field: "product_id", value: product_id },
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

      // Create a new contact document
      const newContact = new ProductEnquiry({
        name,
        email,
        contact_no,
        product_id,
      });

      // Save the contact document to the database
      await newContact.save();

      handleResponse(
        201,
        "Product Enquiry data stored successfully",
        newContact,
        res
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  static getAllProductQuery = async (req, res) => {
    try {
      // parse  query parameters
      const { name, email, productName, fromDate, toDate } = req.query;

      const users = await ProductEnquiry.find().sort({ id: -1 });

      const excludeUserId = req.user.id;
      const formattedUsers = [];

      for (const item of users) {
        const product = await Product.findOne({ id: item.product_id });

        const _id = item._id;
        const id = item.id;
        const name = item.name;
        const email = item.email;
        const contact_no = item.contact_no;
        const product_name = product ? product.product_name : "N/A";
        const product_img = product ? product.featured_image : "N/A";
        const enquired_on = moment(item.createdAt).format("DD-MM-YYYY");

        const formattedUser = {
          _id,
          id,
          name,
          email,
          contact_no,
          product_name,
          product_img,
          enquired_on,
        };

        formattedUsers.push(formattedUser);
      }

      // Apply filters to the formatted users
      const filteredUsers = formattedUsers.filter((user) => {
        let matches = true;

        if (name) matches = matches && new RegExp(name, "i").test(user.name);
        if (email) matches = matches && new RegExp(email, "i").test(user.email);
        if (productName)
          matches =
            matches && new RegExp(productName, "i").test(user.product_name);
        if (fromDate && toDate) {
          const createdAt = moment(user.enquired_on, "YYYY-MM-DD");
          const from = moment(fromDate, "YYYY-MM-DD").startOf("day");
          const to = moment(toDate, "YYYY-MM-DD").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      handleResponse(200, "query get successfully", filteredUsers, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static productQueryCsv = async (req, res) => {
    try {
      const users = await ProductEnquiry.find(
        {},
        "id name email contact_no createdAt product_id"
      ); // Fetch all users from the database

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      // Fetch all user addresses
      const userAddresses = await Product.find(
        {},
        "id product_name featured_image"
      );

      // Create a map to quickly lookup country by user_id
      const productMap = userAddresses.reduce((acc, product) => {
        acc[product.id] = {
          product_name: product.product_name,
          featured_image: product.featured_image,
        };

        return acc;
      }, {});

      const csvStream = format({
        headers: [
          "Id",
          "Name",
          "Email",
          "Contact Number",
          "Product Name",
          "Image",
          "Enquiry Date",
        ],
      });
      const writableStream = fs.createWriteStream("productenquiries.csv");

      writableStream.on("finish", () => {
        res.download("productenquiries.csv", "productenquiries.csv", (err) => {
          if (err) {
            console.error("Error downloading file:", err);
            handleResponse(500, err, {}, res);
          }
        });
      });

      csvStream.pipe(writableStream);

      users.forEach((user) => {
        const product = productMap[user.product_id] || {
          product_name: "N/A",
          featured_image: "N/A",
        };
        csvStream.write({
          Id: user.id,
          Name: user.name,
          Email: user.email,
          "Contact Number": user.contact_no,
          "Product Name": product.product_name,
          Image: product.featured_image,
          "Enquiry Date": moment(user.createdAt).format("DD-MM-YYYY"),
        });
      });

      csvStream.end();
    } catch (error) {
      console.error("Error exporting users to CSV:", error);
      handleResponse(500, error.message, {}, res);
    }
  };

  // Prescription Request

  static postPrescription = async (req, res) => {
    try {
      const { user_id, email, medicine_id } = req.body;

      // Validate required fields

      const requiredFields = [
        { field: "user_id", value: user_id },
        { field: "email", value: email },
        { field: "medicine_id", value: medicine_id },
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

      // Create a new contact document
      const newContact = new PrescriptionRequest({
        user_id,
        email,
        medicine_id,
      });

      // Save the contact document to the database
      await newContact.save();

      handleResponse(
        201,
        "Prescription Request Send successfully",
        newContact,
        res
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  static getAllPrescription = async (req, res) => {
    try {
      // parse  query parameters
      const { name, email, medicineName, fromDate, toDate } = req.query;

      const users = await PrescriptionRequest.find().sort({ id: -1 });

      const formattedUsers = [];

      for (const item of users) {
        const product = await Medicine.findOne({ id: item.medicine_id });
        const user = await User.findOne({ id: item.user_id });

        const _id = item._id;
        const id = item.id;
        const name = user ? user.name : "N/A";
        const email = item.email;
        const contact_no = user ? user.phone_number : "N/A";
        const product_name = product ? product.product_name : "N/A";
        const requested_on = moment(item.createdAt).format("YYYY-MM-DD");

        const formattedUser = {
          _id,
          id,
          name,
          email,
          contact_no,
          product_name,
          requested_on,
        };

        formattedUsers.push(formattedUser);
      }

      // Apply filters to the formatted users
      const filteredUsers = formattedUsers.filter((user) => {
        let matches = true;

        if (name) matches = matches && new RegExp(name, "i").test(user.name);
        if (email) matches = matches && new RegExp(email, "i").test(user.email);
        if (medicineName)
          matches =
            matches && new RegExp(medicineName, "i").test(user.product_name);
        if (fromDate && toDate) {
          const createdAt = moment(user.requested_on, "YYYY-MM-DD");
          const from = moment(fromDate, "YYYY-MM-DD").startOf("day");
          const to = moment(toDate, "YYYY-MM-DD").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      handleResponse(
        200,
        "Prescription Request get successfully",
        filteredUsers,
        res
      );
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static prescriptionCsv = async (req, res) => {
    try {
      const users = await PrescriptionRequest.find(
        {},
        "id email user_id createdAt medicine_id"
      ); // Fetch all users from the database

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      // Fetch all user addresses
      const userAddresses = await Medicine.find({}, "id product_name");

      const user = await User.find({}, "id name phone_number");

      // Create a map to quickly lookup country by user_id
      const productMap = userAddresses.reduce((acc, product) => {
        acc[product.id] = product.product_name;
        return acc;
      }, {});

      const userMap = user.reduce((acc, user) => {
        acc[user.id] = {
          name: user.name,
          phone_number: user.phone_number,
        };

        return acc;
      }, {});

      const csvStream = format({
        headers: [
          "Id",
          "Name",
          "Email",
          "Contact Number",
          "Medicine Name",
          "Requested Date",
        ],
      });
      const writableStream = fs.createWriteStream("prescriptionRequests.csv");

      writableStream.on("finish", () => {
        res.download(
          "prescriptionRequests.csv",
          "prescriptionRequests.csv",
          (err) => {
            if (err) {
              console.error("Error downloading file:", err);
              handleResponse(500, err, {}, res);
            }
          }
        );
      });

      csvStream.pipe(writableStream);

      users.forEach((user) => {
        const customer = userMap[user.user_id] || {
          name: "N/A",
          phone_number: "N/A",
        };
        const product = productMap[user.medicine_id] || "N/A";
        csvStream.write({
          Id: user.id,
          Name: customer.name,
          Email: user.email,
          "Contact Number": customer.phone_number,
          "Medicine Name": product,
          "Requested Date": moment(user.createdAt).format("DD-MM-YYYY HH:mm"),
        });
      });

      csvStream.end();
    } catch (error) {
      console.error("Error exporting users to CSV:", error);
      handleResponse(500, error.message, {}, res);
    }
  };
}

export default CustomerPolicyController;
