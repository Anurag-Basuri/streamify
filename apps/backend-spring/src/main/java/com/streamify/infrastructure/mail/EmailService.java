package com.streamify.infrastructure.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Email service using JavaMailSender + Thymeleaf templates.
 * When SMTP credentials are not configured, logs rendered HTML to console.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String smtpUser;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    private boolean isSmtpConfigured() {
        return smtpUser != null && !smtpUser.isBlank();
    }

    /**
     * Send email verification link.
     */
    @Async
    public void sendVerificationEmail(String toEmail, String userName, String token) {
        Context ctx = new Context();
        ctx.setVariable("userName", userName);
        ctx.setVariable("verificationUrl", frontendUrl + "/verify-email/" + token);
        ctx.setVariable("frontendUrl", frontendUrl);

        String html = templateEngine.process("email/verify-email", ctx);
        send(toEmail, "Verify your Streamify account", html);
    }

    /**
     * Send welcome email after verification.
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        Context ctx = new Context();
        ctx.setVariable("userName", userName);
        ctx.setVariable("frontendUrl", frontendUrl);

        String html = templateEngine.process("email/welcome", ctx);
        send(toEmail, "Welcome to Streamify!", html);
    }

    /**
     * Send password reset link.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String token) {
        Context ctx = new Context();
        ctx.setVariable("userName", userName);
        ctx.setVariable("resetUrl", frontendUrl + "/reset-password/" + token);
        ctx.setVariable("frontendUrl", frontendUrl);

        String html = templateEngine.process("email/password-reset", ctx);
        send(toEmail, "Reset your Streamify password", html);
    }

    /**
     * Send password changed confirmation.
     */
    @Async
    public void sendPasswordChangedEmail(String toEmail, String userName) {
        Context ctx = new Context();
        ctx.setVariable("userName", userName);
        ctx.setVariable("frontendUrl", frontendUrl);

        String html = templateEngine.process("email/password-changed", ctx);
        send(toEmail, "Your Streamify password was changed", html);
    }

    private void send(String to, String subject, String htmlBody) {
        if (!isSmtpConfigured()) {
            log.info("╔══════════════════════════════════════════════════════════════╗");
            log.info("║  EMAIL (SMTP not configured — logging to console)           ║");
            log.info("╠══════════════════════════════════════════════════════════════╣");
            log.info("║  To: {}",      to);
            log.info("║  Subject: {}", subject);
            log.info("╠══════════════════════════════════════════════════════════════╣");
            log.info("║  Body:\n{}", htmlBody);
            log.info("╚══════════════════════════════════════════════════════════════╝");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.debug("Email sent to {} — {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
