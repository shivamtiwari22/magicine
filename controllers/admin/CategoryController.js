import Category from "../../src/models/adminModel/CategoryModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class CategoryController {
  //add category
  static AddCategory = async (req, resp) => {
    try {
      const user = req.user;
      const images = req.files;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const {
        thumbnail_image,
        banner_img_center_one,
        banner_img_center_two,
        banner_img_center_three,
        banner_img_center_four,
        banner_image_left_one,
        banner_image_left_two,
        spotlight,
        top_deals,
        trending_product,
        top_product,
        ...categoryData
      } = req.body;


      const parseJsonField = (field) => {
        try {
          return Array.isArray(field) ? field.map(JSON.parse) : JSON.parse(field);
        } catch (error) {
          console.error("Failed to parse JSON field:", error);
          return field;
        }
      };


      const parsedSpotlight = parseJsonField(spotlight);
      const parsedTopDeals = parseJsonField(top_deals);
      const parsedTrendingProduct = parseJsonField(trending_product);
      const parsedTopProduct = parseJsonField(top_product);


      const existingCategory = await Category.findOne({
        category_name: categoryData.category_name,
      });
      if (existingCategory) {
        return handleResponse(409, "This category already exists.", {}, resp);
      }

      const newCategory = new Category({
        ...categoryData,
        spotlight: parsedSpotlight,
        top_deals: parsedTopDeals,
        trending_product: parsedTrendingProduct,
        top_product: parsedTopProduct,
        created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}`;

      if (images) {
        if (images.thumbnail_image) {
          newCategory.thumbnail_image = `${base_url}/${images.thumbnail_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_one) {
          newCategory.banner_img_center_one = `${base_url}/${images.banner_img_center_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_two) {
          newCategory.banner_img_center_two = `${base_url}/${images.banner_img_center_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_three) {
          newCategory.banner_img_center_three = `${base_url}/${images.banner_img_center_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_four) {
          newCategory.banner_img_center_four = `${base_url}/${images.banner_img_center_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_image_left_one) {
          newCategory.banner_image_left_one = `${base_url}/${images.banner_image_left_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_image_left_two) {
          newCategory.banner_image_left_two = `${base_url}/${images.banner_image_left_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
      }
      if (categoryData.parent_category == "null") {
        newCategory.parent_category = null;
      }

      await newCategory.save();
      return handleResponse(
        201,
        "Category created successfully.",
        { newCategory },
        resp
      );
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

  //get category
  static GetCategories = async (req, resp) => {
    try {
      const categories = await Category.find().sort({
        createdAt: -1,
      });

      const activeCategories = categories.filter(
        (category) => category.deleted_at === null
      );

      if (activeCategories.length == 0) {
        return handleResponse(200, "No Category data available.", {}, resp);
      }

      for (const category of activeCategories) {
        if (category.parent_category) {
          const parentCategory = await Category.findOne({
            id: category.parent_category,
          });
          category.parent_category = parentCategory;
        }
        if (category.created_by) {
          const createdBy = await User.findOne({
            id: category.created_by,
          });
          category.created_by = createdBy;
        }
      }

      return handleResponse(
        200,
        "Fetch Category successful",
        { activeCategories },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //update category
  static UpdateCategory = async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, res);
      }

      const { id } = req.params;
      const images = req.files;
      const {
        thumbnail_image,
        banner_img_center_one,
        banner_img_center_two,
        banner_img_center_three,
        banner_img_center_four,
        banner_image_left_one,
        banner_image_left_two,
        spotlight,
        top_deals,
        trending_product,
        top_product,
        ...categoryData
      } = req.body;



      const parseJsonField = (field) => {
        try {
          return Array.isArray(field) ? field.map(JSON.parse) : JSON.parse(field);
        } catch (error) {
          console.error("Failed to parse JSON field:", error);
          return field;
        }
      };


      const parsedSpotlight = parseJsonField(spotlight);
      const parsedTopDeals = parseJsonField(top_deals);
      const parsedTrendingProduct = parseJsonField(trending_product);
      const parsedTopProduct = parseJsonField(top_product);

      const category = await Category.findOne({ id });

      if (!category) {
        return handleResponse(404, "Category not found", {}, res);
      }

      const existingCategory = await Category.findOne({
        category_name: categoryData.category_name,
        id: { $ne: id },
      });

      if (existingCategory) {
        return handleResponse(409, "This category already exists.", {}, res);
      }

      for (const key in categoryData) {
        if (Object.hasOwnProperty.call(categoryData, key)) {
          category[key] = categoryData[key];
        }
      }

      const base_url = `${req.protocol}://${req.get("host")}`;

      if (images) {
        if (images.thumbnail_image) {
          category.thumbnail_image = `${base_url}/${images.thumbnail_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_one) {
          category.banner_img_center_one = `${base_url}/${images.banner_img_center_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_two) {
          category.banner_img_center_two = `${base_url}/${images.banner_img_center_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_three) {
          category.banner_img_center_three = `${base_url}/${images.banner_img_center_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_four) {
          category.banner_img_center_four = `${base_url}/${images.banner_img_center_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_image_left_one) {
          category.banner_image_left_one = `${base_url}/${images.banner_image_left_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_image_left_two) {
          category.banner_image_left_two = `${base_url}/${images.banner_image_left_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
      }
      if (categoryData.parent_category == "null") {
        category.parent_category = null;
      }


      category.spotlight = parsedSpotlight;
      category.top_deals = parsedTopDeals;
      category.trending_product = parsedTrendingProduct;
      category.top_product = parsedTopProduct;


      await category.save();

      return handleResponse(
        200,
        "Category updated successfully",
        { category },
        res
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  //delete category
  static DeleteCategory = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await Category.findOne({ id });

      if (!category) {
        return handleResponse(404, "Category not found.", {}, resp);
      }

      if (category.deleted_at !== null) {
        await Category.findOneAndDelete({ id });

        handleResponse(200, "Category deleted successfully.", {}, resp);
      } else {
        return handleResponse(
          400,
          "For deleting this category you have to add it to the trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //soft delete
  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await Category.findOne({ id });
      if (!category) {
        return handleResponse(404, "Category not found", {}, resp);
      }

      if (!category.deleted_at) {
        category.deleted_at = new Date();
        await category.save();
      } else {
        return handleResponse(
          400,
          "Category already added to trash.",
          {},
          resp
        );
      }

      return handleResponse(200, "Category added to trash", { category }, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get soft deleted category
  static GetSoftDeleteCategory = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const category = await Category.find();

      const deletedCategory = category.filter(
        (category) => category.deleted_at !== null
      );

      for (const key of deletedCategory) {
        if (key.parent_category) {
          const categoryData = await Category.findOne({ id: key.parent_category })
          key.parent_category = categoryData
        }
      }

      if (deletedCategory.length == 0) {
        return handleResponse(
          200,
          "No Category data available in trash.",
          {},
          resp
        );
      }
      return handleResponse(
        200,
        "Fetch Category in trash successful",
        { categories: deletedCategory },
        resp
      );
    } catch (err) {
      return 500, err.message, {}, resp;
    }
  };

  //restore category
  static RestoreCategory = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const category = await Category.findOne({
        id: id,
        // deleted_at: { $ne: null },
      });
      if (!category) {
        return handleResponse(404, "Category not found", {}, resp);
      }

      category.deleted_at = null;

      await category.save();

      return handleResponse(200, "Category restored.", { category }, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get product by id
  static GetCategoryById = async (req, resp) => {
    try {
      const { id } = req.params;
      const category = await Category.findOne({ id });
      if (!category) {
        return handleResponse(404, "Category not found", {}, resp);
      }

      if (category.parent_category) {
        const parentCategory = await Category.findOne({
          id: category.parent_category,
        });
        category.parent_category = parentCategory;
      }

      if (category.created_by) {
        const createdBy = await User.findOne({
          id: category.created_by,
        });
        category.created_by = createdBy;
      }

      return handleResponse(
        200,
        "Product Fetched successfully",
        { category },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // parentChild
  static GetParentChild = async (req, resp) => {
    try {
      const parentCategories = await Category.find({ parent_category: null });

      const getChildren = async (categoryId) => {
        const children = await Category.find({ parent_category: categoryId });
        const childrenCategories = await Promise.all(
          children.map(async (child) => {
            const grandchildren = await getChildren(child.id);
            return {
              label: child.category_name,
              value: child.id,

              children: grandchildren,
            };
          })
        );
        return childrenCategories;
      };

      const categoriesWithChildren = await Promise.all(
        parentCategories.map(async (parentCategory) => {
          const childrenCategories = await getChildren(parentCategory.id);
          return {
            label: parentCategory.category_name,
            value: parentCategory.id,
            children: childrenCategories,
          };
        })
      );

      const responseData = {
        http_status_code: 200,
        status: true,
        context: {
          data: categoriesWithChildren,
        },
        timestamp: new Date().toISOString(),
        message: "Data Fetch Successfully",
      };

      resp.json(responseData);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ message: "Internal Server Error" });
    }
  };
}

export default CategoryController;
