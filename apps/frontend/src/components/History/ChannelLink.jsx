import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const ChannelLink = ({ owner }) => {
    if (!owner) return null;
    return (
        <Link
            to={`/channel/${owner._id || ""}`}
            className="flex items-center gap-2 text-sm text-indigo-400 hover:underline mt-1"
        >
            <img
                src={owner.avatar || "/default-avatar.png"}
                alt={owner.userName || "Channel"}
                className="w-6 h-6 rounded-full object-cover border border-gray-600"
            />
            <span>{owner.userName || "Unknown Channel"}</span>
        </Link>
    );
};

ChannelLink.propTypes = {
    owner: PropTypes.shape({
        _id: PropTypes.string,
        userName: PropTypes.string,
        avatar: PropTypes.string,
    }),
};