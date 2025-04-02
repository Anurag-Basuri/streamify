import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            url: {
                type: String,
                required: true,
            },
            publicId: {
                type: String,
                required: true,
            },
        },
        thumbnail: {
            url: {
                type: String,
                required: true,
            },
            publicId: {
                type: String,
                required: true,
            },
        },
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        slug: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.pre("save", async function (next) {
    if (!this.slug || this.isModified("title")) {
        const baseSlug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .substring(0, 50);

        let uniqueSlug = baseSlug;
        let counter = 1;

        while (true) {
            const exists = await Video.findOne({ slug: uniqueSlug })
                .collation({ locale: "en", strength: 2 })
                .lean();
            if (!exists || exists._id.equals(this._id)) break;
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = uniqueSlug;
    }
    next();
});

videoSchema.virtual("ownerProfile", {
    ref: "User",
    localField: "owner",
    foreignField: "_id",
    justOne: true,
    select: "userName fullName avatar channelName",
});

videoSchema.index({ createdAt: -1 });
videoSchema.index({ views: -1 });
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
