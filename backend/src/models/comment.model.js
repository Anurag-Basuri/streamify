import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet", // Reference to the Tweet model
            required: true,
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields
    }
);

export const Comment = mongoose.model("Comment", commentSchema);

useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get("/api/v1/dashboard");
            setDashboard({
                data: data.data,
                loading: false,
                error: null,
            });
        } catch (error) {
            console.error("Failed to fetch dashboard:", error);
            setDashboard({
                data: null,
                loading: false,
                error: error.message || "Failed to load dashboard",
            });
        }
    };

    fetchDashboard();
}, [axios]);
