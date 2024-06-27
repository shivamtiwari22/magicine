import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const CancelSchema = mongoose.Schema(
  {
    id: Number,
    order_id: {
      type: mongoose.Schema.Types.Number,
      ref: "Order",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.Number,
      ref: "Product",
      required: true,
    },

    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    order_status: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      default: "New",
    },
    reason: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);
CancelSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CancelSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

CancelSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("CancelRequest");
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

const CancelOrderReq = mongoose.model("CancelRequest", CancelSchema);

export default CancelOrderReq;
