import AboutUs from "../../src/models/adminModel/AboutUsModel.js";
import handleResponse from "../../config/http-response.js";

class AboutUsController {
  // Add and update
  static AddAboutUs = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const base_url = `${req.protocol}://${req.get("host")}`;


      const parseField = (field) => {
        if (field === "null") {
          return null;
        }
        return field;
      };

      const { ...aboutusData } = req.body;

      let existingAboutUs = await AboutUs.findOne({
        created_by: user.id,
      });

      if (existingAboutUs) {
        for (const key in aboutusData) {
          if (Object.hasOwnProperty.call(aboutusData, key)) {
            existingAboutUs[key] = parseField(aboutusData[key]);
          }
        }

        // Only update image fields if new images are provided
        if (images && Object.keys(images).length > 0) {
          // Section One
          existingAboutUs.section_one.banner_image = images.image_one
            ? `${base_url}/${images.image_one[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_one.banner_image || null;

          // Section Two
          existingAboutUs.section_two.image = images.image_two
            ? `${base_url}/${images.image_two[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_two.image || null;
          existingAboutUs.section_two.box_image_one = images.image_three
            ? `${base_url}/${images.image_three[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_two.box_image_one || null;
          existingAboutUs.section_two.box_image_two = images.image_four
            ? `${base_url}/${images.image_four[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_two.box_image_two || null;
          existingAboutUs.section_two.box_image_three = images.image_five
            ? `${base_url}/${images.image_five[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_two.box_image_three || null;
          existingAboutUs.section_two.box_image_four = images.image_six
            ? `${base_url}/${images.image_six[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_two.box_image_four || null;

          // Section Four
          existingAboutUs.section_four.image_one = images.image_seven
            ? `${base_url}/${images.image_seven[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_four.image_one || null;
          existingAboutUs.section_four.image_two = images.image_eight
            ? `${base_url}/${images.image_eight[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_four.image_two || null;
          existingAboutUs.section_four.image_three = images.image_nine
            ? `${base_url}/${images.image_nine[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_four.image_three || null;
          existingAboutUs.section_four.image_four = images.image_ten
            ? `${base_url}/${images.image_ten[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_four.image_four || null;
          existingAboutUs.section_four.image_five = images.image_eleven
            ? `${base_url}/${images.image_eleven[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_four.image_five || null;
          existingAboutUs.section_four.image_six = images.image_twelve
            ? `${base_url}/${images.image_twelve[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_four.image_six || null;
          existingAboutUs.section_four.image_seven = images.image_thirteen
            ? `${base_url}/${images.image_thirteen[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_four.image_seven || null;
          existingAboutUs.section_four.image_eight = images.image_fourteen
            ? `${base_url}/${images.image_fourteen[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_four.image_eight || null;

          // Section Six
          existingAboutUs.section_six.image = images.image_fifteen
            ? `${base_url}/${images.image_fifteen[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_six.image || null;

          // Section Seven
          existingAboutUs.section_seven.image_one = images.image_sixteen
            ? `${base_url}/${images.image_sixteen[0].path.replace(/\\/g, "/")}`
            : existingAboutUs.section_seven.image_one || null;

          existingAboutUs.section_seven.image_two = images.image_seventeen
            ? `${base_url}/${images.image_seventeen[0].path.replace(
              /\\/g,
              "/"
            )}`
            : existingAboutUs.section_seven.image_two || null;

          existingAboutUs.section_seven.image_three = images.image_seventeen
            ? `${base_url}/${images.image_seventeen[0].path.replace(
              /\\/g,
              "/"
            )}`
            : existingAboutUs.section_seven.image_three || null;
        }

        await existingAboutUs.save();
        return handleResponse(
          200,
          "About Us updated successfully.",
          existingAboutUs,
          resp
        );
      } else {
        const newAboutUs = new AboutUs({
          ...aboutusData,
          created_by: user.id,
        });

        if (images && images.image_one) {
          newAboutUs.section_one.banner_image = `${base_url}/${images.image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_two) {
          newAboutUs.section_two.image = `${base_url}/${images.image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_three) {
          newAboutUs.section_two.box_image_one = `${base_url}/${images.image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_four) {
          newAboutUs.section_two.box_image_two = `${base_url}/${images.image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_five) {
          newAboutUs.section_two.box_image_three = `${base_url}/${images.image_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_six) {
          newAboutUs.section_two.box_image_four = `${base_url}/${images.image_six[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_seven) {
          newAboutUs.section_four.image_one = `${base_url}/${images.image_seven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eight) {
          newAboutUs.section_four.image_two = `${base_url}/${images.image_eight[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_nine) {
          newAboutUs.section_four.image_three = `${base_url}/${images.image_nine[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_ten) {
          newAboutUs.section_four.image_four = `${base_url}/${images.image_ten[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eleven) {
          newAboutUs.section_four.image_five = `${base_url}/${images.image_eleven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_twelve) {
          newAboutUs.section_four.image_six = `${base_url}/${images.image_twelve[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_thirteen) {
          newAboutUs.section_four.image_seven = `${base_url}/${images.image_thirteen[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_fourteen) {
          newAboutUs.section_four.image_eight = `${base_url}/${images.image_fourteen[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_fifteen) {
          newAboutUs.section_six.image = `${base_url}/${images.image_fifteen[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_sixteen) {
          newAboutUs.section_seven.image_one = `${base_url}/${images.image_sixteen[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_seventeen) {
          newAboutUs.section_seven.image_two = `${base_url}/${images.image_seventeen[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eighteen) {
          newAboutUs.section_seven.image_three = `${base_url}/${images.image_eighteen[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newAboutUs.save();
        return handleResponse(
          201,
          "About Us Page created Successfully.",
          newAboutUs,
          resp
        );
      }
    } catch (err) {
      return handleResponse(
        500,
        "An error occurred while updating About Us.",
        {},
        resp
      );
    }
  };

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
