import AboutUs from "../../src/models/adminModel/AboutUsModel.js";
import handleResponse from "../../config/http-response.js";

class AboutUsController {
  //add and update
  static AddAboutUs = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const parseField = (field) => {
        if (field === "null") {
          return null;
        }
        return field;
      };

      const images = req.files;
      const {
        banner_image,
        image,
        box_image_one,
        box_image_two,
        box_image_three,
        box_image_four,
        image_one,
        image_two,
        image_three,
        image_four,
        image_five,
        image_six,
        image_seven,
        image_eight,
        image_nine,
        image_ten,
        image_eleven,
        image_twelve,
        ...aboutUs
      } = req.body;

      let existingAboutUs = await AboutUs.findOne({
        created_by: user.id,
      });

      for (let key in existingAboutUs) {
        existingAboutUs[key] = parseField(existingAboutUs[key]);
      }

      const base_url = `${req.protocol}://${req.get("host")}/api`;

      if (existingAboutUs) {
        const updateData = { ...aboutUs };

        if (images && images.banner_image) {
          existingAboutUs.section_one.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image) {
          existingAboutUs.section_two.image = `${base_url}/${images.image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.box_image_one) {
          existingAboutUs.section_two.box_image_one = `${base_url}/${images.box_image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.box_image_two) {
          existingAboutUs.section_two.box_image_two = `${base_url}/${images.box_image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.box_image_three) {
          existingAboutUs.section_two.box_image_three = `${base_url}/${images.box_image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.box_image_four) {
          existingAboutUs.section_two.box_image_four = `${base_url}/${images.box_image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_one) {
          existingAboutUs.section_four.image_one = `${base_url}/${images.image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_two) {
          existingAboutUs.section_four.image_two = `${base_url}/${images.image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.image_three) {
          existingAboutUs.section_four.image_three = `${base_url}/${images.image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_four) {
          existingAboutUs.section_four.image_four = `${base_url}/${images.image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_five) {
          existingAboutUs.section_four.image_five = `${base_url}/${images.image_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_six) {
          existingAboutUs.section_four.image_six = `${base_url}/${images.image_six[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_seven) {
          existingAboutUs.section_four.image_seven = `${base_url}/${images.image_seven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eight) {
          existingAboutUs.section_four.image_eight = `${base_url}/${images.image_eight[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_nine) {
          existingAboutUs.section_six.image_nine = `${base_url}/${images.image_nine[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_ten) {
          existingAboutUs.section_seven.image_ten = `${base_url}/${images.image_ten[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eleven) {
          existingAboutUs.section_seven.image_eleven = `${base_url}/${images.image_eleven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_twelve) {
          existingAboutUs.section_seven.image_twelve = `${base_url}/${images.image_twelve[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await AboutUs.updateOne(
          { created_by: user.id },
          { $set: updateData },
          { runValidators: true }
        );

        return handleResponse(
          200,
          "About Us updated successfully.",
          await AboutUs.findOne({ created_by: user.id }),
          resp
        );
      } else {
        const newContactUs = new AboutUs({
          ...aboutUs,
          created_by: user.id,
        });

        if (images && images.banner_image) {
          newContactUs.section_one.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image) {
          newContactUs.section_two.image = `${base_url}/${images.image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.box_image_one) {
          newContactUs.section_two.box_image_one = `${base_url}/${images.box_image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.box_image_two) {
          newContactUs.section_two.box_image_two = `${base_url}/${images.box_image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.box_image_three) {
          newContactUs.section_two.box_image_three = `${base_url}/${images.box_image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.box_image_four) {
          newContactUs.section_two.box_image_four = `${base_url}/${images.box_image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_one) {
          newContactUs.section_four.image_one = `${base_url}/${images.image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_two) {
          newContactUs.section_four.image_two = `${base_url}/${images.image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.image_three) {
          newContactUs.section_four.image_three = `${base_url}/${images.image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_four) {
          newContactUs.section_four.image_four = `${base_url}/${images.image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_five) {
          newContactUs.section_four.image_five = `${base_url}/${images.image_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_six) {
          newContactUs.section_four.image_six = `${base_url}/${images.image_six[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_seven) {
          newContactUs.section_four.image_seven = `${base_url}/${images.image_seven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eight) {
          newContactUs.section_four.image_eight = `${base_url}/${images.image_eight[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_nine) {
          newContactUs.section_six.image_nine = `${base_url}/${images.image_nine[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_ten) {
          newContactUs.section_seven.image_ten = `${base_url}/${images.image_ten[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eleven) {
          newContactUs.section_seven.image_eleven = `${base_url}/${images.image_eleven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_twelve) {
          newContactUs.section_seven.image_twelve = `${base_url}/${images.image_twelve[0].path.replace(
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
  a;

  static GetAboutUs = async (req, resp) => {
    try {
      const about = await AboutUs.find();

      if (!about) {
        return handleResponse(404, "About us page not available", {}, resp);
      }

      return handleResponse(
        200,
        "About us page fetched successfully.",
        about,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default AboutUsController;
