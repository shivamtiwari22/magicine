import Blog from "../../src/models/adminModel/BlogModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import BlogCategory from "../../src/models/adminModel/BlogCategoriesModel.js";

class BlogController {
  // add blog
  static AddBlog = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { banner_image, ...blogData } = req.body;

      const existingBlog = await Blog.findOne({ title: blogData.title });
      if (existingBlog) {
        return handleResponse(409, "Blog already exists.", {}, resp);
      }

      const newBlog = new Blog({
        created_by: user.id,
        ...blogData,
      });

      const base_url = `${req.protocol}://${req.get("host")}/api`;
      if (images) {
        if (images && images.banner_image) {
          newBlog.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
      }
      await newBlog.save();

      return handleResponse(200, "Blog added successfully", newBlog, resp);
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

  // get blog
  static GetBlog = async (req, resp) => {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 });

      const getBlogs = await blogs.filter((blogs) => blogs.deleted_at === null);
      if (getBlogs.length == 0) {
        return handleResponse(200, "No Blog data available.", {}, resp);
      }

      for (const blog of getBlogs) {
        if (blog.created_by) {
          const createdBy = await User.findOne({ id: blog.created_by });
          blog.created_by = createdBy;
        }
        if (blog.category && blog.category.length > 0) {
          const categoryDetails = await Promise.all(
            blog.category.map(async (categoryId) => {
              return await BlogCategory.findOne({ id: categoryId });
            })
          );
          blog.category = categoryDetails;
        }
      }
      return handleResponse(200, "Blog fetched successfully.", getBlogs, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // get blog id
  static GetBlogID = async (req, resp) => {
    try {
      const { id } = req.params;
      const blog = await Blog.findOne({ id });
      if (!blog) {
        return handleResponse(404, "Blog not found.", {}, resp);
      }

      if (blog.created_by) {
        const createdBy = await User.findOne({ id: blog.created_by });
        blog.created_by = createdBy;
      }
      if (blog.category && blog.category.length > 0) {
        const categoryDetails = await Promise.all(
          blog.category.map(async (categoryId) => {
            return await BlogCategory.findOne({ id: categoryId });
          })
        );
        blog.category = categoryDetails;
      }

      return handleResponse(200, "Blog fetched successfully.", blog, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //update blog
  static UpdateBlog = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const images = req.files;
      const { banner_image, ...blogData } = req.body;
      const blog = await Blog.findOne({ id });

      if (!blog) {
        return handleResponse(404, "Blog not found.", {}, resp);
      }

      const existingBlog = await Blog.findOne({
        title: blogData.title,
        id: { $ne: id },
      });
      if (existingBlog) {
        return handleResponse(
          409,
          "Blog already exists with this title.",
          {},
          resp
        );
      }

      for (const key in blogData) {
        if (Object.hasOwnProperty.call(blogData, key)) {
          blog[key] = blogData[key];
        }
      }

      const base_url = `${req.protocol}://${req.get("host")}/api`;
      if (images) {
        if (images && images.banner_image) {
          blog.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
      }

      await blog.save();

      return handleResponse(200, "Blog updated successfully.", blog, resp);
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
      const blog = await Blog.findOne({ id });
      if (!blog) {
        return handleResponse(404, "Blog not found", {}, resp);
      }
      if (blog.deleted_at !== null) {
        return handleResponse(200, "Blog already added to trash.", {}, resp);
      }
      blog.deleted_at = new Date();
      await blog.save();
      return handleResponse(
        200,
        "Blog  successfully added to trash.",
        blog,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore
  static Restore = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const blog = await Blog.findOne({ id });
      if (!blog) {
        return handleResponse(404, "Blog not found", {}, resp);
      }
      if (blog.deleted_at === null) {
        return handleResponse(200, "Blog already restored.", {}, resp);
      }
      blog.deleted_at = null;
      await blog.save();
      return handleResponse(200, "Blog  successfully restored.", blog, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get trash
  static GetTrash = async (req, resp) => {
    try {
      const blog = await Blog.find().sort({ createdAt: -1 });
      const getTrash = await blog.filter((blog) => blog.deleted_at !== null);
      if (getTrash.length == 0) {
        return handleResponse(200, "No Blog data available.", {}, resp);
      }
      return handleResponse(200, "Trash successfully fetched.", getTrash, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //delete blog
  static DeleteBlog = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const blog = await Blog.findOne({ id });
      if (!blog) {
        return handleResponse(404, "Blog not found", {}, resp);
      }

      if (blog.deleted_at !== null) {
        await Blog.findOneAndDelete({ id });
        return handleResponse(200, "Blog  successfully deleted.", blog, resp);
      } else {
        return handleResponse(
          200,
          "For deleting this you have to add it to trash first.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default BlogController;
