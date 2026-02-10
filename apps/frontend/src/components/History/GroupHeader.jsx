import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export const GroupHeader = ({ title }) => (
    <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xl font-semibold text-indigo-400 px-2 border-l-4 border-indigo-400 pl-4"
    >
        {title}
    </motion.h2>
);

GroupHeader.propTypes = {
    title: PropTypes.string.isRequired
};