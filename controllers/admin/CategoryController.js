import Category from "../../src/models/adminModel/CategoryModel.js";
import handleResponse from "../../config/http-response.js";

class CategoryController {
  //add category
  static AddCategory = async (req, resp) => {
    try {
      const user = req.user;
      const images = req.files;
      console.log(images);

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const {
        thumbnail_image,
        banner_img_center_one,
        banner_img_center_two,
        banner_img_center_three,
        banner_img_center_four,
        banner_img_left_one,
        banner_img_left_two,
        ...categoryData
      } = req.body;

      const existingCategory = await Category.findOne({
        category_name: categoryData.category_name,
      });
      if (existingCategory) {
        return handleResponse(409, "This category already exists.", {}, resp);
      }

      const newCategory = new Category({
        thumbnail_image: images?.thumbnail_image
          ? images.thumbnail_image[0].path
          : null,
        banner_img_center_one: images?.banner_img_center_one
          ? images.banner_img_center_one[0].path
          : null,
        banner_img_center_two: images?.banner_img_center_two
          ? images.banner_img_center_two[0].path
          : null,
        banner_img_center_three: images?.banner_img_center_three
          ? images.banner_img_center_three[0].path
          : null,
        banner_img_center_four: images?.banner_img_center_four
          ? images.banner_img_center_four[0].path
          : null,
        banner_img_left_one: images?.banner_img_left_one
          ? images.banner_img_left_one[0].path
          : null,
        banner_img_left_two: images?.banner_img_left_two
          ? images.banner_img_left_two[0].path
          : null,
        ...categoryData,
        created_by: user.id,
      });
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

      return handleResponse(
        200,
        "Fetch Category successful",
        { categories: activeCategories },
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
        banner_img_left_one,
        banner_img_left_two,
        ...categoryData
      } = req.body;

      const category = await Category.findOne({ id });

      if (!category) {
        return handleResponse(404, "Category not found", {}, res);
      }

      const existingCategory = await Category.findOne({
        category_name: categoryData.category_name,
      });

      if (existingCategory && existingCategory.id !== id) {
        return handleResponse(409, "This category already exists.", {}, res);
      }

      // Update category data
      for (const key in categoryData) {
        if (Object.hasOwnProperty.call(categoryData, key)) {
          category[key] = categoryData[key];
        }
      }

      // Update image paths if provided
      if (images) {
        category.thumbnail_image = images.thumbnail_image
          ? images.thumbnail_image[0].path
          : category.thumbnail_image;
        category.banner_img_center_one = images.banner_img_center_one
          ? images.banner_img_center_one[0].path
          : category.banner_img_center_one;
        category.banner_img_center_two = images.banner_img_center_two
          ? images.banner_img_center_two[0].path
          : category.banner_img_center_two;
        category.banner_img_center_three = images.banner_img_center_three
          ? images.banner_img_center_three[0].path
          : category.banner_img_center_three;
        category.banner_img_center_four = images.banner_img_center_four
          ? images.banner_img_center_four[0].path
          : category.banner_img_center_four;
        category.banner_img_left_one = images.banner_img_left_one
          ? images.banner_img_left_one[0].path
          : category.banner_img_left_one;
        category.banner_img_left_two = images.banner_img_left_two
          ? images.banner_img_left_two[0].path
          : category.banner_img_left_two;
      }

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
              lable: child.category_name,
              value: child.category_name,

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
            lable: parentCategory.category_name,
            value: parentCategory.category_name,
            children: childrenCategories,
          };
        })
      );

      // Construct the final response object
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
