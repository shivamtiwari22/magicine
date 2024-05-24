import Blog from "../../src/models/adminModel/BlogModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import BlogCategory from "../../src/models/adminModel/BlogCategoriesModel.js";
import BlogTags from "../../src/models/adminModel/BlogTags.js";

class BlogController {
  // add blog
  static AddBlog = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { banner_image, tags, ...blogData } = req.body;

      const existingBlog = await Blog.findOne({ title: blogData.title });
      if (existingBlog) {
        return handleResponse(409, "Blog already exists.", {}, resp);
      }

      const newBlog = new Blog({
        created_by: user.id,
        ...blogData,
      });

      const base_url = `${req.protocol}://${req.get("host")}/api`;
      if (images && images.banner_image) {
        newBlog.banner_image = `${base_url}/${images.banner_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }
      await newBlog.save();
      let tagIds = [];
      if (tags) {
        let tagsArray;
        try {
          tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags);
        } catch (err) {
          tagsArray = [tags];
        }

        const blog_link = `${req.protocol}://${req.get(
          "host"
        )}/api/admin/get-blog/${newBlog.id}`;
        const tagPromises = tagsArray.map(async (tag) => {
          let existingTag = await BlogTags.findOne({ name: tag });
          if (!existingTag) {
            const newTag = new BlogTags({
              name: tag,
              created_by: user.id,
              count: 1,
              blog: [
                {
                  name: newBlog.title,
                  content: newBlog.content,
                  link: blog_link,
                  image: newBlog.banner_image,
                  id: newBlog.id,
                },
              ],
            });
            existingTag = await newTag.save();
          } else {
            existingTag.count += 1;
            if (
              !existingTag.blog.includes({
                name: newBlog.title,
                content: newBlog.content,
                link: blog_link,
                image: newBlog.banner_image,
                id: newBlog.id,
              })
            ) {
              existingTag.blog.push({
                name: newBlog.title,
                content: newBlog.content,
                link: blog_link,
                image: newBlog.banner_image,
                id: newBlog.id,
              });
            }
            await existingTag.save();
          }
          return existingTag.id;
        });

        tagIds = await Promise.all(tagPromises);
      }

      newBlog.tags = tagIds;

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
        if (blog.tags && blog.tags.length > 0) {
          const tagsDetails = await Promise.all(
            blog.tags.map(async (tagsId) => {
              return await BlogTags.findOne({ id: tagsId });
            })
          );
          blog.tags = tagsDetails;
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
      if (blog.tags && blog.tags.length > 0) {
        const tagsDetails = await Promise.all(
          blog.tags.map(async (tagsId) => {
            return await BlogTags.findOne({ id: tagsId });
          })
        );
        blog.tags = tagsDetails;
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
      const { banner_image, tags, ...blogData } = req.body;
      const blog = await Blog.findById(id);

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
      if (images && images.banner_image) {
        blog.banner_image = `${base_url}/${images.banner_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }
      await blog.save();
      let tagIds = [];
      if (tags) {
        let tagsArray;
        try {
          tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags);
        } catch (err) {
          tagsArray = [tags];
        }

        const blog_link = `${base_url}/api/admin/get-blog/${blog.id}`;
        const currentTags = blog.tags.map((tag) => tag.toString());

        const tagPromises = tagsArray.map(async (tag) => {
          let existingTag = await BlogTags.findOne({ name: tag });
          if (!existingTag) {
            const newTag = new BlogTags({
              name: tag,
              created_by: user.id,
              count: 1,
              blog: [
                {
                  name: blog.title,
                  content: blog.content,
                  link: blog_link,
                  image: blog.banner_image,
                  id: blog.id,
                },
              ],
            });
            existingTag = await newTag.save();
          } else {
            existingTag.count += 1;
            if (
              !existingTag.blog.includes({
                name: blog.title,
                content: blog.content,
                link: blog_link,
                image: blog.banner_image,
                id: blog.id,
              })
            ) {
              existingTag.blog.push({
                name: blog.title,
                content: blog.content,
                link: blog_link,
                image: blog.banner_image,
                id: blog.id,
              });
            }
            await existingTag.save();
          }
          return existingTag.id;
        });

        tagIds = await Promise.all(tagPromises);

        const removedTags = currentTags.filter(
          (tag) => !tagsArray.includes(tag)
        );
        for (const tag of removedTags) {
          const tagDoc = await BlogTags.findOne({ name: tag });
          if (tagDoc) {
            tagDoc.count -= 1;
            tagDoc.blog = tagDoc.blog.filter(
              (blogLink) => blogLink !== blog_link
            );
            await tagDoc.save();
          }
        }
      }

      blog.tags = tagIds;

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
