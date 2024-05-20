import Home_page from "../../src/models/adminModel/HomePageModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Brand from "../../src/models/adminModel/BrandModel.js";

class HomePageController {
  //add home page
  static AddHomePagePolicy = async (req, resp) => {
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

      const {
        banner_image_one,
        banner_image_two,
        banner_image_three,
        banner_image_four,
        banner_image_five,
        banner_image_six,
        banner_image_seven,
        banner_image_eight,
        image_one,
        image_two,
        image_three,
        image_four,
        left_image,
        right_image,
        ...homePageData
      } = req.body;

      for (let key in homePageData) {
        homePageData[key] = parseField(homePageData[key]);
      }

      let existingPolicy = await Home_page.findOne({
        created_by: user.id,
      });

      if (existingPolicy) {
        const updateData = { ...homePageData };

        if (images && images.banner_image_one) {
          updateData[
            "section_two.banner_image_one"
          ] = `${base_url}/${images.banner_image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_two) {
          updateData[
            "section_three.banner_image_two"
          ] = `${base_url}/${images.banner_image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_three) {
          updateData[
            "section_four.banner_image_three"
          ] = `${base_url}/${images.banner_image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_four) {
          updateData[
            "section_five.banner_image_four"
          ] = `${base_url}/${images.banner_image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_five) {
          updateData[
            "section_six.banner_image_five"
          ] = `${base_url}/${images.banner_image_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_six) {
          updateData[
            "section_ten.banner_image_six"
          ] = `${base_url}/${images.banner_image_six[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_seven) {
          updateData[
            "section_sixteen.banner_image_seven"
          ] = `${base_url}/${images.banner_image_seven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_eight) {
          updateData[
            "section_twentytwo.banner_image_eight"
          ] = `${base_url}/${images.banner_image_eight[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.left_banner) {
          updateData[
            "section_seven.left_banner"
          ] = `${base_url}/${images.left_banner[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.right_banner) {
          updateData[
            "section_seven.right_banner"
          ] = `${base_url}/${images.right_banner[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_one) {
          updateData[
            "section_nine.one.image_one"
          ] = `${base_url}/${images.image_one[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_two) {
          updateData[
            "section_nine.two.image_two"
          ] = `${base_url}/${images.image_two[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_three) {
          updateData[
            "section_nine.three.image_three"
          ] = `${base_url}/${images.image_three[0].path.replace(/\\/g, "/")}`;
        }
        if (images && images.image_four) {
          updateData[
            "section_nine.four.image_four"
          ] = `${base_url}/${images.image_four[0].path.replace(/\\/g, "/")}`;
        }

        await Home_page.updateOne(
          { created_by: user.id },
          { $set: updateData },
          { runValidators: true }
        );

        return handleResponse(
          200,
          "Shipping Policy updated successfully.",
          await Home_page.findOne({ created_by: user.id }),
          resp
        );
      } else {
        const newShippingPolicy = new Home_page({
          created_by: user.id,
          ...homePageData,
        });

        if (images && images.banner_image_one) {
          newShippingPolicy.section_two.banner_image_one = `${base_url}/${images.banner_image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_two) {
          newShippingPolicy.section_three.banner_image_two = `${base_url}/${images.banner_image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_three) {
          newShippingPolicy.section_four.banner_image_three = `${base_url}/${images.banner_image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_four) {
          newShippingPolicy.section_five.banner_image_four = `${base_url}/${images.banner_image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_five) {
          newShippingPolicy.section_six.banner_image_five = `${base_url}/${images.banner_image_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_six) {
          newShippingPolicy.section_ten.banner_image_six = `${base_url}/${images.banner_image_six[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_seven) {
          newShippingPolicy.section_sixteen.banner_image_seven = `${base_url}/${images.banner_image_seven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_image_eight) {
          newShippingPolicy.section_twentytwo.banner_image_eight = `${base_url}/${images.banner_image_eight[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.left_banner) {
          newShippingPolicy.section_seven.left_banner = `${base_url}/${images.left_banner[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.right_banner) {
          newShippingPolicy.section_seven.right_banner = `${base_url}/${images.right_banner[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_one) {
          newShippingPolicy.section_nine.one.image_one = `${base_url}/${images.image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_two) {
          newShippingPolicy.section_nine.two.image_two = `${base_url}/${images.image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_three) {
          newShippingPolicy.section_nine.three.image_three = `${base_url}/${images.image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_four) {
          newShippingPolicy.section_nine.four.image_four = `${base_url}/${images.image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newShippingPolicy.save();
        return handleResponse(
          201,
          "Shipping Policy created successfully.",
          newShippingPolicy,
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

  //get home page
  static GetHomePage = async (req, resp) => {
    try {
      const homePage = await Home_page.find();
      if (!homePage) {
        return handleResponse(404, "No Home Page Policy found.", {}, resp);
      }

      for (const shipping of homePage) {
        if (shipping.created_by) {
          const createdBy = await User.findOne({
            id: shipping.created_by,
          });
          shipping.created_by = createdBy;
        }
        if (shipping.section_four.select_category) {
          const selectCategory = await Category.finOne({
            id: shipping.section_four.select_category,
          });
          shipping.section_four.select_category = selectCategory;
        }
        if (shipping.section_five.select_category) {
          const selectCategory = await Category.finOne({
            id: shipping.section_five.select_category,
          });
          shipping.section_five.select_category = selectCategory;
        }
        if (shipping.section_six.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_six.select_product,
          });
          shipping.section_six.select_product = selectProduct;
        }
        if (shipping.section_eight.select_brand) {
          const selectBrand = await Brand.finOne({
            id: shipping.section_eight.select_brand,
          });
          shipping.section_eight.select_brand = selectBrand;
        }
        if (shipping.section_eleven.select_category) {
          const selectCategory = await Category.finOne({
            id: shipping.section_eleven.select_category,
          });
          shipping.section_eleven.select_category = selectCategory;
        }
        if (shipping.section_twelve.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_twelve.select_product,
          });
          shipping.section_twelve.select_product = selectProduct;
        }
        if (shipping.section_thirteen.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_thirteen.select_product,
          });
          shipping.section_thirteen.select_product = selectProduct;
        }
        if (shipping.section_fourteen.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_fourteen.select_product,
          });
          shipping.section_fourteen.select_product = selectProduct;
        }
        if (shipping.section_fifteen.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_fifteen.select_product,
          });
          shipping.section_fifteen.select_product = selectProduct;
        }
        if (shipping.section_seventeen.select_category) {
          const selectCategory = await Category.finOne({
            id: shipping.section_seventeen.select_category,
          });
          shipping.section_seventeen.select_category = selectCategory;
        }
        if (shipping.section_eighteen.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_eighteen.select_product,
          });
          shipping.section_eighteen.select_product = selectProduct;
        }
        if (shipping.section_nineteen.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_nineteen.select_product,
          });
          shipping.section_nineteen.select_product = selectProduct;
        }
        if (shipping.section_twenty.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_twenty.select_product,
          });
          shipping.section_twenty.select_product = selectProduct;
        }
        if (shipping.section_twentyone.select_product) {
          const selectProduct = await Product.finOne({
            id: shipping.section_twentyone.select_product,
          });
          shipping.section_twentyone.select_product = selectProduct;
        }
      }

      if (homePage.length == 0) {
        return handleResponse(200, "No home page data found.", {}, resp);
      }
      return handleResponse(
        200,
        "Home Page Policy fetched successfully.",
        homePage,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default HomePageController;