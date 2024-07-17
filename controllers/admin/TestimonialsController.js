import Testimonial from "../../src/models/adminModel/TestimonialModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class TestimonialController {
  // add testimonials
  static AddTestimonial = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { image, ...testimonialData } = req.body;

      const newTestimonial = new Testimonial({
        ...testimonialData,
        created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}`;
      if (images && images.image) {
        newTestimonial.image = `${base_url}/${images.image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }

      await newTestimonial.save();
      return handleResponse(
        201,
        "Testimonial added successfully",
        { newTestimonial },
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

  //update testimonial
  static UpdateTestimonial = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const testimonial = await Testimonial.findOne({ id });

      if (!testimonial) {
        return handleResponse(404, "Testimonial not found.", {}, resp);
      }
      const images = req.files;
      const { image, ...testimonialData } = req.body;

      for (const key in testimonialData) {
        if (Object.hasOwnProperty.call(testimonialData, key)) {
          testimonial[key] = testimonialData[key];
        }
      }
      const base_url = `${req.protocol}://${req.get("host")}`;
      if (images && images.image) {
        testimonial.image = `${base_url}/${images.image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }

      await testimonial.save();
      return handleResponse(
        200,
        "Testimonial updated successfully",
        { testimonial },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get testimonials
  static GetTestimonial = async (req, resp) => {
    try {
      const testimonials = await Testimonial.find().sort({ createdAt: -1 });

      const allTestimonials = await testimonials.filter(
        (testimonials) => testimonials.deleted_at === null
      );

      for (const testimonial of allTestimonials) {
        if (testimonial.created_by) {
          const createdBy = await User.findOne({
            id: testimonial.created_by,
          });
          testimonial.created_by = createdBy;
        }
      }

      if (allTestimonials.length === 0) {
        return handleResponse(200, "No Testimonial data available.", {}, resp);
      }
      return handleResponse(
        200,
        "Testimonial fetched successfully.",
        { allTestimonials },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get testimonials id
  static GetTestimonialID = async (req, resp) => {
    try {
      const { id } = req.params;
      const testimonial = await Testimonial.findOne({ id });

      if (!testimonial) {
        return handleResponse(200, "No Testimonial found.", {}, resp);
      }
      return handleResponse(
        200,
        "Testimonial fetched successfully",
        { testimonial },
        resp
      );
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
      const testimonial = await Testimonial.findOne({ id });

      if (!testimonial) {
        return handleResponse(404, "Testimonial not found", {}, resp);
      }

      if (testimonial.deleted_at !== null) {
        return handleResponse(
          400,
          "Testimonial already in addded to trash.",
          {},
          resp
        );
      }
      const updatetestimonial = await Testimonial.findOneAndUpdate(
        { id },
        { deleted_at: new Date() }
      );

      return handleResponse(
        200,
        "Testimonial add to trash.",
        { updatetestimonial },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore trash
  static RestoreTestimonial = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const testimonial = await Testimonial.findOne({ id });

      if (!testimonial) {
        return handleResponse(404, "Testimonial not found", {}, resp);
      }

      if (testimonial.deleted_at === null) {
        return handleResponse(400, "Testimonial already restored.", {}, resp);
      }
      const updatetestimonial = await Testimonial.findOneAndUpdate(
        { id },
        { deleted_at: null }
      );

      return handleResponse(
        200,
        "Testimonial successfully restored.",
        { updatetestimonial },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get testimonial trash
  static GetTrashTestimonial = async (req, resp) => {
    try {
      const testimonials = await Testimonial.find().sort({ createdAt: -1 });

      const allTestimonials = await testimonials.filter(
        (testimonials) => testimonials.deleted_at !== null
      );
      if (allTestimonials.length == 0) {
        return handleResponse(200, "No Testimonial data available.", {}, resp);
      }
      return handleResponse(
        200,
        "Testimonial fetched successfully.",
        { allTestimonials },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // delete testimonial
  static DeleteTestimonial = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const testimonial = await Testimonial.findOne({ id });

      if (!testimonial) {
        return handleResponse(404, "Testimonial not found", {}, resp);
      }

      if (testimonial.deleted_at !== null) {
        const deletedTestimonial = await Testimonial.findOneAndDelete({ id });
        return handleResponse(
          200,
          "Testimonial deleted successfully.",
          {},
          resp
        );
      } else {
        return handleResponse(
          400,
          "Add this testimonial to trash to delete it.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default TestimonialController;
