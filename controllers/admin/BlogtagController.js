import BlogTags from "../../src/models/adminModel/BlogTags.js";
import handleResponse from "../../config/http-response.js";

class BlogTagsController {
  //add tags
  static AddBlogTags = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { ...blogData } = req.body;

      const existingBlog = await BlogTags.findOne({ name: blogData.name });
      if (existingBlog) {
        return handleResponse(400, "Blog tag already exists", {}, resp);
      }

      const newBlog = new BlogTags({
        ...blogData,
        created_by: user.id,
      });
      await newBlog.save();
      return handleResponse(
        201,
        "Blog tag  created successfully.",
        newBlog,
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

  //update blog tag
  static UpdateBlogTags = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const { ...blogData } = req.body;

      const blog = await BlogTags.findOne({ id });
      if (!blog) {
        return handleResponse(404, "Blog not found", {}, resp);
      }

      const existingTag = await BlogTags.findOne({
        name: blogData.name,
        id: { $ne: id },
      });

      if (existingTag) {
        return handleResponse(409, "Blog tag already exists", {}, resp);
      }

      for (const key in blogData) {
        if (Object.hasOwnProperty.call(blogData, key)) {
          blog[key] = blogData[key];
        }
      }
      await blog.save();
      return handleResponse(200, "Blog tag updated successfully.", blog, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // get blog tag
  static GetBlogtags = async (req, resp) => {
    try {
      const blogs = await BlogTags.find().sort({ createdAt: -1 });
      if (!blogs) {
        return handleResponse(200, "No Blog tag available.", {}, resp);
      }
      return handleResponse(
        200,
        "Blog tags fetched successfully.",
        blogs,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // get blog by id
  static GetBlogsTagsID = async (req, resp) => {
    try {
      const { id } = req.params;

      const blog = await BlogTags.findOne({ id });
      if (!blog) {
        return handleResponse(404, "Blog not found.", {}, resp);
      }
      return handleResponse(200, "Blog fetched successfully.", blog, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // delete blog
  static DeleteBlogTags = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const deleteBlog = await BlogTags.findOneAndDelete({ id });
      if (!deleteBlog) {
        return handleResponse(404, "Blog not found", {}, resp);
      }
      return handleResponse(200, "Blog deleted successfully.", {}, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default BlogTagsController;
