import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const NeedHelpMessageSchema = new mongoose.Schema({
    id: Number,
    orderId: {
        type: Number,
        required: true
    },
    disputeId: {
        type: Number,
        ref: "NeedHelp",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.Number,
        ref: "User",
        required: true
    },
    userType: {
        type: String,
        enum: ["admin", "consumer"],
        required: true
    }
},
    {
        timestamps: true,
        retainNullValues: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    });

NeedHelpMessageSchema.path("createdAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});
NeedHelpMessageSchema.path("updatedAt").get(function (value) {
    return value ? moment(value).format("DD-MM-YYYY") : null;
});

NeedHelpMessageSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("NeedHelpMessage");
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

const NeedHelpMessage = mongoose.model("NeedHelpMessage", NeedHelpMessageSchema);

export default NeedHelpMessage;
