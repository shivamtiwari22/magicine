import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const ProductEnquirySchema = mongoose.Schema(
  {
    id: Number,
    type: {
      type: String,
      enum: ["Product", "Medicine", "Equipment"]
    },
    product_id: {
      type: mongoose.Schema.Types.Number,
      refPath: "type",
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact_no: {
      type: String,
      required: true,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);



ProductEnquirySchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("ProductEnquiry");
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

const ProductEnquiry = mongoose.model("ProductEnquiry", ProductEnquirySchema);
export default ProductEnquiry;
