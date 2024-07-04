import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const MediaSchema = mongoose.Schema({
    id: Number,
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    deleted_at: {
        type: Date,
        default: null,
    },
    created_by: {
        type: mongoose.Schema.Types.Number,
        ref: "User",
        required: true
    },
},
    { timestamps: {}, toJSON: { getters: true }, toObject: { getters: true } }
)

MediaSchema.path("createdAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});
MediaSchema.path("updatedAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});

MediaSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("Media");
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

const Media = mongoose.model("Media", MediaSchema)

export default Media;