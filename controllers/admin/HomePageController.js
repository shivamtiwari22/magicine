import Home_page from "../../src/models/adminModel/HomePageModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";

class HomePageController {
  //add home page
  static AddHomePagePolicy = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { ...homePageData } = req.body;
      const base_url = `${req.protocol}://${req.get("host")}/api`;

      const parseField = (field) => {
        if (field === "null") {
          return null;
        }
        if (Array.isArray(field)) {
          return field;
        }
        return field;
      };

      let existingHomePage = await Home_page.findOne({
        created_by: user.id,
      });

      if (existingHomePage) {
        const sectionOne = {
          status: homePageData["section_one.status"],
          main_heading: homePageData["section_one.main_heading"],
          sub_heading: homePageData["section_one.main_heading"],
          search_bar_placeholder:
            homePageData["section_one.search_bar_placeholder"],
        };

        const sectionTwo = {
          status: homePageData["section_two.status"],
        };

        const sectionThree = {
          status: homePageData["section_three.status"],
          name: homePageData["section_three.name"],
          deals: homePageData["section_three.deals"],
        };

        if (Array.isArray(sectionThree.deals)) {
          sectionThree.deals.forEach((deal, index) => {
            const product = deal.product;
            const time = deal.time;
            const image = deal.image;
            const id = deal.id;
          });
        } else {
          console.log("No deals available.");
        }

        if (images && Object.keys(images).length > 0) {
          if (images && images.image_one) {
            existingHomePage.section_two.banner_image = `${base_url}/${images.image_one[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_two) {
            existingHomePage.section_three.banner_image = `${base_url}/${images.image_two[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_three) {
            existingHomePage.section_four.banner_image = `${base_url}/${images.image_three[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_four) {
            existingHomePage.section_five.banner_image = `${base_url}/${images.image_four[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_five) {
            existingHomePage.section_six.banner_image = `${base_url}/${images.image_five[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_six) {
            existingHomePage.section_seven.left_banner = `${base_url}/${images.image_six[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_seven) {
            existingHomePage.section_seven.right_banner = `${base_url}/${images.image_seven[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_eight) {
            existingHomePage.section_nine.image_one = `${base_url}/${images.image_eight[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_nine) {
            existingHomePage.section_nine.image_two = `${base_url}/${images.image_nine[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_ten) {
            existingHomePage.section_nine.image_three = `${base_url}/${images.image_ten[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_eleven) {
            existingHomePage.section_nine.image_four = `${base_url}/${images.image_eleven[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_twelve) {
            existingHomePage.section_ten.banner_image = `${base_url}/${images.image_twelve[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_thirteen) {
            existingHomePage.section_sixteen.banner_image = `${base_url}/${images.image_thirteen[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_fourteen) {
            existingHomePage.section_twentytwo.banner_image = `${base_url}/${images.image_fourteen[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
        }

        await existingHomePage.save();
        return handleResponse(
          200,
          "Home Page Updated Successfully.",
          await Home_page.findOne({ created_by: user.id }),
          resp
        );
      } else {
        const newHomePage = new Home_page({
          created_by: user.id,
          ...homePageData,
        });

        if (images && images.image_one) {
          newHomePage.section_two.banner_image = `${base_url}/${images.image_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_two) {
          newHomePage.section_three.banner_image = `${base_url}/${images.image_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_three) {
          newHomePage.section_four.banner_image = `${base_url}/${images.image_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_four) {
          newHomePage.section_five.banner_image = `${base_url}/${images.image_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_five) {
          newHomePage.section_six.banner_image = `${base_url}/${images.image_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_six) {
          newHomePage.section_seven.left_banner = `${base_url}/${images.image_six[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_seven) {
          newHomePage.section_seven.right_banner = `${base_url}/${images.image_seven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eight) {
          newHomePage.section_nine.image_one = `${base_url}/${images.image_eight[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_nine) {
          newHomePage.section_nine.image_two = `${base_url}/${images.image_nine[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_ten) {
          newHomePage.section_nine.image_three = `${base_url}/${images.image_ten[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_eleven) {
          newHomePage.section_nine.image_four = `${base_url}/${images.image_eleven[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_twelve) {
          newHomePage.section_ten.banner_image = `${base_url}/${images.image_twelve[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_thirteen) {
          newHomePage.section_sixteen.banner_image = `${base_url}/${images.image_thirteen[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.image_fourteen) {
          newHomePage.section_twentytwo.banner_image = `${base_url}/${images.image_fourteen[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await existingHomePage.save();
        return handleResponse(
          200,
          "Home Page Updated Successfully.",
          await Home_page.findOne({ created_by: user.id }),
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

      for (const homePageKey of homePage) {
        if (homePageKey.created_by) {
          const createdBy = await User.findOne(
            {
              id: homePageKey.created_by,
            },
            "id name email"
          );
          homePageKey.created_by = createdBy;
        }

        if (
          homePageKey.section_three.deals &&
          homePageKey.section_three.deals.length > 0
        ) {
          for (const keys of homePageKey.section_three.deals) {
            const product = await Product.findOne({ id: keys.id });
            keys.product_id = product;
          }
        }

        if (homePageKey.section_four.select_category.length > 0) {
          for (const key of homePageKey.section_four.select_category) {
            const selectCategory = await Category.find(
              {
                id: key.value,
              },
              "id category_name thumbnail_image category_description long_description slug"
            );
            homePageKey.section_four.select_category = selectCategory;
          }
        }
        if (homePageKey.section_five.select_category.length > 0) {
          for (const key of homePageKey.section_five.select_category) {
            const selectCategory = await Category.find(
              {
                id: key.value,
              },
              "id category_name thumbnail_image category_description long_description slug"
            );
            homePageKey.section_five.select_category = selectCategory;
          }
        }

        if (homePageKey.section_six.select_product.length > 0) {
          for (const key of homePageKey.section_six.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_six.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }

        if (homePageKey.section_eight.select_brand.length > 0) {
          for (const key of homePageKey.section_eight.select_brand) {
            const selectBrand = await Brand.find(
              {
                id: key.value,
              },
              "id brand_name slug featured_image short_description"
            );
            homePageKey.section_eight.select_brand = selectBrand;
          }
        }

        if (homePageKey.section_eleven.select_category.length > 0) {
          for (const key of homePageKey.section_eleven.select_category) {
            const selectCategory = await Category.find(
              {
                id: key.value,
              },
              "id category_name thumbnail_image category_description long_description slug"
            );
            homePageKey.section_eleven.select_category = selectCategory;
          }
        }

        if (homePageKey.section_twelve.select_product.length > 0) {
          for (const key of homePageKey.section_twelve.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_twelve.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }

        if (homePageKey.section_thirteen.select_product.length > 0) {
          for (const key of homePageKey.section_thirteen.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_thirteen.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }

        if (homePageKey.section_fourteen.select_product.length > 0) {
          for (const key of homePageKey.section_fourteen.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_fourteen.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }

        if (homePageKey.section_fifteen.select_product.length > 0) {
          for (const key of homePageKey.section_fifteen.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_fifteen.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }

        if (homePageKey.section_seventeen.select_category.length > 0) {
          for (const key of homePageKey.section_seventeen.select_category) {
            const selectCategory = await Category.find(
              {
                id: key.value,
              },
              "id category_name thumbnail_image category_description long_description slug"
            );
            homePageKey.section_seventeen.select_category = selectCategory;
          }
        }

        if (homePageKey.section_eighteen.select_product.length > 0) {
          for (const key of homePageKey.section_eighteen.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_eighteen.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }

        if (homePageKey.section_nineteen.select_product.length > 0) {
          for (const key of homePageKey.section_nineteen.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_nineteen.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }

        if (homePageKey.section_twenty.select_product.length > 0) {
          for (const key of homePageKey.section_twenty.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_twenty.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }

        if (homePageKey.section_twentyone.select_product.length > 0) {
          for (const key of homePageKey.section_twentyone.select_product) {
            const selectProduct = await Product.find(
              {
                id: key.value,
              },
              "id product_name slug featured_image type"
            ).lean();
            homePageKey.section_twentyone.select_product = selectProduct;

            for (const item of selectProduct) {
              const variant = await InvertoryWithoutVarient.findOne(
                { "item.itemId": item.id, "item.itemType": item.type },
                "id item stock_quantity mrp selling_price discount_percent"
              ).lean();
              item.without_variant = variant;

              const withVariant = await InventoryWithVarient.find(
                { modelId: item.id, modelType: item.type },
                "id modelType modelId image mrp selling_price"
              ).lean();
              item.with_variant = withVariant;
            }
          }
        }
      }
      return handleResponse(200, "success", homePage, resp);
    } catch (err) {
      return handleResponse(500, "Internal Server Error", err.message, resp);
    }
  };
}

export default HomePageController;
