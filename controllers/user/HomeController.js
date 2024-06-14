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

let fetchProducts = async (query, searchField) => {
  const products = await Medicine.find(
    query,
    "id product_name featured_image status slug gallery_image hsn_code has_varient prescription_required indication packOf minimum_order_quantity short_description type category"
  )
    .sort({ id: -1 })
    .lean();

  for (const item of products) {
    const variant = await InvertoryWithoutVarient.findOne(
      { "item.itemId": item.id, "item.itemType": item.type },
      "id item stock_quantity mrp selling_price discount_percent"
    ).lean();

    item.without_variant = variant;

    const withVariant = await InventoryWithVarient.find(
      { modelId: item.id, modelType: item.type },
      "id modelType modelId image mrp selling_price discount_percent"
    ).lean();

    item.with_variant = withVariant;
  }

  return products;
};

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
        "id modelType modelId image mrp selling_price"
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
        "id product_name featured_image slug hsn_code generic_name prescription_required type"
      ).lean();

      medicine.linked_items = linked_items;

      for (const item of linked_items) {
        const variant = await InvertoryWithoutVarient.findOne(
          { "item.itemId": item.id, "item.itemType": item.type },
          "id item stock_quantity mrp selling_price discount_percent"
        ).lean();
        item.without_variant = variant;

        const withVariant = await InventoryWithVarient.find(
          { modelId: item.id, modelType: item.type },
          "id modelType modelId image mrp selling_price discount_percent"
        ).lean();
        item.with_variant = withVariant;
      }

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
          (sum, review) => sum + review.rating,
          0
        );
        medicine.average_rating = sum_of_ratings / medicine.total_reviews;
      } else {
        medicine.average_rating = 0; // Handle case where there are no reviews
      }

      return handleResponse(200, "Single Medicine", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static allMedicine = async (req, res) => {
    try {
      const { searchName } = req.query;
      // let medicine = await Medicine.find(
      //   { product_name: new RegExp(searchName, "i") },
      //   "id product_name featured_image status slug gallery_image hsn_code has_varient prescription_required indication packOf minimum_order_quantity  short_description type category"
      // )
      //   .sort({ _id: -1 })
      //   .lean();

      let medicine = await fetchProducts({
        product_name: new RegExp(searchName, "i"),
      });

      // for (const item of medicine) {
      //   if (item.has_varient) {
      //     const withVariant = await InventoryWithVarient.find(
      //       { modelId: item.id, modelType: item.type },
      //       "id modelType modelId image mrp selling_price"
      //     ).lean();
      //     item.with_variant = withVariant;
      //   } else {
      //     const variant = await InvertoryWithoutVarient.findOne(
      //       { "item.itemId": item.id, "item.itemType": item.type },
      //       "id item stock_quantity mrp selling_price discount_percent"
      //     ).lean();
      //     item.without_variant = variant;
      //   }
      // }

      return handleResponse(200, "All Medicine", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  // mega Menu

  static GetMenu = async (req, resp) => {
    try {
      const parentCategories = await Category.find(
        { parent_category: null, is_megamenu: true },
        "id category_name thumbnail_image slug parent_category is_megamenu"
      ).lean();

      const getChildren = async (categoryId) => {
        const children = await Category.find(
          { parent_category: categoryId },
          "id category_name thumbnail_image slug parent_category is_megamenu"
        ).lean();

        // Extract the category IDs
        const categoryIds = children.map((child) => child.id.toString());

        const products = await Medicine.find(
          { category: { $in: categoryIds } },
          "id product_name slug featured_image "
        ).lean();

        console.log(products);

        const childrenWithProducts = children.map((child) => ({
          ...child,
          products: products.filter(
            (product) => product.category === child.id.toString()
          ),
        }));

        // Recursively fetch grandchildren
        const childrenCategories = await Promise.all(
          childrenWithProducts.map(async (child) => {
            const grandchildren = await getChildren(child.id);
            return {
              ...child,
              children: grandchildren,
              products: products,
            };
          })
        );

        return childrenCategories;
      };

      const categoriesWithChildren = await Promise.all(
        parentCategories.map(async (parentCategory) => {
          const childrenCategories = await getChildren(parentCategory.id);

          return {
            label: parentCategory,
            children: childrenCategories,
          };
        })
      );

      return handleResponse(
        200,
        "Data Fetch Successfully",
        categoriesWithChildren,
        resp
      );
    } catch (error) {
      console.error(error);
      return handleResponse(500, error.message, {}, resp);
    }
  };

  // search all product
  static SearchProducts = async (req, res) => {
    try {
      let { search } = req.query;
      let products;

      let categories = await Category.find({
        category_name: new RegExp(search, "i"),
      });

      if (categories.length > 0) {
        let categoryIds = categories.map((child) => child.id.toString());
        products = await fetchProducts({ category: { $in: categoryIds } });
      } else {
        products = await fetchProducts({
          product_name: new RegExp(search, "i"),
        });
      }

      return handleResponse(200, "Data Fetch Successfully", products, res);
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

      const products = await fetchProducts({
        category: { $in: category },
        brand: brand,
      });

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
        "id item stock_quantity mrp selling_price discount_percent"
      ).lean();

      medicine.without_variant = variant;

      const withVariant = await InventoryWithVarient.find(
        { modelId: medicine.id, modelType: medicine.type },
        "id modelType modelId image mrp selling_price"
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
        "id product_name featured_image slug hsn_code generic_name prescription_required type"
      ).lean();

      medicine.linked_items = linked_items;

      for (const item of linked_items) {
        const variant = await InvertoryWithoutVarient.findOne(
          { "item.itemId": item.id, "item.itemType": item.type },
          "id item stock_quantity mrp selling_price discount_percent"
        ).lean();
        item.without_variant = variant;

        const withVariant = await InventoryWithVarient.find(
          { modelId: item.id, modelType: item.type },
          "id modelType modelId image mrp selling_price discount_percent"
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

      return handleResponse(200, "Single General Product", medicine, res);
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
        { "item.itemId": medicine.id, "item.itemType": medicine.type },
        "id item stock_quantity mrp selling_price discount_percent"
      ).lean();

      medicine.without_variant = variant;

      const linked_items = await Medicine.find(
        {
          id: { $in: medicine.linked_items },
        },
        "id product_name featured_image slug hsn_code generic_name prescription_required type"
      ).lean();
      medicine.linked_items = linked_items;

      for (const item of linked_items) {
        const variant = await InvertoryWithoutVarient.findOne(
          { "item.itemId": item.id, "item.itemType": item.type },
          "id item stock_quantity mrp selling_price discount_percent "
        ).lean();
        item.without_variant = variant;

        const withVariant = await InventoryWithVarient.find(
          { modelId: item.id, modelType: item.type },
          "id modelType modelId image mrp selling_price discount_percent"
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

      return handleResponse(200, "Single Surgical Product", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static SingleCategory = async (req, res) => {
    try {
      const { slug } = req.params;
      const { brand, priceTo, priceFrom } = req.query;
      console.log(slug);
      const category = await Category.findOne(
        { slug: slug },
        "id category_name thumbnail_image slug  is_megamenu"
      ).lean();

      let products = [];
      if (category) {
        let query = {
          category: { $in: [category.id.toString()] },
        };

        if (brand && brand.length > 0) {
          const parsedBrandArray = JSON.parse(brand)
            .map(Number)
            .filter((num) => !isNaN(num));
          if (parsedBrandArray.length > 0) {
            query.brand = { $in: parsedBrandArray };
          }
        }

        products = await fetchProducts(query);

        if (products.length > 0 && (priceFrom || priceTo)) {
          products = products.filter((product) => {
            let price = 0;
            if (product.without_variant) {
              price = parseFloat(product.without_variant.selling_price);
            } else {
              price = parseFloat(product.with_variant[0].selling_price);
            }

            if (priceFrom && price < parseFloat(priceFrom)) {
              console.log(`${price} is less than ${priceFrom}`);
              return false; // Filter out products below priceFrom
            }

            if (priceTo && price > parseFloat(priceTo)) {
              console.log(`${price} is greater than ${priceTo}`);
              return false; // Filter out products above priceTo
            }

            return true; // Include product in filtered list
          });
        }
      }

      return handleResponse(200, "product fetched", products, res);
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
}

export default HomeController;
