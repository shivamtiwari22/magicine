import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const BlogTagsSchema = mongoose.Schema(
  {
    id: Number,
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: true,
    },
    blog: {
      type: Array,
      default: null,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);
BlogTagsSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
BlogTagsSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

BlogTagsSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("BlogTags");
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

const BlogTags = mongoose.model("BlogTags", BlogTagsSchema);

export default BlogTags;
