import Career from "../../src/models/adminModel/CareerModel.js";
import handleResponse from "../../config/http-response.js";

class CareerController {
  //add and update career controller
  static AddUpdateCareer = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const base_url = `${req.protocol}://${req.get("host")}/api`;

      const parseField = (field) => {
        if (field === "null") {
          return null;
        }
        return field;
      };

      const { ...careerData } = req.body;

      for (let key in careerData) {
        careerData[key] = parseField(careerData[key]);
      }

      let existingCareerData = await Career.findOne({
        created_by: user.id,
      });

      console.log(existingCareerData);

      if (existingCareerData) {
        const updateData = { ...careerData };

        if (images && images.image_one) {
          updateData[
            "section_one.banner_image"
          ] = `${base_url}/${images.image_one[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_two) {
          updateData[
            "section_two.box_one_icon"
          ] = `${base_url}/${images.image_two[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_three) {
          updateData[
            "section_two.box_two_icon"
          ] = `${base_url}/${images.image_three[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_four) {
          updateData[
            "section_two.box_four_icon"
          ] = `${base_url}/${images.image_four[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_five) {
          updateData[
            "section_three.banner_image"
          ] = `${base_url}/${images.image_five[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_six) {
          updateData[
            "section_three.box_one_icon"
          ] = `${base_url}/${images.image_six[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_seven) {
          updateData[
            "section_three.box_two_icon"
          ] = `${base_url}/${images.image_seven[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_eight) {
          updateData[
            "section_three.box_three_icon"
          ] = `${base_url}/${images.image_eight[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_nine) {
          updateData[
            "section_three.box_four_icon"
          ] = `${base_url}/${images.image_nine[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_ten) {
          updateData[
            "section_four.banner_image"
          ] = `${base_url}/${images.image_ten[0].path.replace(/\\/g, "/")}`;
        }

        await Career.updateOne(
          { created_by: user.id },
          { $set: updateData },
          { runValidators: true }
        );

        return handleResponse(
          200,
          "Career Page Updated Successfully.",
          await Career.findOne({ created_by: user.id }),
          resp
        );
      } else {
        const newCareer = new Career({
          created_by: user.id,
          ...careerData,
        });

        if (images && images.image_one) {
          newCareer.section_one.banner_image = `${base_url}/${images.image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_two) {
          newCareer.section_two.box_one_icon = `${base_url}/${images.image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_three) {
          newCareer.section_two.box_two_icon = `${base_url}/${images.image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_four) {
          newCareer.section_two.box_three_icon = `${base_url}/${images.image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_five) {
          newCareer.section_three.banner_image = `${base_url}/${images.image_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_six) {
          newCareer.section_three.box_one_icon = `${base_url}/${images.image_six[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_seven) {
          newCareer.section_three.box_two_icon = `${base_url}/${images.image_seven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eight) {
          newCareer.section_three.box_three_icon = `${base_url}/${images.image_eight[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.left_banner) {
          newCareer.section_three.box_four_icon = `${base_url}/${images.left_banner[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_ten) {
          newCareer.section_four.banner_image = `${base_url}/${images.image_ten[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newCareer.save();
        return handleResponse(
          201,
          "Career Page Created Successfully.",
          newCareer,
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

  //get career
  static getCareer = async (req, resp) => {
    try {
      const career = await Career.find();
      if (!career) {
        return handleResponse(404, "No career page find.", {}, resp);
      }

      return handleResponse(
        200,
        "Career page data fetched successfully",
        career,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default CareerController;
