import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const ReviewSchema = mongoose.Schema(
  {
    id: Number,
    product: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    star_rating: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: true,
    },
    image: {
      type: String,
      default: null,
    },
    youtube_video_link: {
      type: String,
      default: null,
    },
    text_content: {
      type: String,
      required: true,
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
  { Timestamp: {} }
);

ReviewSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Review");
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

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
