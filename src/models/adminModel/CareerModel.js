import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const CareerSchema = mongoose.Schema(
  {
    id: Number,
    section_one: {
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      banner_image: {
        default:null,
        type: String,
        // required: true,
      },
      banner_text: {
        type: String,
        required: true,
      },
    },
    section_two: {
      name: {
        type: String,
        default: "Our Value Culture",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      box_one_heading: {
        type: String,
        default: null,
      },
      box_one_icon: {
        type: String,
        default: null,
      },
      box_one_text: {
        type: String,
        default: null,
      },
      box_two_heading: {
        type: String,
        default: null,
      },
      box_two_icon: {
        type: String,
        default: null,
      },
      box_two_text: {
        type: String,
        default: null,
      },
      box_three_heading: {
        type: String,
        default: null,
      },
      box_three_icon: {
        type: String,
        default: null,
      },
      box_three_text: {
        type: String,
        default: null,
      },
    },
    section_three: {
      name: {
        type: String,
        default: " Perks And Benefits?",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      banner_image: {
        default:null,
        type: String,
        // required: true,
      },
      box_one_icon: {
        type: String,
        default: null,
      },
      box_one_text: {
        type: String,
        default: null,
      },
      box_two_icon: {
        type: String,
        default: null,
      },
      box_two_text: {
        type: String,
        default: null,
      },
      box_three_icon: {
        type: String,
        default: null,
      },
      box_three_text: {
        type: String,
        default: null,
      },
      box_four_icon: {
        type: String,
        default: null,
      },
      box_four_text: {
        type: String,
        default: null,
      },
    },
    section_four: {
      name: {
        type: String,
        default: "who we aspire to become",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      text: {
        type: String,
        default: null,
      },
      banner_image: {
        default:null,
        type: String,
        // required: true,
      },
    },
    section_five: {
      name: {
        type: String,
        default: "Current Job Opening",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      box_one: {
        type: String,
        default: null,
      },
      box_two: {
        type: String,
        default: null,
      },
      box_three: {
        type: String,
        default: null,
      },
      box_four: {
        type: String,
        default: null,
      },
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
  },
  { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
);

CareerSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CareerSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

CareerSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Career");
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

const Career = mongoose.model("Career", CareerSchema);
export default Career;
