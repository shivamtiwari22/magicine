import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const CouponsSchema = mongoose.Schema(
  {
    id: Number,
    couponCode: {
      type: String,
      required: true,
    },
    couponType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
    },
    value: {
      type: Number,
      required: true,
    },
    usd: {
      type: Number,
      required: true,
    },
    euro: {
      type: Number,
      required: true,
    },
    gbp: {
      type: Number,
      required: true,
    },
    number_coupon: {
      type: Number,
      required: true,
    },
    remaining_coupon: {
      type: Number,
      default: null,
    },
    expirey_date: {
      type: Date,
      required: true,
    },
    minimum_cart_value: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      default: null
    },
    delete_at: {
      type: Date,
      default: null,
    },
    isExpired: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

CouponsSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CouponsSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CouponsSchema.path("expirey_date").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

CouponsSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("coupon");
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

const Coupons = mongoose.model("Coupons", CouponsSchema);

export default Coupons;
