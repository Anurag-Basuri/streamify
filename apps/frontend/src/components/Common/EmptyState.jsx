/**
 * EmptyState
 * Reusable empty state component with icon, title, description, and action
 */
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
    FiVideo,
    FiSearch,
    FiList,
    FiClock,
    FiHeart,
    FiUsers,
    FiFileText,
    FiInbox,
} from "react-icons/fi";

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

const presets = {
    noVideos: {
        icon: FiVideo,
        title: "No videos yet",
        description: "Videos will appear here once uploaded",
    },
    noResults: {
        icon: FiSearch,
        title: "No results found",
        description: "Try adjusting your search or filters",
    },
    noSearchResults: {
        icon: FiSearch,
        title: "No results found",
        description: "Try different keywords or filters",
    },
    emptyPlaylist: {
        icon: FiList,
        title: "Playlist is empty",
        description: "Add videos to this playlist to see them here",
    },
    noHistory: {
        icon: FiClock,
        title: "No watch history",
        description: "Videos you watch will appear here",
    },
    noWatchLater: {
        icon: FiClock,
        title: "Watch later is empty",
        description: "Save videos to watch later",
    },
    noLikes: {
        icon: FiHeart,
        title: "No liked videos",
        description: "Videos you like will appear here",
    },
    noLikedVideos: {
        icon: FiHeart,
        title: "No liked videos",
        description: "Like videos to save them here",
    },
    noSubscriptions: {
        icon: FiUsers,
        title: "No subscriptions",
        description: "Subscribe to channels to see their videos here",
    },
    noComments: {
        icon: FiFileText,
        title: "No comments yet",
        description: "Be the first to comment",
    },
    noNotifications: {
        icon: FiInbox,
        title: "No notifications",
        description: "You're all caught up!",
    },
    noDownloads: {
        icon: FiVideo,
        title: "No downloads",
        description: "Downloaded videos will appear here",
    },
};

// ============================================================================
// COMPONENT
// ============================================================================

const EmptyState = ({
    preset,
    icon: CustomIcon,
    title,
    description,
    action,
    actionLabel,
    className = "",
    size = "md",
}) => {
    // Get preset config or use custom props
    const config = preset ? presets[preset] : {};
    const Icon = CustomIcon || config.icon || FiInbox;
    const displayTitle = title || config.title || "Nothing here";
    const displayDescription = description || config.description;

    // Size variants
    const sizes = {
        sm: {
            container: "py-8",
            iconSize: "w-12 h-12",
            iconWrapper: "w-20 h-20",
            title: "text-base",
            description: "text-sm",
        },
        md: {
            container: "py-12",
            iconSize: "w-16 h-16",
            iconWrapper: "w-24 h-24",
            title: "text-lg",
            description: "text-sm",
        },
        lg: {
            container: "py-16",
            iconSize: "w-20 h-20",
            iconWrapper: "w-32 h-32",
            title: "text-xl",
            description: "text-base",
        },
    };

    const sizeConfig = sizes[size] || sizes.md;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center justify-center text-center ${sizeConfig.container} ${className}`}
        >
            {/* Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className={`${sizeConfig.iconWrapper} rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4`}
            >
                <Icon
                    className={`${sizeConfig.iconSize} text-[var(--text-tertiary)]`}
                />
            </motion.div>

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`${sizeConfig.title} font-semibold text-[var(--text-primary)] mb-2`}
            >
                {displayTitle}
            </motion.h3>

            {/* Description */}
            {displayDescription && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`${sizeConfig.description} text-[var(--text-tertiary)] max-w-sm`}
                >
                    {displayDescription}
                </motion.p>
            )}

            {/* Action Button */}
            {action && actionLabel && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={action}
                    className="mt-6 px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-lg font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
                >
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
};

EmptyState.propTypes = {
    preset: PropTypes.oneOf(Object.keys(presets)),
    icon: PropTypes.elementType,
    title: PropTypes.string,
    description: PropTypes.string,
    action: PropTypes.func,
    actionLabel: PropTypes.string,
    className: PropTypes.string,
    size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export default EmptyState;
