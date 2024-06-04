import ContactUs from "../../src/models/adminModel/ContactUsModel.js";
import handleResponse from "../../config/http-response.js";

class ContactUsController {
  //add conatct us,
  static AddContactUs = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { banner_image, ...contactUs } = req.body;

      let existingPolicy = await ContactUs.findOne({
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
        Object.assign(existingPolicy, contactUs);
        await existingPolicy.save();
        return handleResponse(
          200,
          "Contact-Us updated successfully.",
          existingPolicy,
          resp
        );
      } else {
        const newContactUs = new ContactUs({
          created_by: user.id,
          ...contactUs,
        });

        if (images && images.banner_image) {
          newContactUs.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newContactUs.save();
        return handleResponse(
          201,
          "Contact-Us created successfully.",
          newContactUs,
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

  static getContactUs = async (req, resp) => {
    try {
      const contactus = await ContactUs.find();
      if (!contactus) {
        return handleResponse(404, "No data available", {}, resp);
      }

      return handleResponse(200, "Contact Us fetched successfully", contactus, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default ContactUsController;
