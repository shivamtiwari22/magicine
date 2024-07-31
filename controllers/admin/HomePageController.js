import Home_page from "../../src/models/adminModel/HomePageModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import moment from "moment";
import Review from "../../src/models/adminModel/ReviewsModel.js";
import CartItem from "../../src/models/adminModel/CartItemModel.js";

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
      const parseSectionData = (sectionPrefix, fieldNames) => {
        const sectionData = [];
        let index = 0;
        while (
          homePageData[`${sectionPrefix}.${index}.${fieldNames[0]}`] !==
          undefined
        ) {
          const sectionItem = {};
          fieldNames.forEach((field) => {
            sectionItem[field] =
              homePageData[`${sectionPrefix}.${index}.${field}`];
          });
          sectionData.push(sectionItem);
          index++;
        }
        return sectionData;
      };

      const deals = parseSectionData("section_three.deals", [
        "product",
        "time",
        "image",
        "id",
      ]);
      const section_four_category = parseSectionData(
        "section_four.select_category",
        ["label", "value"]
      );
      const section_five_category = parseSectionData(
        "section_five.select_category",
        ["label", "value"]
      );
      const section_six_product = parseSectionData(
        "section_six.select_product",
        ["label", "value", "image"]
      );
      const section_eight_brand = parseSectionData(
        "section_eight.select_brand",
        ["label", "value"]
      );
      const section_eleven_category = parseSectionData(
        "section_eleven.select_category",
        ["label", "value"]
      );
      const section_twelve_product = parseSectionData(
        "section_twelve.select_product",
        ["label", "value", "image"]
      );
      const section_thirteen_product = parseSectionData(
        "section_thirteen.select_product",
        ["label", "value", "image"]
      );
      const section_fourteen_product = parseSectionData(
        "section_fourteen.select_product",
        ["label", "value", "image"]
      );
      const section_fifteen_product = parseSectionData(
        "section_fifteen.select_product",
        ["label", "value", "image"]
      );
      const section_seventeen_category = parseSectionData(
        "section_seventeen.select_category",
        ["label", "value"]
      );
      const section_eighteen_product = parseSectionData(
        "section_eighteen.select_product",
        ["label", "value", "image"]
      );
      const section_nineteen_product = parseSectionData(
        "section_nineteen.select_product",
        ["label", "value", "image"]
      );
      const section_twenty_product = parseSectionData(
        "section_twenty.select_product",
        ["label", "value", "image"]
      );
      const section_twentyone_product = parseSectionData(
        "section_twentyone.select_product",
        ["label", "value", "image"]
      );

      const base_url = `${req.protocol}://${req.get("host")}`;

      const parseField = (field) => {
        if (field === "null") {
          return null;
        }
        if (Array.isArray(field)) {
          return field.map((item) => parseField(item));
        }
        return field;
      };

      const updateSEOFields = (section, seoData) => {
        if (seoData) {
          section.meta_title = parseField(seoData.meta_title);
          section.meta_description = parseField(seoData.meta_description);
          section.meta_keywords = parseField(seoData.meta_keywords);
          section.og_tag = parseField(seoData.og_tag);
          section.schema_markup = parseField(seoData.schema_markup);
          section.description = parseField(seoData.description);
        }
      };

      const parseSEOFields = (seoData) => {
        return {
          meta_title: parseField(seoData.meta_title),
          meta_description: parseField(seoData.meta_description),
          meta_keywords: parseField(seoData.meta_keywords),
          og_tag: parseField(seoData.og_tag),
          schema_markup: parseField(seoData.schema_markup),
          description: parseField(seoData.description),
        };
      };

      let existingHomePage = await Home_page.findOne({
        created_by: user.id,
      });

      const updateSectionFields = (section, fields) => {
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              if (key === "deals") {
                section.deals = value.map((item) => {
                  const parsedItem = {};
                  for (const [subKey, subValue] of Object.entries(item)) {
                    parsedItem[subKey] = parseField(subValue);
                  }
                  return parsedItem;
                });
              } else {
                section[key] = value.map((item) => parseField(item));
              }
            } else if (typeof value === "object" && !Array.isArray(value)) {
              updateSectionFields(section[key], value);
            } else {
              section[key] = parseField(value);
            }
          }
        }
      };

      const handleImageUploads = (images, existingHomePage, base_url) => {
        if (images && Object.keys(images).length > 0) {
          const imageMappings = [
            { image: "slider_image", field: "slider_image" },
            {
              image: "image_one",
              section: "section_two",
              field: "banner_image",
            },
            {
              image: "image_two",
              section: "section_three",
              field: "banner_image",
            },
            {
              image: "image_three",
              section: "section_four",
              field: "banner_image",
            },
            {
              image: "image_four",
              section: "section_five",
              field: "banner_image",
            },
            {
              image: "image_five",
              section: "section_six",
              field: "banner_image",
            },
            {
              image: "image_six",
              section: "section_seven",
              field: "left_banner",
            },
            {
              image: "image_seven",
              section: "section_seven",
              field: "right_banner",
            },
            {
              image: "image_eight",
              section: "section_nine",
              field: "image_one",
            },
            {
              image: "image_nine",
              section: "section_nine",
              field: "image_two",
            },
            {
              image: "image_ten",
              section: "section_nine",
              field: "image_three",
            },
            {
              image: "image_eleven",
              section: "section_nine",
              field: "image_four",
            },
            {
              image: "image_twelve",
              section: "section_ten",
              field: "banner_image",
            },
            {
              image: "image_thirteen",
              section: "section_sixteen",
              field: "banner_image",
            },
            {
              image: "image_fourteen",
              section: "section_twentytwo",
              field: "banner_image",
            },
          ];

          imageMappings.forEach((mapping) => {
            if (images[mapping.image]) {
              if (mapping.section) {
                existingHomePage[mapping.section][
                  mapping.field
                ] = `${base_url}/${images[mapping.image][0].path.replace(
                  /\\/g,
                  "/"
                )}`;
              } else {
                existingHomePage[mapping.field] = `${base_url}/${images[
                  mapping.image
                ][0].path.replace(/\\/g, "/")}`;
              }
            }
          });
        }
      };

      if (existingHomePage) {
        updateSectionFields(existingHomePage.section_one, {
          status: homePageData["section_one.status"],
          main_heading: homePageData["section_one.main_heading"],
          sub_heading: homePageData["section_one.sub_heading"],
          search_bar_placeholder:
            homePageData["section_one.search_bar_placeholder"],
        });

        updateSectionFields(existingHomePage.section_two, {
          status: homePageData["section_two.status"],
        });

        updateSectionFields(existingHomePage.section_three, {
          status: homePageData["section_three.status"],
          name: homePageData["section_three.name"],
          deals: deals,
        });

        updateSectionFields(existingHomePage.section_four, {
          status: homePageData["section_four.status"],
          name: homePageData["section_four.name"],
          select_category: section_four_category,
        });

        updateSectionFields(existingHomePage.section_five, {
          status: homePageData["section_five.status"],
          name: homePageData["section_five.name"],
          select_category: section_five_category,
        });

        updateSectionFields(existingHomePage.section_six, {
          status: homePageData["section_six.status"],
          name: homePageData["section_six.name"],
          select_product: section_six_product,
        });

        updateSectionFields(existingHomePage.section_seven, {
          status: homePageData["section_seven.status"],
        });

        updateSectionFields(existingHomePage.section_eight, {
          status: homePageData["section_eight.status"],
          name: homePageData["section_eight.name"],
          select_brand: section_eight_brand,
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
        });

        updateSectionFields(existingHomePage.section_ten, {
          status: homePageData["section_ten.status"],
        });

        updateSectionFields(existingHomePage.section_eleven, {
          status: homePageData["section_eleven.status"],
          name: homePageData["section_eleven.name"],
          select_category: section_eleven_category,
        });

        updateSectionFields(existingHomePage.section_twelve, {
          status: homePageData["section_twelve.status"],
          name: homePageData["section_twelve.name"],
          select_product: section_twelve_product,
        });

        updateSectionFields(existingHomePage.section_thirteen, {
          status: homePageData["section_thirteen.status"],
          name: homePageData["section_thirteen.name"],
          select_product: section_thirteen_product,
        });

        updateSectionFields(existingHomePage.section_fourteen, {
          status: homePageData["section_fourteen.status"],
          name: homePageData["section_fourteen.name"],
          select_product: section_fourteen_product,
        });

        updateSectionFields(existingHomePage.section_fifteen, {
          status: homePageData["section_fifteen.status"],
          name: homePageData["section_fifteen.name"],
          select_product: section_fifteen_product,
        });

        updateSectionFields(existingHomePage.section_sixteen, {
          status: homePageData["section_sixteen.status"],
        });

        updateSectionFields(existingHomePage.section_seventeen, {
          status: homePageData["section_seventeen.status"],
          name: homePageData["section_seventeen.name"],
          select_category: section_seventeen_category,
        });

        updateSectionFields(existingHomePage.section_eighteen, {
          status: homePageData["section_eighteen.status"],
          name: homePageData["section_eighteen.name"],
          select_product: section_eighteen_product,
        });

        updateSectionFields(existingHomePage.section_nineteen, {
          status: homePageData["section_nineteen.status"],
          name: homePageData["section_nineteen.name"],
          select_product: section_nineteen_product,
        });

        updateSectionFields(existingHomePage.section_twenty, {
          status: homePageData["section_twenty.status"],
          name: homePageData["section_twenty.name"],
          select_product: section_twenty_product,
        });

        updateSectionFields(existingHomePage.section_twentyone, {
          status: homePageData["section_twentyone.status"],
          name: homePageData["section_twentyone.name"],
          select_product: section_twentyone_product,
        });

        updateSectionFields(existingHomePage.section_twentytwo, {
          status: homePageData["section_twentytwo.status"],
        });

        updateSEOFields(existingHomePage, {
          description: homePageData.description,
          meta_title: homePageData.meta_title,
          meta_description: homePageData.meta_description,
          meta_keywords: homePageData.meta_keywords,
          og_tag: homePageData.og_tag,
          schema_markup: homePageData.schema_markup,
        });

        handleImageUploads(images, existingHomePage, base_url);

        const updatedHomePage = await existingHomePage.save();

        return handleResponse(
          200,
          "Home page updated successfully.",
          updatedHomePage,
          resp
        );
      } else {
        const newSEOFields = parseSEOFields({
          description: homePageData.description,
          meta_title: homePageData.meta_title,
          meta_description: homePageData.meta_description,
          meta_keywords: homePageData.meta_keywords,
          og_tag: homePageData.og_tag,
          schema_markup: homePageData.schema_markup,
        });
        const newHomePage = new Home_page({
          section_one: {
            status: homePageData["section_one.status"],
            main_heading: homePageData["section_one.main_heading"],
            sub_heading: homePageData["section_one.sub_heading"],
            search_bar_placeholder:
              homePageData["section_one.search_bar_placeholder"],
          },
          section_two: {
            status: homePageData["section_two.status"],
            banner_image: homePageData["section_two.banner_image"],
          },
          section_three: {
            status: homePageData["section_three.status"],
            name: homePageData["section_three.name"],
            deals: deals,
            banner_image: homePageData["section_three.banner_image"],
          },
          section_four: {
            status: homePageData["section_four.status"],
            name: homePageData["section_four.name"],
            select_category: section_four_category,
            banner_image: homePageData["section_four.banner_image"],
          },
          section_five: {
            status: homePageData["section_five.status"],
            name: homePageData["section_five.name"],
            select_category: section_five_category,
            banner_image: homePageData["section_five.banner_image"],
          },
          section_six: {
            status: homePageData["section_six.status"],
            name: homePageData["section_six.name"],
            select_product: section_six_product,
            banner_image: homePageData["section_six.banner_image"],
          },
          section_seven: {
            status: homePageData["section_seven.status"],
            left_banner: homePageData["section_seven.left_banner"],
            right_banner: homePageData["section_seven.right_banner"],
          },
          section_eight: {
            status: homePageData["section_eight.status"],
            name: homePageData["section_eight.name"],
            select_brand: section_eight_brand,
          },
          section_nine: {
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
            image_one: homePageData["section_nine.image_one"],
            image_two: homePageData["section_nine.image_two"],
            image_three: homePageData["section_nine.image_three"],
            image_four: homePageData["section_nine.image_four"],
          },
          section_ten: {
            status: homePageData["section_ten.status"],
            banner_image: homePageData["section_ten.banner_image"],
          },
          section_eleven: {
            status: homePageData["section_eleven.status"],
            name: homePageData["section_eleven.name"],
            select_category: section_eleven_category,
          },
          section_twelve: {
            status: homePageData["section_twelve.status"],
            name: homePageData["section_twelve.name"],
            select_product: section_twelve_product,
          },
          section_thirteen: {
            status: homePageData["section_thirteen.status"],
            name: homePageData["section_thirteen.name"],
            select_product: section_thirteen_product,
          },
          section_fourteen: {
            status: homePageData["section_fourteen.status"],
            name: homePageData["section_fourteen.name"],
            select_product: section_fourteen_product,
          },
          section_fifteen: {
            status: homePageData["section_fifteen.status"],
            name: homePageData["section_fifteen.name"],
            select_product: section_fifteen_product,
          },
          section_sixteen: {
            status: homePageData["section_sixteen.status"],
            banner_image: homePageData["section_sixteen.banner_image"],
          },
          section_seventeen: {
            status: homePageData["section_seventeen.status"],
            name: homePageData["section_seventeen.name"],
            select_category: section_seventeen_category,
          },
          section_eighteen: {
            status: homePageData["section_eighteen.status"],
            name: homePageData["section_eighteen.name"],
            select_product: section_eighteen_product,
          },
          section_nineteen: {
            status: homePageData["section_nineteen.status"],
            name: homePageData["section_nineteen.name"],
            select_product: section_nineteen_product,
          },
          section_twenty: {
            status: homePageData["section_twenty.status"],
            name: homePageData["section_twenty.name"],
            select_product: section_twenty_product,
          },
          section_twentyone: {
            status: homePageData["section_twentyone.status"],
            name: homePageData["section_twentyone.name"],
            select_product: section_twentyone_product,
          },
          section_twentytwo: {
            status: homePageData["section_twentytwo.status"],
            banner_image: homePageData["section_twentytwo.banner_image"],
          },
          ...newSEOFields,
          created_by: user.id,
        });

        handleImageUploads(images, newHomePage, base_url);

        const savedHomePage = await newHomePage.save();
        return handleResponse(
          200,
          "Home page added successfully.",
          savedHomePage,
          resp
        );
      }
    } catch (error) {
      console.error(error);
      return handleResponse(500, "Internal server error", error, resp);
    }
  };

  //get home page
  static GetHomePage = async (req, resp) => {
    try {
      const user = req.user;
      const device_id = req.headers.device;

      const homePageKey = await Home_page.findOne();
      if (!homePageKey) {
        return handleResponse(200, "No Home Page found.", {}, resp);
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

      if (homePageKey.section_three) {
        for (const keys of homePageKey.section_three.deals) {
          const product = await Product.findOne({ id: keys.id }).lean();

          // Check if product exists and has a status of true
          if (product && product.status) {
            if (keys.time) {
              keys.time = moment(keys.time).format("DD HH:mm:ss");
            }

            keys.product_id = {
              ...product,
              without_variant: null,
              with_variant: [],
              rating: [],
            };

            console.log(device_id);
            if (req.user) {
              keys.product_id.alreadyCart = !!(await CartItem.findOne({
                product_id: product.id,
                user_id: user.id,
                type: product.type,
              }));
            } else {
              keys.product_id.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: product.id,
                  guest_user: device_id,
                  type: product.type,
                }))
                : false;
            }

            const withoutVariant = await InvertoryWithoutVarient.findOne(
              { itemId: product.id, itemType: product.type },
              "id item stock_quantity mrp selling_price discount_percent"
            ).lean();
            keys.product_id.without_variant = withoutVariant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: product.id, modelType: product.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            keys.product_id.with_variant = withVariant;

            const reviews = await Review.find({
              modelType: product.type,
              product: product.id,
            }).lean();
            keys.product_id.rating = reviews;
          } else {
            homePageKey.section_three.deals = homePageKey.section_three.deals.filter(deal => deal.id !== keys.id);
          }
        }
      }


      if (homePageKey.section_four.select_category.length > 0) {
        const validCategories = [];

        for (const key of homePageKey.section_four.select_category) {
          const selectCategory = await Category.findOne(
            { id: key.value },
            "id category_name thumbnail_image category_description long_description slug status status"
          ).lean();

          if (selectCategory && selectCategory.status) {
            Object.assign(key, selectCategory);
            validCategories.push(key);
          }
        }
        homePageKey.section_four.select_category = validCategories;
      }


      if (homePageKey.section_five.select_category.length > 0) {
        const validCategories = [];
        for (const key of homePageKey.section_five.select_category) {
          const selectCategory = await Category.findOne(
            { id: key.value },
            "id category_name thumbnail_image category_description long_description slug status"
          ).lean();

          if (selectCategory && selectCategory.status) {
            Object.assign(key, selectCategory);
            validCategories.push(key);
          }
        }
        homePageKey.section_five.select_category = validCategories;
      }


      if (homePageKey.section_six.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_six.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_six.select_product = filteredProducts;
      }



      if (homePageKey.section_eight.select_brand.length > 0) {
        const validBrands = [];
        for (const key of homePageKey.section_eight.select_brand) {
          const selectBrand = await Brand.findOne(
            { id: key.value },
            "id brand_name slug featured_image short_description status"
          ).lean();

          if (selectBrand && selectBrand.status) {
            Object.assign(key, selectBrand);
            validBrands.push(key);
          }
        }
        homePageKey.section_eight.select_brand = validBrands
      }

      if (homePageKey.section_eleven.select_category.length > 0) {
        const validateCategory = []
        for (const key of homePageKey.section_eleven.select_category) {
          const selectCategory = await Category.findOne(
            { id: key.value },
            "id category_name thumbnail_image category_description long_description slug status"
          ).lean();

          if (selectCategory && selectCategory.status) {
            Object.assign(key, selectCategory);
            validateCategory.push(key);
          }
        }
        homePageKey.section_eleven.select_category = validateCategory
      }

      if (homePageKey.section_twelve.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_twelve.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_twelve.select_product = filteredProducts;
      }

      if (homePageKey.section_thirteen.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_thirteen.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_thirteen.select_product = filteredProducts;
      }

      if (homePageKey.section_fourteen.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_fourteen.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_fourteen.select_product = filteredProducts;
      }

      if (homePageKey.section_fifteen.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_fifteen.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_fifteen.select_product = filteredProducts;
      }

      if (homePageKey.section_seventeen.select_category.length > 0) {
        const validateCategory = []
        for (const key of homePageKey.section_seventeen.select_category) {
          const selectCategory = await Category.findOne(
            { id: key.value },
            "id category_name thumbnail_image category_description long_description slug status"
          ).lean();

          if (selectCategory && selectCategory.status) {
            Object.assign(key, selectCategory);
            validateCategory.push(key)
          }
        }
        homePageKey.section_seventeen.select_category = validateCategory
      }

      if (homePageKey.section_eighteen.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_eighteen.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_eighteen.select_product = filteredProducts;
      }

      if (homePageKey.section_nineteen.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_nineteen.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_nineteen.select_product = filteredProducts;
      }

      if (homePageKey.section_twenty.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_twenty.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_twenty.select_product = filteredProducts;
      }

      if (homePageKey.section_twentyone.select_product.length > 0) {
        const filteredProducts = [];

        for (const key of homePageKey.section_twentyone.select_product) {
          const selectProduct = await Product.findOne(
            { id: key.value },
            "id product_name slug featured_image type has_variant status"
          ).lean();

          if (selectProduct && selectProduct.status) {
            const productDetails = {
              ...selectProduct,
              without_variant: null,
              with_variant: [],
              alreadyCart: false,
            };

            if (req.user) {
              productDetails.alreadyCart = !!(await CartItem.findOne({
                product_id: selectProduct.id,
                user_id: req.user.id,
                type: selectProduct.type,
              }));
            } else {
              productDetails.alreadyCart = device_id
                ? !!(await CartItem.findOne({
                  product_id: selectProduct.id,
                  guest_user: device_id,
                  type: selectProduct.type,
                }))
                : false;
            }

            const variant = await InvertoryWithoutVarient.findOne(
              { itemId: selectProduct.id, itemType: selectProduct.type },
              "id item stock_quantity mrp selling_price discount_percent has_variant"
            ).lean();
            productDetails.without_variant = variant;

            const withVariant = await InventoryWithVarient.find(
              { modelId: selectProduct.id, modelType: selectProduct.type },
              "id modelType modelId image mrp selling_price discount_percent"
            ).lean();
            productDetails.with_variant = withVariant;

            filteredProducts.push(productDetails);
          }
        }

        homePageKey.section_twentyone.select_product = filteredProducts;
      }

      return handleResponse(200, "success", homePageKey, resp);
    } catch (err) {
      console.log("err", err);
      return handleResponse(500, "Internal Server Error", err.message, resp);
    }
  };
}

export default HomePageController;
