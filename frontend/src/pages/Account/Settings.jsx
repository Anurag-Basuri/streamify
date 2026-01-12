/**
 * Settings Page
 * Comprehensive account settings with profile, privacy, and preferences
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiUser,
    FiLock,
    FiBell,
    FiShield,
    FiTrash2,
    FiCamera,
    FiSave,
    FiX,
    FiCheck,
    FiChevronRight,
    FiMoon,
    FiSun,
    FiGlobe,
    FiMail,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";
import { PageTransition } from "../../components/Common";
import { showSuccess, showError } from "../../components/Common/ToastProvider";
import {
    changePassword,
    updateAvatar,
    updateCoverImage,
} from "../../services/authService";

// ============================================================================
// SETTINGS SECTION COMPONENT
// ============================================================================

const SettingsSection = ({ title, description, children }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
    >
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {title}
            </h2>
            {description && (
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                    {description}
                </p>
            )}
        </div>
        {children}
    </motion.section>
);

// ============================================================================
// SETTINGS ROW COMPONENT
// ============================================================================

const SettingsRow = ({
    icon: Icon,
    label,
    description,
    children,
    danger = false,
}) => (
    <div className="flex items-center justify-between py-4 border-b border-[var(--border-light)] last:border-0">
        <div className="flex items-center gap-4">
            {Icon && (
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        danger
                            ? "bg-[var(--error-light)]"
                            : "bg-[var(--bg-tertiary)]"
                    }`}
                >
                    <Icon
                        className={`w-5 h-5 ${
                            danger
                                ? "text-[var(--error)]"
                                : "text-[var(--text-secondary)]"
                        }`}
                    />
                </div>
            )}
            <div>
                <p
                    className={`font-medium ${
                        danger
                            ? "text-[var(--error)]"
                            : "text-[var(--text-primary)]"
                    }`}
                >
                    {label}
                </p>
                {description && (
                    <p className="text-sm text-[var(--text-tertiary)]">
                        {description}
                    </p>
                )}
            </div>
        </div>
        <div>{children}</div>
    </div>
);

// ============================================================================
// TOGGLE SWITCH COMPONENT
// ============================================================================

const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? "bg-[var(--brand-primary)]" : "bg-[var(--bg-tertiary)]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
        <motion.div
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            animate={{ left: enabled ? "calc(100% - 20px)" : "4px" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    </button>
);

// ============================================================================
// PASSWORD CHANGE MODAL
// ============================================================================

const PasswordModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            showError("Passwords don't match");
            return;
        }
        if (form.newPassword.length < 8) {
            showError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                oldPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            showSuccess("Password changed successfully");
            onClose();
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            showError(error.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--bg-elevated)] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        Change Password
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {["currentPassword", "newPassword", "confirmPassword"].map(
                        (field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    {field === "currentPassword"
                                        ? "Current Password"
                                        : field === "newPassword"
                                        ? "New Password"
                                        : "Confirm New Password"}
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPasswords[field]
                                                ? "text"
                                                : "password"
                                        }
                                        value={form[field]}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                [field]: e.target.value,
                                            })
                                        }
                                        className="input w-full pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords({
                                                ...showPasswords,
                                                [field]: !showPasswords[field],
                                            })
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                                    >
                                        {showPasswords[field] ? (
                                            <FiEyeOff size={18} />
                                        ) : (
                                            <FiEye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1"
                        >
                            {loading ? "Saving..." : "Change Password"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ============================================================================
// MAIN SETTINGS COMPONENT
// ============================================================================

const Settings = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, setTheme, isDark } = useTheme();

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        publicProfile: true,
        showSubscriptions: true,
        showLikedVideos: false,
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth");
        }
    }, [isAuthenticated, navigate]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await updateAvatar(file);
            showSuccess("Avatar updated successfully");
        } catch (error) {
            showError(error.message || "Failed to update avatar");
        }
    };

    const handleDeleteAccount = () => {
        if (
            window.confirm(
                "Are you sure you want to delete your account? This action cannot be undone."
            )
        ) {
            // TODO: Implement account deletion
            showError("Account deletion is not yet implemented");
        }
    };

    return (
        <PageTransition className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                        Settings
                    </h1>
                    <p className="text-[var(--text-tertiary)] mt-1">
                        Manage your account settings and preferences
                    </p>
                </motion.div>

                {/* Profile Section */}
                <SettingsSection
                    title="Profile"
                    description="Your public profile information"
                >
                    <div className="flex items-center gap-6 mb-6">
                        <div className="relative group">
                            <img
                                src={
                                    user?.avatar ||
                                    `https://ui-avatars.com/api/?name=${user?.fullName}&background=7c3aed&color=fff`
                                }
                                alt={user?.fullName}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <FiCamera className="w-6 h-6 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">
                                {user?.fullName}
                            </h3>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                @{user?.userName}
                            </p>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/profile")}
                        className="btn btn-secondary"
                    >
                        Edit Profile
                    </button>
                </SettingsSection>

                {/* Appearance Section */}
                <SettingsSection
                    title="Appearance"
                    description="Customize how the app looks"
                >
                    <SettingsRow
                        icon={isDark ? FiMoon : FiSun}
                        label="Dark Mode"
                        description="Use dark theme for comfortable viewing"
                    >
                        <ToggleSwitch
                            enabled={isDark}
                            onChange={(enabled) =>
                                setTheme(enabled ? "dark" : "light")
                            }
                        />
                    </SettingsRow>
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection
                    title="Notifications"
                    description="Choose what you want to be notified about"
                >
                    <SettingsRow
                        icon={FiBell}
                        label="Email Notifications"
                        description="Receive email updates about your account"
                    >
                        <ToggleSwitch
                            enabled={preferences.emailNotifications}
                            onChange={(v) =>
                                setPreferences({
                                    ...preferences,
                                    emailNotifications: v,
                                })
                            }
                        />
                    </SettingsRow>
                    <SettingsRow
                        icon={FiBell}
                        label="Push Notifications"
                        description="Receive push notifications on this device"
                    >
                        <ToggleSwitch
                            enabled={preferences.pushNotifications}
                            onChange={(v) =>
                                setPreferences({
                                    ...preferences,
                                    pushNotifications: v,
                                })
                            }
                        />
                    </SettingsRow>
                    <SettingsRow
                        icon={FiMail}
                        label="Marketing Emails"
                        description="Receive emails about new features and offers"
                    >
                        <ToggleSwitch
                            enabled={preferences.marketingEmails}
                            onChange={(v) =>
                                setPreferences({
                                    ...preferences,
                                    marketingEmails: v,
                                })
                            }
                        />
                    </SettingsRow>
                </SettingsSection>

                {/* Privacy Section */}
                <SettingsSection
                    title="Privacy"
                    description="Control your privacy settings"
                >
                    <SettingsRow
                        icon={FiGlobe}
                        label="Public Profile"
                        description="Allow others to see your profile"
                    >
                        <ToggleSwitch
                            enabled={preferences.publicProfile}
                            onChange={(v) =>
                                setPreferences({
                                    ...preferences,
                                    publicProfile: v,
                                })
                            }
                        />
                    </SettingsRow>
                    <SettingsRow
                        icon={FiEye}
                        label="Show Subscriptions"
                        description="Let others see who you're subscribed to"
                    >
                        <ToggleSwitch
                            enabled={preferences.showSubscriptions}
                            onChange={(v) =>
                                setPreferences({
                                    ...preferences,
                                    showSubscriptions: v,
                                })
                            }
                        />
                    </SettingsRow>
                    <SettingsRow
                        icon={FiEye}
                        label="Show Liked Videos"
                        description="Let others see videos you've liked"
                    >
                        <ToggleSwitch
                            enabled={preferences.showLikedVideos}
                            onChange={(v) =>
                                setPreferences({
                                    ...preferences,
                                    showLikedVideos: v,
                                })
                            }
                        />
                    </SettingsRow>
                </SettingsSection>

                {/* Security Section */}
                <SettingsSection
                    title="Security"
                    description="Keep your account secure"
                >
                    <SettingsRow
                        icon={FiLock}
                        label="Change Password"
                        description="Update your password regularly"
                    >
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="btn btn-secondary text-sm"
                        >
                            Change
                        </button>
                    </SettingsRow>
                </SettingsSection>

                {/* Danger Zone */}
                <SettingsSection
                    title="Danger Zone"
                    description="Irreversible actions"
                >
                    <SettingsRow
                        icon={FiTrash2}
                        label="Delete Account"
                        description="Permanently delete your account and all data"
                        danger
                    >
                        <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 text-sm font-medium text-[var(--error)] border border-[var(--error)] rounded-lg hover:bg-[var(--error)] hover:text-white transition-colors"
                        >
                            Delete
                        </button>
                    </SettingsRow>
                </SettingsSection>
            </div>

            <AnimatePresence>
                {showPasswordModal && (
                    <PasswordModal
                        isOpen={showPasswordModal}
                        onClose={() => setShowPasswordModal(false)}
                    />
                )}
            </AnimatePresence>
        </PageTransition>
    );
};

export default Settings;
