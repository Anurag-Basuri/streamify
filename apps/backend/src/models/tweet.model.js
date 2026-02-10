import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        content: {
            type: String,
            required: true, // Content of the tweet is mandatory
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields
    }
);

tweetSchema.virtual("ownerDetails", {
    ref: "User",
    localField: "owner",
    foreignField: "_id",
    justOne: true,
    select: "userName fullName avatar channelName",
});

tweetSchema.index({ createdAt: -1 });
tweetSchema.index({ owner: 1 });
tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema);
