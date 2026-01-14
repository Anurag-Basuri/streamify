/**
 * Subscription Controller
 * Handles channel subscription operations
 */
import mongoose from "mongoose";

// Models
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

// Utils
import { asyncHandler } from "../utils/asynchandler.js";
import {
    ok,
    created,
    badRequest,
    notFound,
    ensureExists,
} from "../utils/responseHelpers.js";
import { SUBSCRIPTION } from "../utils/errorCodes.js";
import { notifyNewSubscription } from "../utils/notifications.js";

// ============================================================================
// HELPERS
// ============================================================================

const validateChannelId = (channelId) => {
    if (!mongoose.isValidObjectId(channelId)) {
        badRequest("Invalid channel ID", [], "INVALID_OBJECT_ID");
    }
};

// ============================================================================
// CONTROLLERS
// ============================================================================

/**
 * Toggle subscription to a channel
 * POST /subscriptions/:channelId
 */
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    validateChannelId(channelId);

    // Check if the channel exists
    const channel = await User.findById(channelId);
    ensureExists(channel, "Channel");

    // Check if the subscription already exists
    const subscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (subscribed) {
        // If subscription exists, remove it
        await Subscription.deleteOne({ _id: subscribed._id });
        return ok(res, null, "Channel unsubscribed");
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

    return created(res, subscribe, "Channel subscribed");
});

/**
 * Get channels the user is subscribed to
 * GET /subscriptions
 */
const getSubscribedChannel = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({ subscriber: req.user._id })
        .populate("channel", "userName fullName avatar")
        .sort({ createdAt: -1 })
        .lean();

    return ok(res, subscriptions, "Subscribed channels fetched");
});

/**
 * Get subscribers of a specific channel
 * GET /subscriptions/channel/:channelId
 */
const getUserSubscribed = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    validateChannelId(channelId);

    const subscriptions = await Subscription.find({ channel: channelId })
        .populate("subscriber", "userName fullName avatar")
        .sort({ createdAt: -1 })
        .lean();

    return ok(res, subscriptions, "Subscribers fetched");
});

/**
 * Check if current user is subscribed to a channel
 * GET /subscriptions/check/:channelId
 */
const checkSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    validateChannelId(channelId);

    const [subscription, subscriberCount] = await Promise.all([
        Subscription.findOne({
            subscriber: req.user._id,
            channel: channelId,
        }).select("_id"),
        Subscription.countDocuments({ channel: channelId }).catch(() => 0),
    ]);

    return ok(
        res,
        {
            channelId,
            isSubscribed: Boolean(subscription),
            subscriberCount,
        },
        "Subscription status fetched"
    );
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
    toggleSubscription,
    getSubscribedChannel,
    getUserSubscribed,
    checkSubscription,
};
