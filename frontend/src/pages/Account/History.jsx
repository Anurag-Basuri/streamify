import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth.js";
import { HistoryHeader } from "../../components/History/HistoryHeader.jsx";
import { HistoryItem } from "../../components/History/HistoryItem.jsx";
import { EmptyState } from "../../components/History/EmptyState.jsx";
import { LoadingState } from "../../components/History/LoadingState.jsx";
import { ErrorState } from "../../components/History/ErrorState.jsx";
import { GroupHeader } from "../../components/History/GroupHeader.jsx";
import { ConfirmModal } from "../../components/Modal.jsx";
import useHistory from "../../hooks/useHistory.js";
import { formatDuration, formatTime } from "../../utils/formatters.js";
import { colors } from "../../utils/theme.js";

const History = () => {
    const { user } = useAuth();
    const {
        history,
        loading,
        error,
        removingId,
        showClearModal,
        setRemovingId,
        setShowClearModal,
        removeFromHistory,
        clearHistory,
        groupHistoryByDate,
    } = useHistory(user);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (history.length === 0) return <EmptyState />;

    const groupedHistory = groupHistoryByDate(history);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen ${colors.background} p-4 md:p-8`}
        >
            <div className="max-w-7xl mx-auto space-y-12">
                <HistoryHeader
                    count={history.length}
                    onClearAll={() => setShowClearModal(true)}
                />

                <AnimatePresence mode="wait">
                    {Object.entries(groupedHistory).map(([group, items]) => (
                        <motion.div
                            key={group}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <GroupHeader title={group} />
                            <div className="grid gap-4">
                                {items.map((item) => (
                                    <HistoryItem
                                        key={item.video._id}
                                        item={item}
                                        onRemove={setRemovingId}
                                        formatDuration={formatDuration}
                                        formatTime={formatTime}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <ConfirmModal
                isOpen={!!removingId}
                title="Remove from History?"
                message="This action will remove this video from your watch history."
                onCancel={() => setRemovingId(null)}
                onConfirm={() => removeFromHistory(removingId)}
            />

            <ConfirmModal
                isOpen={showClearModal}
                title="Clear All History?"
                message="This will permanently remove all items from your watch history."
                onCancel={() => setShowClearModal(false)}
                onConfirm={clearHistory}
                confirmText="Clear All"
                danger
            />
        </motion.div>
    );
};

export default History;
