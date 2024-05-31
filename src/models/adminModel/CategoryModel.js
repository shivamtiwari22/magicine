import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const CategorySchema = mongoose.Schema(
  {
    id: Number,
    category_name: {
      type: String,
      required: true,
    },
    thumbnail_image: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    category_description: {
      type: String,
      default: null,
    },
    long_description: {
      type: String,
      default: null,
    },
    slug: {
      type: String,
      required: true,
    },
    parent_category: {
      type: mongoose.Schema.Types.Number,
      ref: "Category",
      default: null,
    },
    banner_img_center_one: {
      type: String,
      default: null,
    },
    banner_img_center_two: {
      type: String,
      default: null,
    },
    banner_img_center_three: {
      type: String,
      default: null,
    },
    banner_img_center_four: {
      type: String,
      default: null,
    },
    banner_image_left_one: {
      type: String,
      default: null,
    },
    banner_image_left_two: {
      type: String,
      default: null,
    },
    is_megamenu: {
      type: Boolean,
      required: true,
      default: true,
    },
    meta_title: {
      type: String,
      default: null,
    },
    meta_description: {
      type: String,
      default: null,
    },
    meta_keywords: {
      type: String,
      default: null,
    },
    og_tag: {
      type: String,
      default: null,
    },
    schema_markup: {
      type: String,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
CategorySchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CategorySchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

CategorySchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Category");
  }
  next();
});

async function getNextSequenceValue(modelName) {
  let sequence = await SequenceModel.findOneAndUpdate(
    { modelName: modelName },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, new: true }
  );
  return sequence.sequenceValue;
}

const Category = mongoose.model("Category", CategorySchema);

export default Category;
