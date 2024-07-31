import Medicine from "../../src/models/adminModel/MedicineModel.js";
import handleResponse from "../../config/http-response.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import Tags from "../../src/models/adminModel/Tags.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
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
import Uses from "../../src/models/adminModel/UsesModel.js";
import Form from "../../src/models/adminModel/FormModel.js";
import CartItem from "../../src/models/adminModel/CartItemModel.js";

// fetch all products type with their variants

let fetchProducts = async (query, collectionName, skip, limitNumber) => {
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

  const products = await Collection.find(query)
    .sort({ id: -1 })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  for (const item of products) {
    const variant = await InvertoryWithoutVarient.findOne(
      { "itemId": item.id, "itemType": item.type },
      "id item stock_quantity mrp selling_price discount_percent stock_quantity"
    ).lean();

    item.without_variant = variant;

    const withVariant = await InventoryWithVarient.find(
      { modelId: item.id, modelType: item.type },
      "id modelType modelId image mrp selling_price discount_percent stock_quantity"
    ).lean();

    item.with_variant = withVariant;
    if (typeof item.form !== "string") {
      item.form = await Form.findOne({ id: item.form }).lean();
    }
  }

  return products;
};

// fetch category trending products

async function fetchCategoryTrend(items) {
  if (!items || items.length === 0) return [];

  const promises = items.map(async (item) => {
    let type;
    if (item.type === "Product") {
      type = "product";
    } else if (item.type === "Medicine") {
      type = "medicine";
    } else {
      type = "surgical";
    }

    // Fetch the detailed product information
    return fetchProducts({ id: item.id }, type);
  });

  return (await Promise.all(promises)).flat();
}

