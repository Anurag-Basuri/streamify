import { useContext } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../../services/AuthContext";
import { HistoryHeader } from "../../components/History/HistoryHeader";
import { HistoryItem } from "../../components/History/HistoryItem";
import { EmptyState } from "../../components/History/EmptyState";
import { LoadingState } from "../../components/History/LoadingState";
import { ErrorState } from "../../components/History/ErrorState";
import { ConfirmModal } from "../../components/Modal";
import useHistory from "../../hooks/useHistory";
import { colors } from "../../utils/theme";

const History = () => {
    const { user } = useContext(AuthContext);
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

    // Utility functions
    const formatTime = (date) => format(new Date(date), "h:mm a");
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return hours > 0
            ? `${hours}:${minutes
                  .toString()
                  .padStart(2, "0")}:${remainingSeconds
                  .toString()
                  .padStart(2, "0")}`
            : `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (history.length === 0) return <EmptyState />;

    const groupedHistory = groupHistoryByDate(history);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-h-screen ${colors.background} p-4 md:p-8`}
        >
            <div className="max-w-7xl mx-auto space-y-12">
                <HistoryHeader
                    count={history.length}
                    onClearAll={() => setShowClearModal(true)}
                />

                {Object.entries(groupedHistory).map(([group, items]) => (
                    <div key={group} className="space-y-6">
                        <GroupHeader title={group} />
                        <div className="grid gap-4">
                            {items.map((item) => (
                                <HistoryItem
                                    key={item.video._id}
                                    item={item}
                                    onRemove={setRemovingId}
                                    formatDuration={formatDuration}
                                />
                            ))}
                        </div>
                    </div>
                ))}
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
