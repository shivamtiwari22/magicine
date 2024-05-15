import mongoose from "mongoose";
import Roles from "../../src/models/adminModel/RoleModel.js";
import Tags from "../../src/models/adminModel/Tags.js";
import handleResponse from "../../config/http-response.js";

class TagController {
  // add tag api
  static AddTag = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { name } = req.body;

      if (!name) {
        return handleResponse(400, "Name is required field.", {}, resp);
      }

      const existingTag = await Tags.findOne({ name });

      if (existingTag) {
        return resp.status(400).json({ message: "This tag already exists." });
      }

      const newTag = new Tags({ name, created_by: user.id });
      await newTag.save();

      return handleResponse(
        201,
        "Tag  created successfully.",
        { newTag },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
  //update tag
  static updateTag = async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, res);
      }

      const { id } = req.params;
      const tagData = req.body;

      const tag = await Tags.findOne({ id });

      if (!tag) {
        return handleResponse(404, "Tag not found", {}, res);
      }

      const existingTag = await Tags.findOne({ name: tagData.name });

      if (existingTag) {
        return handleResponse(409, "Tag already exists", {}, res);
      }

      for (const key in tagData) {
        if (Object.hasOwnProperty.call(tagData, key)) {
          tag[key] = tagData[key];
        }
      }

      await tag.save();
      return handleResponse(200, "Tag updated successfully", { tag }, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };
  //delete tag
  static deleteTag = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;

      const tag = await Tags.findOne({ id });

      if (!tag) {
        return handleResponse(404, "Tag not found.", {}, resp);
      }

      await Tags.findOneAndDelete({ id });

      handleResponse(200, "Tag  deleted successfully", {}, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
  //get tag
  static GetTags = async (req, resp) => {
    try {
      const tags = await Tags.find().sort({
        createdAt: -1,
      });

      return handleResponse(200, "Tag fetched successfully.", { tags }, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default TagController;
