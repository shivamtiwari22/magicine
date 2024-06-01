import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const ReviewSchema = mongoose.Schema(
  {
    id: Number,
    modelType: {
      type: String,
      required: true,
      enum: ["Product", "Medicine", "Equipment"],
    },
    product: {
      type: mongoose.Schema.Types.Number,
      refPath: "modelType",
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.Number,
      required: true,
      ref: "User",
    },
    star_rating: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: null,
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
    // created_by: {
    //   type: mongoose.Schema.Types.Number,
    //   ref: "User",
    //   required: true,
    // },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

ReviewSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
ReviewSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

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
