import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const BlogSchema = mongoose.Schema(
  {
    id: Number,
    title: {
      type: String,
      required: true,
    },
    banner_image: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      default: null,
    },
    category: {
      type: Array,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
  },
  { timestamps: {} }
);

BlogSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Blog");
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

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;