class HomeController {
  static SingleMedicine = async (req, res) => {
    const { slug } = req.params;
    const user = req.user;
    const device_id = req.headers.device;

    try {
      const medicine = await Medicine.findOne({ slug }).lean();
      if (!medicine) {
        return handleResponse(404, "Not Found", {}, res);
      }

      if (req.user) {
        medicine.alreadyCart = !!(await CartItem.findOne({
          product_id: medicine.id,
          user_id: user.id,
          type: medicine.type,
        }));
      } else {
        medicine.alreadyCart = device_id
          ? !!(await CartItem.findOne({
              product_id: medicine.id,
              guest_user: device_id,
              type: medicine.type,
            }))
          : false;
      }


      const variant = await InvertoryWithoutVarient.findOne(
        { "itemId": medicine.id, "itemType": medicine.type },
        "id item stock_quantity mrp selling_price discount_percent"
      ).lean();

      medicine.without_variant = variant;

      const withVariant = await InventoryWithVarient.find(
        { modelId: medicine.id, modelType: medicine.type },
        "id modelType modelId image mrp selling_price stock_quantity  discount_percent attribute attribute_value"
      ).lean();

      medicine.with_variant = withVariant;

      if (typeof medicine.form !== "string") {
        medicine.form = await Form.findOne({ id: medicine.form }).lean();
      }

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
          { "itemId": item.id, "itemType": item.type },
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

      // substitute product
      if (medicine.substitute_product) {
        const sub = await fetchProducts(
          { id: { $in: medicine.substitute_product } },
          "medicine"
        );

        medicine.substitute_product = sub;

        for (const item of sub) {
          item.marketer = await Marketer.findOne({ id: item.marketer });
        }
      }

      return handleResponse(200, "Single Medicine", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static allMedicine = async (req, res) => {
    try {
      const { searchName, page = 1, limit = 10 } = req.query;
      let query = {};

      if (searchName) {
        query.product_name = new RegExp(`^${searchName}`, "i");
      }

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Calculate the number of documents to skip
      const skip = (pageNumber - 1) * limitNumber;

      console.log(skip);
      // Fetch total count for pagination
      const Count = await fetchProducts(query, "medicine"); // Assuming you have a function to get the count

      const totalCount = Count.length;

      const user = req.user;
      const device_id = req.headers.device;

      // Fetch paginated results
      let medicine = await fetchProducts(query, "medicine", skip, limitNumber);

      for (const item of medicine) {
        if (req.user) {
          item.alreadyCart = !!(await CartItem.findOne({
            product_id: item.id,
            user_id: user.id,
            type: item.type,
          }));
        } else {
          item.alreadyCart = device_id
            ? !!(await CartItem.findOne({
                product_id: item.id,
                guest_user: device_id,
                type: item.type,
              }))
            : false;
        }

        if (item.substitute_product) {
          const sub = await fetchProducts(
            { id: { $in: item.substitute_product } },
            "medicine"
          );

          item.substitute_product = sub;
        }
      }

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limitNumber);

      // Create the response object with pagination info
      const response = {
        data: medicine,
        pagination: {
          totalItems: totalCount,
          totalPages: totalPages,
          currentPage: pageNumber,
          itemsPerPage: limitNumber,
        },
      };

      return handleResponse(200, "All Medicine", response, res);
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
      const mapResults = async (results, type) => {
        const mappedResults = await Promise.all(
          results.map(async (item) => {
            const form = type !== "category" ? await Form.findOne({ id: item.form }) : null;
            return {
              id: item.id,
              name: type === "category" ? item.category_name : item.product_name,
              form: form,
              type: type,
              slug: item.slug,
            };
          })
        );
        return mappedResults;
      };

      // Combine all results into the names array
      const names = [
        ...(await mapResults(categoryResults, "category")),
        ...(await mapResults(productResults, "product")),
        ...(await mapResults(medicineResults, "medicine")),
        ...(await mapResults(surgicalResults, "surgical")),
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

      if (form && form.length > 0) {
        query.form = { $in: JSON.parse(form) };
      }

      if (uses && uses.length > 0) {
        query.uses = { $in: JSON.parse(uses) };
      }

      if (age && age.length > 0) {
        query.age = { $in: age };
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
    const user = req.user;
    const device_id = req.headers.device;

    try {
      const medicine = await Product.findOne({ slug }).lean();
      if (!medicine) {
        return handleResponse(404, "Not Found", {}, res);
      }

      if (req.user) {
        medicine.alreadyCart = !!(await CartItem.findOne({
          product_id: medicine.id,
          user_id: user.id,
          type: medicine.type,
        }));
      } else {
        medicine.alreadyCart = device_id
          ? !!(await CartItem.findOne({
              product_id: medicine.id,
              guest_user: device_id,
              type: medicine.type,
            }))
          : false;
      }

      const variant = await InvertoryWithoutVarient.findOne(
        { "itemId": medicine.id, "itemType": medicine.type },
        "id item stock_quantity mrp selling_price discount_percent stock_quantity"
      ).lean();

      medicine.without_variant = variant;

      const withVariant = await InventoryWithVarient.find(
        { modelId: medicine.id, modelType: medicine.type },
        "id modelType modelId image mrp selling_price stock_quantity discount_percent attribute attribute_value"
      ).lean();

      medicine.with_variant = withVariant;

      if (typeof medicine.form !== "string") {
        medicine.form = await Form.findOne({ id: medicine.form }).lean();
      }

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
          { "itemId": item.id, "itemType": item.type },
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
          { "itemId": item.id, "itemType": item.type },
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
    const user = req.user;
    const device_id = req.headers.device;

    try {
      const medicine = await Sergical_Equipment.findOne({ slug }).lean();
      if (!medicine) {
        return handleResponse(404, "Not Found", {}, res);
      }

      if (req.user) {
        medicine.alreadyCart = !!(await CartItem.findOne({
          product_id: medicine.id,
          user_id: user.id,
          type: medicine.type,
        }));
      } else {
        medicine.alreadyCart = device_id
          ? !!(await CartItem.findOne({
              product_id: medicine.id,
              guest_user: device_id,
              type: medicine.type,
            }))
          : false;
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
      let spotlight;
      let topDeals;
      let topProducts;
      let trendingProduct;
      const {
        brand,
        priceTo,
        priceFrom,
        form,
        uses,
        age,
        page = 1,
        limit = 10,
        sortBy,
      } = req.query;

      const category = await Category.findOne({ slug: slug }).lean();

      if (category) {
        category.brand = await Brand.find().sort({ id: -1 });
        category.subCategories = await Category.find({
          parent_category: category.id,
        });

        // Fetch spotlight products
        spotlight = await fetchCategoryTrend(category.spotlight);
        category.spotlight = spotlight;

        // Fetch suggested products
        topDeals = await fetchCategoryTrend(category.top_deals);
        category.suggested_products = topDeals;

        // Fetch top products
        topProducts = await fetchCategoryTrend(category.top_product);
        category.top_product = topProducts;

        // Fetch trending products
        trendingProduct = await fetchCategoryTrend(category.trending_product);
        category.trending_product = trendingProduct;

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

        if (form && form.length > 0) {
          query.form = { $in: JSON.parse(form) };
        }

        if (uses && uses.length > 0) {
          query.uses = { $in: JSON.parse(uses) };
        }

        if (age && age.length > 0) {
          query.age = { $in: age };
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

        for (const medicine of finalProducts) {
          // Calculate total reviews
          medicine.reviews = await Review.find(
            { product: medicine.id, modelType: medicine.type },
            "id modelType product customer star_rating image youtube_video_link text_content createdAt "
          ).lean();

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
        }

        if (sortBy) {
          switch (sortBy) {
            case "priceLowToHigh":
              finalProducts.sort((a, b) => {
                let priceA = a.without_variant
                  ? parseFloat(a.without_variant.selling_price)
                  : a.with_variant && a.with_variant.length > 0
                  ? parseFloat(a.with_variant[0].selling_price)
                  : 0;
                let priceB = b.without_variant
                  ? parseFloat(b.without_variant.selling_price)
                  : b.with_variant && b.with_variant.length > 0
                  ? parseFloat(b.with_variant[0].selling_price)
                  : 0;
                return priceA - priceB;
              });
              break;
            case "priceHighToLow":
              finalProducts.sort((a, b) => {
                let priceA = a.without_variant
                  ? parseFloat(a.without_variant.selling_price)
                  : a.with_variant && a.with_variant.length > 0
                  ? parseFloat(a.with_variant[0].selling_price)
                  : 0;
                let priceB = b.without_variant
                  ? parseFloat(b.without_variant.selling_price)
                  : b.with_variant && b.with_variant.length > 0
                  ? parseFloat(b.with_variant[0].selling_price)
                  : 0;
                return priceB - priceA;
              });
              break;
            case "averageRating":
              finalProducts.sort((a, b) => b.average_rating - a.average_rating);
              break;
            case "newest":
              finalProducts.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              break;
            default:
              break;
          }
        }

        // Apply pagination
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const paginatedProducts = finalProducts.slice(skip, skip + limitNumber);
        const totalCount = finalProducts.length;
        const totalPages = Math.ceil(totalCount / limitNumber);

        const data = {
          category: category,
          products: paginatedProducts,
          pagination: {
            totalItems: totalCount,
            totalPages: totalPages,
            currentPage: pageNumber,
            itemsPerPage: limitNumber,
          },
        };

        return handleResponse(200, "product fetched", data, res);
      }

      return handleResponse(404, "Products not found", [], res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  // get coupon
  static GetCoupon = async (req, resp) => {
    try {
      const allCoupons = await Coupons.find();
      const updates = [];

      for (const coupon of allCoupons) {
        const currentDate = moment().startOf("day");
        const expireyDate = moment(coupon.expirey_date, "DD-MM-YYYY").startOf(
          "day"
        );

        if (expireyDate <= currentDate) {
          if (!coupon.isExpired) {
            coupon.isExpired = true;
            updates.push(coupon.save());
          }
        }
      }
      await Promise.all(updates);

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

  static SingleBrand = async (req, res) => {
    const { slug } = req.params;
    let top_deals;
    const {
      priceTo,
      priceFrom,
      form,
      uses,
      age,
      page = 1,
      limit = 10,
      sortBy,
    } = req.query;

    try {
      const brand = await Brand.findOne({ slug: slug }).lean();

      if (!brand) {
        return handleResponse(404, "Brand not found", {}, res);
      }

      // Fetch top_deals products
      top_deals = await fetchCategoryTrend(brand.top_deals);
      brand.top_deals = top_deals;

      let query = {
        brand: brand.id,
      };

      if (Array.isArray(form) && form.length > 0) {
        query.form = { $in: JSON.parse(form) };
      }

      if (Array.isArray(uses) && uses.length > 0) {
        query.uses = { $in: JSON.parse(uses) };
      }

      if (Array.isArray(age) && age.length > 0) {
        query.age = { $in: age };
      }

      let products = await fetchProducts(query, "product");

      let medicines = await fetchProducts(query, "medicine");

      let finalProducts = [...medicines, ...products];

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

      let category = [];
      let addedCategoryIds = new Set();

      for (const medicine of finalProducts) {
        // Calculate total reviews
        medicine.reviews = await Review.find(
          { product: medicine.id, modelType: medicine.type },
          "id modelType product customer star_rating image youtube_video_link text_content createdAt"
        ).lean();
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

        // medicine.form = await Form.findOne({id:medicine.form});

        const categories = await Category.find({
          id: { $in: medicine.category },
        });
        for (const cat of categories) {
          if (!addedCategoryIds.has(cat.id)) {
            category.push(cat);
            addedCategoryIds.add(cat.id);
          }
        }
      }

      if (sortBy) {
        switch (sortBy) {
          case "priceLowToHigh":
            finalProducts.sort((a, b) => {
              let priceA = a.without_variant
                ? parseFloat(a.without_variant.selling_price)
                : a.with_variant && a.with_variant.length > 0
                ? parseFloat(a.with_variant[0].selling_price)
                : 0;
              let priceB = b.without_variant
                ? parseFloat(b.without_variant.selling_price)
                : b.with_variant && b.with_variant.length > 0
                ? parseFloat(b.with_variant[0].selling_price)
                : 0;
              return priceA - priceB;
            });
            break;
          case "priceHighToLow":
            finalProducts.sort((a, b) => {
              let priceA = a.without_variant
                ? parseFloat(a.without_variant.selling_price)
                : a.with_variant && a.with_variant.length > 0
                ? parseFloat(a.with_variant[0].selling_price)
                : 0;
              let priceB = b.without_variant
                ? parseFloat(b.without_variant.selling_price)
                : b.with_variant && b.with_variant.length > 0
                ? parseFloat(b.with_variant[0].selling_price)
                : 0;
              return priceB - priceA;
            });
            break;
          case "averageRating":
            finalProducts.sort((a, b) => b.average_rating - a.average_rating);
            break;
          case "newest":
            finalProducts.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;
          default:
            break;
        }
      }

      // Apply pagination
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const skip = (pageNumber - 1) * limitNumber;

      const paginatedProducts = finalProducts.slice(skip, skip + limitNumber);
      const totalCount = finalProducts.length;
      const totalPages = Math.ceil(totalCount / limitNumber);

      const data = {
        brand: brand,
        category: category,
        products: paginatedProducts,
        pagination: {
          totalItems: totalCount,
          totalPages: totalPages,
          currentPage: pageNumber,
          itemsPerPage: limitNumber,
        },
      };

      return handleResponse(200, "product fetched", data, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  //all uses
  static GetAllUses = async (req, resp) => {
    try {
      const allUses = await Uses.find().sort({ createdAt: -1 });
      if (!allUses) {
        return handleResponse(404, "No uses found.", {}, resp);
      }

      const filteredUses = allUses.filter((item) => item.deleted_at === null);
      if (filteredUses.length < 0) {
        return handleResponse(200, "No Uses Available", {}, resp);
      }

      for (const key of filteredUses) {
        if (key.created_by) {
          const userData = await User.findOne({ id: key.created_by });
          key.created_by = userData;
        }
      }

      return handleResponse(
        200,
        "Uses Fetched Successsfully",
        filteredUses,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // all forms

  static GetAllForm = async (req, resp) => {
    try {
      const allUses = await Form.find().sort({ createdAt: -1 });
      if (!allUses) {
        return handleResponse(404, "No form found.", {}, resp);
      }

      const filteredUses = allUses.filter((item) => item.deleted_at === null);
      if (filteredUses.length < 0) {
        return handleResponse(200, "No Form Available", {}, resp);
      }

      for (const key of filteredUses) {
        if (key.created_by) {
          const userData = await User.findOne({ id: key.created_by });
          key.created_by = userData;
        }
      }

      return handleResponse(
        200,
        "Form Fetched Successsfully",
        filteredUses,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default HomeController;
