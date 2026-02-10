import mongoose, { Schema } from "mongoose";

const subscriptionModel = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId, // one to whom subscriber is subscribing
            ref: "User",
        },
    },
    { timestamps: true }
);

subscriptionModel.index({ subscriber: 1, channel: 1 }, { unique: true });
subscriptionModel.index({ channel: 1, createdAt: -1 });
subscriptionModel.index({ subscriber: 1, createdAt: -1 });

export const Subscription = mongoose.model("Subscription", subscriptionModel);
