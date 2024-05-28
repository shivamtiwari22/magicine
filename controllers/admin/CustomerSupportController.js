import Customer_support from "../../src/models/adminModel/CustomerSupportPolicy.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Contact from "../../src/models/adminModel/ContactModel.js";
import validateFields from "../../config/validateFields.js";
import moment from "moment";

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

      const base_url = `${req.protocol}://${req.get("host")}/api`;

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

  // Here the code of customer data

  static addContact = async (req, res) => {
    try {
      const { name, email, contact_no, message } = req.body;

      // Validate required fields

      const requiredFields = [
        { field: "name", value: name },
        { field: "email", value: email },
        { field: "contact_no", value: contact_no },
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

      // Create a new contact document
      const newContact = new Contact({
        name,
        email,
        contact_no,
        message,
      });

      // Save the contact document to the database
      await newContact.save();

      handleResponse(201, "Contact data stored successfully", newContact, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  static AllContacts = async (req, res) => {
    try {
      // Parse query parameters
      const { name, email, fromDate, toDate } = req.query;

      // Prepare filter object
      const filter = {};
      if (name) filter.name = new RegExp(name, "i"); // Case-insensitive search for name
      if (email) filter.email = new RegExp(email, "i"); // Case-insensitive search for email
      if (fromDate && toDate) {
        filter.created_at = {
          $gte: moment(fromDate, "MM-DD-YYYY").startOf("day").toDate(),
          $lte: moment(toDate, "MM-DD-YYYY").endOf("day").toDate(),
        };
      }

      const contacts = await Contact.find(filter).sort({id:-1});

      // Format created_at date
      const formattedContacts = contacts.map((contact) => ({
        ...contact.toObject(),
        enquired_on: moment(contact.created_at).format("MM/DD/YYYY"),
      }));

      handleResponse(200, "Contacts get successfully", formattedContacts, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };
}

export default CustomerPolicyController;
