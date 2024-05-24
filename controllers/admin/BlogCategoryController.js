import BlogCategory from "../../src/models/adminModel/BlogCategoriesModel.js";
import handleResponse from "../../config/http-response.js";

class BlogCategoryController {
  //add blog-categories
  static AddBlogCategory = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const blogCategoryData = req.body;

      const existingBlogCategory = await BlogCategory.findOne({
        name: blogCategoryData.name,
      });
      if (existingBlogCategory) {
        return handleResponse(400, "Blog category already exists", {}, resp);
      }

      const newBlogCategory = new BlogCategory({
        ...blogCategoryData,
        created_by: user.id,
      });
      await newBlogCategory.save();
      return handleResponse(
        201,
        "Blog category created successfully.",
        newBlogCategory,
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

  //update blog-category
  static UpdateBlogCategory = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const blogCategoryData = req.body;
      const existing = await BlogCategory.findOne({
        name: blogCategoryData.name,
        id: { $ne: id },
      });
      if (existing) {
        return handleResponse(400, "Blog category already exists", {}, resp);
      }

      const blogCategory = await BlogCategory.findOne({ id });
      if (!blogCategory) {
        return handleResponse(404, "Blog category not found", {}, resp);
      }

      for (const key in blogCategoryData) {
        if (Object.hasOwnProperty.call(blogCategoryData, key)) {
          blogCategory[key] = blogCategoryData[key];
        }
      }

      await blogCategory.save();
      return handleResponse(
        200,
        "Blog category updated successfully.",
        blogCategory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get blog-category
  static GetBlogCategory = async (req, resp) => {
    try {
      const blogCategory = await BlogCategory.find().sort({ createdAt: -1 });

      const GetBlogCategory = await blogCategory.filter(
        (blogCategory) => blogCategory.deleted_at === null
      );

      if (GetBlogCategory.length == 0) {
        return handleResponse(200, "No Blog category available.", {}, resp);
      }

      return handleResponse(
        200,
        "Blog category fetched successfully.",
        { GetBlogCategory },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
  //get blog-category id
  static GetBlogCategoryID = async (req, resp) => {
    try {
      const { id } = req.params;
      const blogCategory = await BlogCategory.findOne({ id });

      if (!blogCategory) {
        return handleResponse(404, "Blog Cateegory not found.", {}, resp);
      }

      return handleResponse(
        200,
        "Blog category fetched successfully.",
        blogCategory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //delete blog-category
  static DeleteBlogCategory = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const blogCategory = await BlogCategory.findOne({ id });
      if (!blogCategory) {
        return handleResponse(404, "Blog category not found.", {}, resp);
      }

      if (blogCategory.deleted_at !== null) {
        await BlogCategory.findOneAndDelete({ id });
        return handleResponse(
          200,
          "Blog category deleted successfully.",
          {},
          resp
        );
      } else {
        return handleResponse(
          400,
          "For deleting this blog category you have to add it to the trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //soft-delete
  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }
      const { id } = req.params;
      const blogCategory = await BlogCategory.findOne({ id });
      if (!blogCategory) {
        return handleResponse(404, "Blog category not found.", {}, resp);
      }
      if (blogCategory.deleted_at === null) {
        blogCategory.deleted_at = new Date();
        await blogCategory.save();
        return handleResponse(
          200,
          "Blog category  successfully added to trash.",
          blogCategory,
          resp
        );
      } else {
        return handleResponse(
          400,
          "Blog category already added to trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get blog-category trash
  static GetTrash = async (req, resp) => {
    try {
      const trash = await BlogCategory.find().sort({ createdAt: -1 });
      if (!trash) {
        return handleResponse(200, "No Blog category available.", {}, resp);
      }
      const allTrash = await trash.filter((trash) => trash.deleted_at !== null);

      if (allTrash.length == 0) {
        return handleResponse(
          200,
          "No Blog category available in trash.",
          {},
          resp
        );
      }
      return handleResponse(
        200,
        "Blog category fetched successfully.",
        { allTrash },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore blog-category
  static Restore = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }
      const { id } = req.params;
      const blogCategory = await BlogCategory.findOne({ id });
      if (!blogCategory) {
        return handleResponse(404, "Blog category not found.", {}, resp);
      }
      if (blogCategory.deleted_at !== null) {
        blogCategory.deleted_at = null;
        await blogCategory.save();
        return handleResponse(
          200,
          "Blog category restored successfully.",
          blogCategory,
          resp
        );
      } else {
        return handleResponse(400, "Blog category already restored", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static GetParentChild = async (req, resp) => {
    try {
      const parentCategories = await BlogCategory.find({
        parent_category: null,
      });

      const getChildren = async (categoryId) => {
        const children = await BlogCategory.find({
          parent_category: categoryId,
        });
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

export default BlogCategoryController;
