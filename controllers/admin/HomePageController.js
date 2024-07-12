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

        console.log(base_url);

      

      const parseField = (field) => {
        if (field === "null") {
          return null;
        }
        if (Array.isArray(field)) {
          return field.map(parseField);
        }
        return field;
      };

      let existingHomePage = await Home_page.findOne({
        created_by: user.id,
      });

      const updateSectionFields = (section, fields) => {
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              const items = [];
              for (let i = 0; i < value.length; i++) {
                const item = {};
                for (const [subKey, subValue] of Object.entries(value[i])) {
                  item[subKey] = parseField(subValue);
                }
                items.push(item);
              }
              section[key] = items;
            } else {
              section[key] = parseField(value);
            }
          }
        }
      };


      if (existingHomePage) {


        updateSectionFields(existingHomePage.section_one, {
          status: homePageData["section_one.status"],
          main_heading: homePageData["section_one.main_heading"],
          sub_heading: homePageData["section_one.sub_heading"],
          search_bar_placeholder: homePageData["section_one.search_bar_placeholder"],
        });

        updateSectionFields(existingHomePage.section_two, {
          status: homePageData["section_two.status"],
        });

        updateSectionFields(existingHomePage.section_three, {
          status: homePageData["section_three.status"],
          name: homePageData["section_three.name"],
          deals: homePageData["section_three.deals"],
        });


        updateSectionFields(existingHomePage.section_four, {
          status: homePageData["section_four.status"],
          name: homePageData["section_four.name"],
          select_category: homePageData["section_four.select_category"],
        });


        updateSectionFields(existingHomePage.section_five, {
          status: homePageData["section_five.status"],
          name: homePageData["section_five.name"],
          select_category: homePageData["section_five.select_category"],
        });


        updateSectionFields(existingHomePage.section_six, {
          status: homePageData["section_six.status"],
          name: homePageData["section_six.name"],
          select_product: homePageData["section_six.select_product"],
        });


        updateSectionFields(existingHomePage.section_seven, {
          status: homePageData["section_seven.status"],
        });


        updateSectionFields(existingHomePage.section_eight, {
          status: homePageData["section_eight.status"],
          name: homePageData["section_eight.name"],
          select_brand: homePageData["section_eight.select_brand"]
        });

        updateSectionFields(existingHomePage.section_nine, {
          name: homePageData["section_nine.name"],
          status: homePageData["section_nine.status"],
          heading_one: homePageData["section_nine.heading_one"],
          heading_two: homePageData["section_nine.heading_two"],
          heading_three: homePageData["section_nine.heading_three"],
          heading_four: homePageData["section_nine.heading_four"],
          content_one: homePageData["section_nine.content_one"],
          content_two: homePageData["section_nine.content_two"],
          content_three: homePageData["section_nine.content_three"],
          content_four: homePageData["section_nine.content_four"],
        })



        updateSectionFields(existingHomePage.section_ten, {
          status: homePageData["section_ten.status"],
        })

        updateSectionFields(existingHomePage.section_eleven, {
          status: homePageData["section_eleven.status"],
          name: homePageData["section_eleven.name"],
          select_category: homePageData["section_eleven.select_category"],
        })


        updateSectionFields(existingHomePage.section_twelve, {
          status: homePageData["section_twelve.status"],
          name: homePageData["section_twelve.name"],
          select_product: homePageData["section_twelve.select_product"],
        })


        updateSectionFields(existingHomePage.section_thirteen, {
          status: homePageData["section_thirteen.status"],
          name: homePageData["section_thirteen.name"],
          select_product: homePageData["section_thirteen.select_product"],
        })


        updateSectionFields(existingHomePage.section_fourteen, {
          status: homePageData["section_fourteen.status"],
          name: homePageData["section_fourteen.name"],
          select_product: homePageData["section_fourteen.select_product"],
        })


        updateSectionFields(existingHomePage.section_fifteen, {
          status: homePageData["section_fifteen.status"],
          name: homePageData["section_fifteen.name"],
          select_product: homePageData["section_fifteen.select_product"],
        })


        updateSectionFields(existingHomePage.section_sixteen, {
          status: homePageData["section_sixteen.status"],
        })


        updateSectionFields(existingHomePage.section_seventeen, {
          status: homePageData["section_seventeen.status"],
          name: homePageData["section_seventeen.name"],
          select_product: homePageData["section_seventeen.select_product"],
        })


        updateSectionFields(existingHomePage.section_eighteen, {
          status: homePageData["section_eighteen.status"],
          name: homePageData["section_eighteen.name"],
          select_product: homePageData["section_eighteen.select_product"],
        })

        updateSectionFields(existingHomePage.section_nineteen, {
          status: homePageData["section_nineteen.status"],
          name: homePageData["section_nineteen.name"],
          select_product: homePageData["section_nineteen.select_product"],
        })

        updateSectionFields(existingHomePage.section_twenty, {
          status: homePageData["section_twenty.status"],
          name: homePageData["section_twenty.name"],
          select_product: homePageData["section_twenty.select_product"],
        })

        updateSectionFields(existingHomePage.section_twentyone, {
          status: homePageData["section_twentyone.status"],
          name: homePageData["section_twentyone.name"],
          select_product: homePageData["section_twentyone.select_product"],
        })

        updateSectionFields(existingHomePage.section_twentytwo, {
          status: homePageData["section_twentytwo.status"],
        })


        updateSectionFields(existingHomePage, {
          meta_title: homePageData.meta_title,
          meta_description: homePageData.meta_description,
          meta_keywords: homePageData.meta_keywords,
          og_tag: homePageData.og_tag,
          schema_markup: homePageData.schema_markup,
        });

        if (images && Object.keys(images).length > 0) {
          if (images && images.image_one) {
            existingHomePage.section_two.banner_image = `${base_url}/${images.image_one[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
          if (images && images.image_two) {
            existingHomePage.section_three.banner_image = `https://magicine.nilepass.com/api/${images.image_two[0].path.replace(
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

        await newHomePage.save();
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
        console.log("err", err);
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };

  //get home page
  static GetHomePage = async (req, resp) => {
    try {
      const homePage = await Home_page.find();
      if (!homePage) {
        return handleResponse(200, "No Home Page available.", {}, resp);
      }

 
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
      
      return handleResponse(200, "success", homePageKey, resp);
    } catch (err) {
      return handleResponse(500, "Internal Server Error", err.message, resp);
    }
  };
}

export default HomePageController;
