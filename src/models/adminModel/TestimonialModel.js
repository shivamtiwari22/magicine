import mongoose from "mongoose";
import SequenceModel from "../sequence.js";

const TestimonialSchema = mongoose.Schema(
  {
    id: Number,
    customer_name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    designation: {
      type: String,
      required: true,
    },
    content: {
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
  { timestamps: {}, retainNullValues: true }
);

TestimonialSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Testimonial");
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

const Testimonial = mongoose.model("Testimonial", TestimonialSchema);

export default Testimonial;
