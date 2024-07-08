import Medicine from "../../src/models/adminModel/MedicineModel.js";
import handleResponse from "../../config/http-response.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import Tags from "../../src/models/adminModel/Tags.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import { query } from "express";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Review from "../../src/models/adminModel/ReviewsModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import moment from "moment";
import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import Coupons from "../../src/models/adminModel/CouponsModel.js";
import SalesBanner from "../../src/models/adminModel/SalesBanner.js";
import CustomFiled from "../../src/models/adminModel/CustomField.js";
import CustomFiledValue from "../../src/models/adminModel/CustomFieldValue.js";

class HomeController {
  static SingleMedicine = async (req, res) => {
    const { slug } = req.params;

    try {
      const medicine = await Medicine.findOne({ slug }).lean();
      if (!medicine) {
        return handleResponse(404, "Not Found", {}, res);
      }

      const variant = await InvertoryWithoutVarient.findOne(
        { "item.itemId": medicine.id, "item.itemType": medicine.type },
        "id item stock_quantity mrp selling_price discount_percent"
      ).lean();

      medicine.without_variant = variant;

      const withVariant = await InventoryWithVarient.find(
        { modelId: medicine.id, modelType: medicine.type },
        "id modelType modelId image mrp selling_price stock_quantity  discount_percent attribute attribute_value"
      ).lean();

      medicine.with_variant = withVariant;

      const tags = await Tags.find(
        {
          id: { $in: medicine.tags },
        },
        "id name"
      );

      medicine.tags = tags;

      const linked_items = await Medicine.find(
        {
          id: { $in: medicine.linked_items },
        },
        "id product_name featured_image slug hsn_code generic_name prescription_required type has_variant"
      ).lean();

      medicine.linked_items = linked_items;

      for (const item of linked_items) {
        const variant = await InvertoryWithoutVarient.findOne(
          { "item.itemId": item.id, "item.itemType": item.type },
          "id item stock_quantity mrp selling_price discount_percent stock_quantity"
        ).lean();
        item.without_variant = variant;

        const withVariant = await InventoryWithVarient.find(
          { modelId: item.id, modelType: item.type },
          "id modelType modelId image mrp selling_price discount_percent stock_quantity"
        ).lean();
        item.with_variant = withVariant;
      }

      medicine.reviews = await Review.find(
        { product: medicine.id, modelType: medicine.type },
        "id modelType product customer star_rating image youtube_video_link text_content createdAt "
      ).lean();

      for (const item of medicine.reviews) {
        let user = await User.findOne({ id: item.customer }, "id name email");
        let created_at = moment(item.createdAt).fromNow();
        item.customer = user;
        item.createdAt = created_at;
      }

      medicine.brand = await Brand.findOne({ id: medicine.brand });
      medicine.marketer = await Marketer.findOne({ id: medicine.marketer });

      // Calculate total reviews
      medicine.total_reviews = medicine.reviews.length;

      // Calculate average rating
      if (medicine.total_reviews > 0) {
        let sum_of_ratings = medicine.reviews.reduce(
          (sum, review) => sum + review.star_rating,
          0
        );
        medicine.average_rating = sum_of_ratings / medicine.total_reviews;
      } else {
        medicine.average_rating = 0; // Handle case where there are no reviews
      }

      // Attributes & their values

      if (medicine.with_variant.length > 0) {
        const attributes = await CustomFiled.find({
          id: { $in: medicine.with_variant[0].attribute },
        }).lean();

        for (const item of attributes) {
          item.attribute_value = await CustomFiledValue.find({
            custom_id: item._id,
          }).lean();
        }

        medicine.customFields = attributes;
      }

      return handleResponse(200, "Single Medicine", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static allMedicine = async (req, res) => {
    try {
      const { searchName } = req.query;
      let query = {};

      if (searchName) {
        query.product_name = new RegExp(`^${searchName}`, "i");
      }
      let medicine = await fetchProducts(query, "medicine");

      for (const item of medicine) {
        const sub = await fetchProducts(
          { id: { $in: item.substitute_product } },
          "medicine"
        );

        item.substitute_product = sub;
      }

      return handleResponse(200, "All Medicine", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  // mega Menu

  static GetMenu = async (req, resp) => {
    try {
      const parentcategory = await Category.find(
        { parent_category: null, is_megamenu: true, deleted_at: null },
        "id category_name thumbnail_image slug parent_category is_megamenu"
      ).lean();

      const getChildren = async (categoryId) => {
        const children = await Category.find(
          { parent_category: categoryId, deleted_at: null },
          "id category_name thumbnail_image slug parent_category is_megamenu"
        ).lean();

        // Extract the category IDs
        const categoryIds = children.map((child) => child.id.toString());

        const products = await Medicine.find(
          { category: { $in: categoryIds } },
          "id product_name slug featured_image "
        ).lean();

        const childrenWithProducts = children.map((child) => ({
          ...child,
          products: products.filter(
            (product) => product.category === child.id.toString()
          ),
        }));

        // Recursively fetch grandchildren
        const childrencategory = await Promise.all(
          childrenWithProducts.map(async (child) => {
            const grandchildren = await getChildren(child.id);
            return {
              ...child,
              children: grandchildren,
              products: products,
            };
          })
        );

        return childrencategory;
      };

      const categoryWithChildren = await Promise.all(
        parentcategory.map(async (parentCategory) => {
          const childrencategory = await getChildren(parentCategory.id);

          return {
            label: parentCategory,
            children: childrencategory,
          };
        })
      );

      return handleResponse(
        200,
        "Data Fetch Successfully",
        categoryWithChildren,
        resp
      );
    } catch (error) {
      console.error(error);
      return handleResponse(500, error.message, {}, resp);
    }
  };

  // search auto complete

  static SearchAutoComplete = async (req, res) => {
    try {
      let { search } = req.query;

      const searchRegex = new RegExp(search, "i");

      const [
        categoryResults,
        productResults,
        medicineResults,
        surgicalResults,
      ] = await Promise.all([
        Category.find({ category_name: searchRegex }),
        Product.find({ product_name: searchRegex }),
        Medicine.find({ product_name: searchRegex }),
        Sergical_Equipment.find({ product_name: searchRegex }),
      ]);

      // Function to map results to the desired format
      const mapResults = (results, type) => {
        return results.map((item) => ({
          id: item.id,
          name: type === "category" ? item.category_name : item.product_name,
          form: type !== "category" ? item.form : null,
          type: type,
          slug: item.slug,
        }));
      };

      // Combine all results into the names array
      const names = [
        ...mapResults(categoryResults, "category"),
        ...mapResults(productResults, "product"),
        ...mapResults(medicineResults, "medicine"),
        ...mapResults(surgicalResults, "surgical"),
      ];

      return handleResponse(200, "data fetched", names, res);
    } catch (error) {
      console.error(error);
      return handleResponse(500, error.message, {}, res);
    }
  };

  // search all product
  static SearchProducts = async (req, res) => {
    try {
      const { search, priceTo, priceFrom, brand, form, uses, categories, age } =
        req.query;
      let category = await Category.find({
        category_name: new RegExp(search, "i"),
      });

      let categoryIds = category.map((child) => child.id.toString());

      let combinedCategoryIds = categoryIds;

      if (categories && categories.length > 0) {
        const parsedCategories = JSON.parse(categories).map(String);
        combinedCategoryIds = [
          ...new Set([...categoryIds, ...parsedCategories]),
        ]; // Combine and remove duplicates
      }

      let query = {
        $or: [
          { product_name: new RegExp(search, "i") },
          { category: { $in: combinedCategoryIds } },
        ],
      };

      if (brand && brand.length > 0) {
        const parsedBrandArray = JSON.parse(brand)
          .map(Number)
          .filter((num) => !isNaN(num));
        if (parsedBrandArray.length > 0) {
          query.brand = { $in: parsedBrandArray };
        }
      }

      if (form) {
        query.form = form;
      }

      if (uses) {
        query.uses = uses;
      }

      if (age && !isNaN(age)) {
        query.age = age;
      }

      let products = await fetchProducts(query, "product");

      let medicines = await fetchProducts(query, "medicine");

      let surgicals = await fetchProducts(
        {
          product_name: new RegExp(search, "i"),
        },
        "surgical"
      );

      let finalProducts = [...surgicals, ...medicines, ...products];

      if (finalProducts.length > 0 && (priceFrom || priceTo)) {
        finalProducts = finalProducts.filter((product) => {
          let price = 0;
          if (product.without_variant) {
            price = parseFloat(product.without_variant.selling_price);
          } else if (product.with_variant && product.with_variant.length > 0) {
            price = parseFloat(product.with_variant[0].selling_price);
          }

          if (priceFrom && price < parseFloat(priceFrom)) {
            return false;
          }

          if (priceTo && price > parseFloat(priceTo)) {
            return false;
          }

          return true;
        });
      }

      return handleResponse(200, "Data Fetch Successfully", finalProducts, res);
    } catch (error) {
      console.error(error);
      return handleResponse(500, error.message, {}, res);
    }
  };

  //  search product by cat & brand | concern

  static SearchByCatBrand = async (req, res) => {
    try {
      const { category, brand, concern } = req.query;

      // let cat = await Category.find({
      //   id: category,
      // });

      // let categoryIds = cat.map((child) => child.id.toString());

      const products = await fetchProducts(
        {
          category: { $in: category },
          brand: brand,
        },
        "product"
      );

      return handleResponse(200, "Data Fetch Successfully", products, res);
    } catch (error) {
      console.error(error);
      return handleResponse(500, error.message, {}, res);
    }
  };

  // single Product

  static SingleProduct = async (req, res) => {
    const { slug } = req.params;

    try {
      const medicine = await Product.findOne({ slug }).lean();
      if (!medicine) {
        return handleResponse(404, "Not Found", {}, res);
      }

      const variant = await InvertoryWithoutVarient.findOne(
        { "item.itemId": medicine.id, "item.itemType": medicine.type },
        "id item stock_quantity mrp selling_price discount_percent stock_quantity"
      ).lean();

      medicine.without_variant = variant;

      const withVariant = await InventoryWithVarient.find(
        { modelId: medicine.id, modelType: medicine.type },
        "id modelType modelId image mrp selling_price stock_quantity discount_percent attribute attribute_value"
      ).lean();

      medicine.with_variant = withVariant;

      const tags = await Tags.find(
        {
          id: { $in: medicine.tags },
        },
        "id name"
      );

      medicine.tags = tags;

      const linked_items = await Product.find(
        {
          id: { $in: medicine.linked_items },
        },
        "id product_name featured_image slug hsn_code generic_name prescription_required type has_variant"
      ).lean();

      medicine.linked_items = linked_items;

      for (const item of linked_items) {
        const variant = await InvertoryWithoutVarient.findOne(
          { "item.itemId": item.id, "item.itemType": item.type },
          "id item stock_quantity mrp selling_price discount_percent stock_quantity"
        ).lean();
        item.without_variant = variant;

        const withVariant = await InventoryWithVarient.find(
          { modelId: item.id, modelType: item.type },
          "id modelType modelId image mrp selling_price discount_percent stock_quantity"
        ).lean();
        item.with_variant = withVariant;
      }

      // reviews
      medicine.reviews = await Review.find(
        { product: medicine.id, modelType: medicine.type },
        "id modelType product customer star_rating image youtube_video_link text_content createdAt"
      ).lean();

      for (const item of medicine.reviews) {
        let user = await User.findOne({ id: item.customer }, "id name email");
        let created_at = moment(item.createdAt).fromNow();
        item.customer = user;
        item.createdAt = created_at;
      }

      medicine.brand = await Brand.findOne({ id: medicine.brand });
      medicine.marketer = await Marketer.findOne({ id: medicine.marketer });

      // Calculate total reviews
      medicine.total_reviews = medicine.reviews.length;

      // Calculate average rating
      if (medicine.total_reviews > 0) {
        let sum_of_ratings = medicine.reviews.reduce(
          (sum, review) => sum + review.star_rating,
          0
        );
        medicine.average_rating = sum_of_ratings / medicine.total_reviews;
      } else {
        medicine.average_rating = 0; // Handle case where there are no reviews
      }

      // Initialize counters for each star rating
      let star_counts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      // Count each star rating
      medicine.reviews.forEach((review) => {
        if (review.star_rating >= 1 && review.star_rating <= 5) {
          star_counts[review.star_rating]++;
        }
      });

      // Calculate percentages for each star rating
      let star_percentages = {};
      for (let star = 1; star <= 5; star++) {
        star_percentages[star] =
          (star_counts[star] / medicine.total_reviews) * 100;
      }

      medicine.star_percentages = star_percentages;

      // Attributes & their values

      if (medicine.with_variant.length > 0) {
        const attributes = await CustomFiled.find({
          id: { $in: medicine.with_variant[0].attribute },
        }).lean();

        for (const item of attributes) {
          item.attribute_value = await CustomFiledValue.find({
            custom_id: item._id,
          }).lean();
        }

        medicine.customFields = attributes;
      }

      // related products

      const relatedProducts = await Product.find(
        { category: { $in: medicine.category }, _id: { $ne: medicine._id } },
        "id product_name featured_image slug hsn_code generic_name prescription_required type has_variant"
      ).lean();

      for (const item of relatedProducts) {
        const variant = await InvertoryWithoutVarient.findOne(
          { "item.itemId": item.id, "item.itemType": item.type },
          "id item stock_quantity mrp selling_price discount_percent stock_quantity"
        ).lean();
        item.without_variant = variant;

        const withVariant = await InventoryWithVarient.find(
          { modelId: item.id, modelType: item.type },
          "id modelType modelId image mrp selling_price discount_percent stock_quantity"
        ).lean();
        item.with_variant = withVariant;
      }

      medicine.frequently_bought = relatedProducts;

      medicine.categories = await Category.find({
        id: { $in: medicine.category },
      });

      handleResponse(200, "Single General Product", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  // single Surgical Product

  static SingleSurgical = async (req, res) => {
    const { slug } = req.params;

    try {
      const medicine = await Sergical_Equipment.findOne({ slug }).lean();
      if (!medicine) {
        return handleResponse(404, "Not Found", {}, res);
      }

      const variant = await InvertoryWithoutVarient.findOne(
        { itemId: medicine.id, itemType: medicine.type },
        "id item stock_quantity mrp selling_price discount_percent"
      ).lean();

      medicine.without_variant = variant;

      const linked_items = await Sergical_Equipment.find(
        {
          id: { $in: medicine.linked_items },
        },
        "id product_name featured_image slug hsn_code generic_name prescription_required type has_variant"
      ).lean();
      medicine.linked_items = linked_items;

      for (const item of linked_items) {
        const variant = await InvertoryWithoutVarient.findOne(
          { itemId: item.id, itemType: item.type },
          "id item stock_quantity mrp selling_price discount_percent stock_quantity"
        ).lean();
        item.without_variant = variant;

        const withVariant = await InventoryWithVarient.find(
          { modelId: item.id, modelType: item.type },
          "id modelType modelId image mrp selling_price discount_percent stock_quantity"
        ).lean();
        item.with_variant = withVariant;
      }

      // reviews
      medicine.reviews = await Review.find(
        { product: medicine.id, modelType: medicine.type },
        "id modelType product customer star_rating image youtube_video_link text_content createdAt"
      ).lean();

      for (const item of medicine.reviews) {
        let user = await User.findOne({ id: item.customer }, "id name email");
        let created_at = moment(item.createdAt).fromNow();
        item.customer = user;
        item.createdAt = created_at;
      }

      medicine.brand = await Brand.findOne({ id: medicine.brand });
      medicine.marketer = await Marketer.findOne({ id: medicine.marketer });

      // Calculate total reviews
      medicine.total_reviews = medicine.reviews.length;

      // Calculate average rating
      if (medicine.total_reviews > 0) {
        let sum_of_ratings = medicine.reviews.reduce(
          (sum, review) => sum + review.star_rating,
          0
        );
        medicine.average_rating = sum_of_ratings / medicine.total_reviews;
      } else {
        medicine.average_rating = 0; // Handle case where there are no reviews
      }

      // Initialize counters for each star rating
      let star_counts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      // Count each star rating
      medicine.reviews.forEach((review) => {
        if (review.star_rating >= 1 && review.star_rating <= 5) {
          star_counts[review.star_rating]++;
        }
      });

      // Calculate percentages for each star rating
      let star_percentages = {};
      for (let star = 1; star <= 5; star++) {
        star_percentages[star] =
          (star_counts[star] / medicine.total_reviews) * 100;
      }

      medicine.star_percentages = star_percentages;

      return handleResponse(200, "Single Surgical Product", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static SingleCategory = async (req, res) => {
    try {
      const { slug } = req.params;
      const { brand, priceTo, priceFrom, form, uses, age } = req.query;

      const category = await Category.findOne({ slug: slug }).lean();

      if (category) {
        category.brand = await Brand.find().sort({ id: -1 });
        category.subCategories = await Category.find({
          parent_category: category.id,
        });

        let query = {
          category: { $in: [category.id] },
        };

        if (brand && brand.length > 0) {
          const parsedBrandArray = JSON.parse(brand)
            .map(Number)
            .filter((num) => !isNaN(num));
          if (parsedBrandArray.length > 0) {
            query.brand = { $in: parsedBrandArray };
          }
        }

        if (form) {
          query.form = from;
        }

        if (uses) {
          query.uses = uses;
        }

        if (age && !isNaN(age)) {
          query.age = age;
        }

        let products = await fetchProducts(query, "product");

        let medicines = await fetchProducts(query, "medicine");

        let surgicals = await fetchProducts({}, "surgical");

        let finalProducts = [...surgicals, ...medicines, ...products];

        if (finalProducts.length > 0 && (priceFrom || priceTo)) {
          finalProducts = finalProducts.filter((product) => {
            let price = 0;
            if (product.without_variant) {
              price = parseFloat(product.without_variant.selling_price);
            } else if (
              product.with_variant &&
              product.with_variant.length > 0
            ) {
              price = parseFloat(product.with_variant[0].selling_price);
            }

            if (priceFrom && price < parseFloat(priceFrom)) {
              return false;
            }

            if (priceTo && price > parseFloat(priceTo)) {
              return false;
            }

            return true;
          });
        }


       const data = {
            category : category ,
            products : finalProducts
        }

        return handleResponse(200, "product fetched", data, res);
      }

      return handleResponse(200, "Products not found", [], res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  // get coupon
  static GetCoupon = async (req, resp) => {
    try {
      const coupons = await Coupons.find({
        status: true,
        number_coupon: { $gt: 0 },
      }).sort({
        createdAt: -1,
      });

      return handleResponse(200, "Coupon fetched successfully", coupons, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // Sales Banner

  static GetSalesBanner = async (req, resp) => {
    try {
      const banner = await SalesBanner.find({ status: true }).sort({ id: -1 });
      if (!banner) {
        return handleResponse(404, "Banner not found", {}, resp);
      }

      const allSalesBanner = await banner.filter(
        (banner) => banner.deleted_at === null
      );

      if (allSalesBanner.length == 0) {
        return handleResponse(200, "No Sales Banner data available", {}, resp);
      }
      return handleResponse(
        200,
        "Sales banner fetched successfully",
        allSalesBanner,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static GetBrand = async (req, resp) => {
    try {
      const { search } = req.query;
      const brand = await Brand.find({
        brand_name: new RegExp(search, "i"),
      }).sort({ createdAt: -1 });

      const allBrand = await brand.filter((brand) => brand.deleted_at === null);
      if (allBrand.length <= 0) {
        return handleResponse(200, "No Brand available.", {}, resp);
      }

      const count = allBrand.length;

      return handleResponse(200, "Brand fetched successfully", allBrand, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get category
  static GetCategories = async (req, resp) => {
    try {
      const { search } = req.query;

      const categories = await Category.find({
        category_name: new RegExp(search, "i"),
      }).sort({
        createdAt: -1,
      });

      const activeCategories = categories.filter(
        (category) => category.deleted_at === null
      );

      if (activeCategories.length == 0) {
        return handleResponse(200, "No Category data available.", {}, resp);
      }

      const count = activeCategories.length;

      return handleResponse(
        200,
        "Fetch Category successful",
        activeCategories,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

// fetch all products type with their variants

let fetchProducts = async (query, collectionName) => {
  const Collection =
    collectionName === "medicine"
      ? Medicine
      : collectionName === "product"
      ? Product
      : collectionName === "surgical"
      ? Sergical_Equipment
      : null;

  if (!Collection) {
    throw new Error("Invalid collection name");
  }

  const products = await Collection.find(query).sort({ id: -1 }).lean();

  for (const item of products) {
    const variant = await InvertoryWithoutVarient.findOne(
      { "item.itemId": item.id, "item.itemType": item.type },
      "id item stock_quantity mrp selling_price discount_percent stock_quantity"
    ).lean();

    item.without_variant = variant;

    const withVariant = await InventoryWithVarient.find(
      { modelId: item.id, modelType: item.type },
      "id modelType modelId image mrp selling_price discount_percent stock_quantity"
    ).lean();

    item.with_variant = withVariant;
  }

  return products;
};

export default HomeController;
