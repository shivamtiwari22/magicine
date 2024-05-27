import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const BlogCategorymodel = mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    parent_category: {
      type: mongoose.Schema.Types.Number,
      ref: "BlogCategory",
      default: null,
    },
    description: {
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
  { timestamps: {} }
);

BlogCategorymodel.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("BlogCategory");
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

const BlogCategory = mongoose.model("BlogCategory", BlogCategorymodel);

export default BlogCategory;
