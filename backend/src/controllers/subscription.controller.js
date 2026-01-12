import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { APIerror } from "../utils/APIerror.js";
import { asynchandler } from "../utils/asynchandler.js";
import { APIresponse } from "../utils/APIresponse.js";
import { notifyNewSubscription } from "../utils/notifications.js";

// Toggle Subscription (Subscribe/Unsubscribe a channel)
const toggleSubscription = asynchandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new APIerror(400, "Invalid channel ID");
    }

    // Check if the channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new APIerror(404, "Channel not found");
    }

    // Check if the subscription already exists
    const subscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (subscribed) {
        // If subscription exists, remove it
        await subscribed.remove();
        return res
            .status(200)
            .json(new APIresponse(200, null, "Channel unsubscribed"));
    }

    // If subscription does not exist, create it
    const subscribe = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    });

    // Send notification to channel owner (async, non-blocking)
    notifyNewSubscription({
        channel,
        subscriber: req.user,
    }).catch((err) => console.error("Notification error:", err.message));

    return res
        .status(201)
        .json(new APIresponse(201, subscribe, "Channel subscribed"));
});

// Get Subscribed Channels (Channels the user is subscribed to)
const getSubscribedChannel = asynchandler(async (req, res) => {
    const subscriptions = await Subscription.find({ subscriber: req.user._id })
        .populate("channel", "name avatar") // Customize fields to populate
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new APIresponse(200, subscriptions, "Subscribed channels fetched")
        );
});

// Get Subscribers of a Channel (Users subscribed to a specific channel)
const getUserSubscribed = asynchandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new APIerror(400, "Invalid channel ID");
    }

    const subscriptions = await Subscription.find({ channel: channelId })
        .populate("subscriber", "name avatar") // Customize fields to populate
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new APIresponse(200, subscriptions, "Subscribers fetched"));
});

export { toggleSubscription, getSubscribedChannel, getUserSubscribed };
