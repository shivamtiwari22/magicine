import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";


const usesSchema = mongoose.Schema({
    id: Number,
    name: {
        type: String,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.Number,
        ref: "User"
    },
    deleted_at: {
        type: Date,
        default: null
    }
},
    {
        timestamps: {},
        retainNullValues: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)


usesSchema.path("createdAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});
usesSchema.path("updatedAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});

usesSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("Uses");
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

const Uses = mongoose.model("Uses", usesSchema)

export default Uses