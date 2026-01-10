import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email configuration
const EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || "Streamify <noreply@streamify.com>",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

// Create transporter
const createTransporter = () => {
    // Use environment variables for configuration
    const config = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    };

    return nodemailer.createTransport(config);
};

// Cache compiled templates
const templateCache = new Map();

// Load and compile template
const getTemplate = (templateName) => {
    if (templateCache.has(templateName)) {
        return templateCache.get(templateName);
    }

    const templatePath = path.join(
        __dirname,
        "..",
        "templates",
        `${templateName}.hbs`
    );

    try {
        const templateSource = fs.readFileSync(templatePath, "utf-8");
        const compiled = handlebars.compile(templateSource);
        templateCache.set(templateName, compiled);
        return compiled;
    } catch (error) {
        console.error(`Failed to load template ${templateName}:`, error);
        throw new Error(`Email template ${templateName} not found`);
    }
};

// Generate secure token
export const generateToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// Hash token for storage
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

// Send email
const sendEmail = async ({ to, subject, template, context }) => {
    try {
        const transporter = createTransporter();
        const compiledTemplate = getTemplate(template);

        // Add common context variables
        const fullContext = {
            ...context,
            year: new Date().getFullYear(),
            appName: "Streamify",
            frontendUrl: EMAIL_CONFIG.frontendUrl,
        };

        const html = compiledTemplate(fullContext);

        const mailOptions = {
            from: EMAIL_CONFIG.from,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
};

// Email sending functions
export const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `${EMAIL_CONFIG.frontendUrl}/verify-email/${token}`;

    return sendEmail({
        to: user.email,
        subject: "Verify your Streamify account",
        template: "verify-email",
        context: {
            name: user.fullName,
            verificationUrl,
            expiresIn: "24 hours",
        },
    });
};

export const sendWelcomeEmail = async (user) => {
    return sendEmail({
        to: user.email,
        subject: "Welcome to Streamify! 🎉",
        template: "welcome",
        context: {
            name: user.fullName,
            exploreUrl: `${EMAIL_CONFIG.frontendUrl}/explore`,
            uploadUrl: `${EMAIL_CONFIG.frontendUrl}/upload`,
            profileUrl: `${EMAIL_CONFIG.frontendUrl}/profile`,
        },
    });
};

export const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${EMAIL_CONFIG.frontendUrl}/reset-password/${token}`;

    return sendEmail({
        to: user.email,
        subject: "Reset your Streamify password",
        template: "password-reset",
        context: {
            name: user.fullName,
            resetUrl,
            expiresIn: "1 hour",
        },
    });
};

export const sendPasswordChangedEmail = async (user) => {
    return sendEmail({
        to: user.email,
        subject: "Your Streamify password was changed",
        template: "password-changed",
        context: {
            name: user.fullName,
            changeTime: new Date().toLocaleString(),
            resetUrl: `${EMAIL_CONFIG.frontendUrl}/forgot-password`,
        },
    });
};

// Verify transporter connection
export const verifyEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log("✅ Email server connection verified");
        return true;
    } catch (error) {
        console.error("❌ Email server connection failed:", error.message);
        return false;
    }
};

export default {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail,
    generateToken,
    hashToken,
    verifyEmailConnection,
};
