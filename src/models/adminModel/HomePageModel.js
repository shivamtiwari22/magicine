import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const HomePageSchema = new mongoose.Schema(
  {
    id: Number,
    slider_image: {
      type: String,
      required: true,
    },
    section_one: {
      status: { type: Boolean, default: true },
      main_heading: { type: String, default: null },
      sub_heading: { type: String, default: null },
      search_bar_placeholder: { type: String, default: null },
    },
    section_two: {
      status: { type: Boolean, default: true, required: true },
      banner_image: { type: String, required: true },
    },
    section_three: {
      name: { type: String, default: "Deal Of The Day" },
      status: { type: Boolean, default: true, required: true },
      banner_image: { type: String, required: true },
      deals: { type: Array, default: null },
    },
    section_four: {
      name: { type: String, default: "Shop By Category" },
      status: { type: Boolean, default: true, required: true },
      select_category: {
        type: Array,
        default: null,
      },
      banner_image: { type: String, required: true },
    },
    section_five: {
      name: { type: String, default: "Shop By Health Concern" },
      status: { type: Boolean, default: true, required: true },
      select_category: {
        type: Array,
        default: null,
      },
      banner_image: { type: String, required: true },
    },
    section_six: {
      name: {
        type: String,
        default: "Our Best Selling Products",
      },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
      banner_image: { type: String, required: true },
    },
    section_seven: {
      status: { type: Boolean, required: true, default: true },
      left_banner: { type: String, required: true },
      right_banner: { type: String, required: true },
    },
    section_eight: {
      name: { type: String, default: "Our Partners" },
      select_brand: {
        type: Array,
        default: null,
      },
      status: { type: Boolean, required: true, default: true },
    },
    section_nine: {
      status: { type: Boolean, required: true, default: true },
      name: { type: String, default: "Why Choose Us?" },

      heading_one: { type: String, default: null },
      image_one: { type: String, required: true },
      content_one: { type: String, required: false },

      heading_two: { type: String, default: null },
      image_two: { type: String, required: true },
      content_two: { type: String, required: false },

      heading_three: { type: String, default: null },
      image_three: { type: String, required: true },
      content_three: { type: String, required: false },

      heading_four: { type: String, default: null },
      image_four: { type: String, required: true },
      content_four: { type: String, required: false },
    },
    section_ten: {
      status: { type: Boolean, required: true, default: true },
      banner_image: { type: String, default: true },
    },
    section_eleven: {
      name: { type: String, default: "Popular category" },
      status: { type: Boolean, required: true, default: true },
      select_category: {
        type: Array,
        default: null,
      },
    },
    section_twelve: {
      name: { type: String, default: "Popular Combos" },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
    },
    section_thirteen: {
      name: { type: String, default: "Top Trending Deals" },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
    },
    section_fourteen: {
      name: { type: String, default: "In The Spotlight" },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
    },
    section_fifteen: {
      name: { type: String, default: "Winter Care" },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
    },
    section_sixteen: {
      status: { type: Boolean, required: true, default: true },
      banner_image: { type: String, required: true },
    },
    section_seventeen: {
      name: { type: String, default: "Popular category" },
      status: { type: Boolean, required: true, default: true },
      select_category: {
        type: Array,
        default: null,
      },
    },
    section_eighteen: {
      name: { type: String, default: "Popular Combos" },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
    },
    section_nineteen: {
      name: { type: String, default: "Top Trending Deals" },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
    },
    section_twenty: {
      name: { type: String, default: "In The Spotlight" },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
    },
    section_twentyone: {
      name: { type: String, default: "Winter Care" },
      status: { type: Boolean, required: true, default: true },
      select_product: {
        type: Array,
        default: null,
      },
    },
    section_twentytwo: {
      status: { type: Boolean, required: true, default: true },
      banner_image: { type: String, required: true },
    },
    description: {
      type: String,
      default: null
    },
    meta_title: { type: String, default: null },
    meta_description: { type: String, default: null },
    meta_keywords: { type: String, default: null },
    og_tag: { type: String, default: null },
    schema_markup: { type: String, default: null },
    created_by: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

HomePageSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
HomePageSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

HomePageSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Home_page");
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

const Home_page = mongoose.model("Home_Page", HomePageSchema);

export default Home_page;
