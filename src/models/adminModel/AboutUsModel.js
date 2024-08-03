import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const AboutUsSchema = mongoose.Schema(
  {
    id: Number,
    section_one: {
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      banner_image: {
        type: String,
        required: true,
      },
    },
    section_two: {
      name: {
        type: String,
        default: "About Magicine Pharma",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      heading: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      box_heading_one: {
        type: String,
        required: true,
      },
      box_image_one: {
        type: String,
        required: true,
      },
      box_heading_two: {
        type: String,
        required: true,
      },
      box_image_two: {
        type: String,
        required: true,
      },
      box_heading_three: {
        type: String,
        required: true,
      },
      box_image_three: {
        type: String,
        required: true,
      },
      box_heading_four: {
        type: String,
        required: true,
      },
      box_image_four: {
        type: String,
        required: true,
      },
    },
    section_three: {
      name: {
        type: String,
        default: "What We Are?",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
    },
    section_four: {
      name: {
        type: String,
        default: "What We Do?",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      image_one: {
        type: String,
        required: true,
      },
      image_two: {
        type: String,
        required: true,
      },
      image_three: {
        type: String,
        required: true,
      },
      image_four: {
        type: String,
        required: true,
      },
      image_five: {
        type: String,
        required: true,
      },
      image_six: {
        type: String,
        required: true,
      },
      image_seven: {
        type: String,
        required: true,
      },
      image_eight: {
        type: String,
        required: true,
      },
    },
    section_five: {
      name: {
        type: String,
        default: "Our Vision",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
    },
    section_six: {
      name: {
        type: String,
        default: "Meet Our Founder",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      founder_name: {
        type: String,
        required: true
      },
      text: {
        type: String,
        required: true,
      },
    },
    section_seven: {
      name: {
        type: String,
        default: "Meet Our Team",
      },
      status: {
        type: Boolean,
        default: true,
        required: true,
      },
      image_one: {
        type: String,
        required: true,
      },
      image_two: {
        type: String,
        required: true,
      },
      image_three: {
        type: String,
        required: true,
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

AboutUsSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
AboutUsSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

AboutUsSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("AboutUs");
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

const AboutUs = mongoose.model("AboutUs", AboutUsSchema);
export default AboutUs;
