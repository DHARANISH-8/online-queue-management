package com.queue.backend.notification.service;

import com.queue.backend.counter.entity.Counter;
import com.queue.backend.queue.QueueToken;
import com.queue.backend.user.entity.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@queue-app.local}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAppointmentBookingSuccess(User user, QueueToken token) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank() || token == null) {
            return;
        }

        String counterName = token.getCounter() != null ? token.getCounter().getCounterName() : "N/A";
        String serviceType = token.getServiceType() != null ? token.getServiceType() : "General";
        String subject = "Appointment Confirmed | " + formatDisplayToken(token);
        String content = "<p style='margin:0 0 16px;'>Hello <strong>" + escapeHtml(safeName(user.getName())) + "</strong>,</p>"
                + "<p style='margin:0 0 16px;'>Your appointment has been confirmed successfully. Here are your queue details:</p>"
                + detailTable(
                "Token", formatDisplayToken(token),
                "Counter", counterName,
                "Department", serviceType,
                "Status", "Confirmed")
                + "<p style='margin:16px 0 0;'>Please arrive at least <strong>10 minutes early</strong> and keep this email for reference.</p>";

        sendHtmlEmail(user.getEmail(), subject, buildTemplate("Appointment Confirmation", "Your booking is now confirmed.", content));
    }

    public void sendCounterStarted(User user, Counter counter, QueueToken token) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank() || counter == null) {
            return;
        }

        String subject = "Queue Update | Counter Now Open";
        String content = "<p style='margin:0 0 16px;'>Hello <strong>" + escapeHtml(safeName(user.getName())) + "</strong>,</p>"
                + "<p style='margin:0 0 16px;'>Your assigned counter is now open. Please get ready for your turn.</p>"
                + detailTable(
                "Counter", counter.getCounterName(),
                "Department", counter.getServiceType() == null ? "General" : counter.getServiceType(),
                "Token", token != null ? formatDisplayToken(token) : "Assigned",
                "Status", "Queue Started")
                + "<p style='margin:16px 0 0;'>Thank you for choosing our service.</p>";

        sendHtmlEmail(user.getEmail(), subject, buildTemplate("Counter Started", "Your consultation queue is active.", content));
    }

    public void sendDoctorQueueStarted(User user, User doctor, Counter counter, QueueToken token) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        String doctorName = (doctor == null || doctor.getName() == null || doctor.getName().isBlank())
                ? "your doctor"
                : doctor.getName();
        String counterName = counter != null && counter.getCounterName() != null ? counter.getCounterName() : "Assigned counter";
        String subject = "Doctor Available | Queue Started";
        String content = "<p style='margin:0 0 16px;'>Hello <strong>" + escapeHtml(safeName(user.getName())) + "</strong>,</p>"
                + "<p style='margin:0 0 16px;'>Dr. <strong>" + escapeHtml(doctorName) + "</strong> has started today's queue.</p>"
                + detailTable(
                "Doctor", "Dr. " + doctorName,
                "Counter", counterName,
                "Token", token != null ? formatDisplayToken(token) : "Assigned",
                "Action", "Please proceed to waiting area")
                + "<p style='margin:16px 0 0;'>Our team will call you shortly when your turn arrives.</p>";

        sendHtmlEmail(user.getEmail(), subject, buildTemplate("Queue Started by Doctor", "Please proceed to your waiting area.", content));
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send email to {} for subject '{}': {}", to, subject, ex.getMessage());
        }
    }

    private String safeName(String name) {
        return (name == null || name.isBlank()) ? "User" : name;
    }

    private String formatDisplayToken(QueueToken token) {
        String prefix = token.getCounter() != null && token.getCounter().getCounterName() != null
                ? token.getCounter().getCounterName()
                : "T";
        return prefix + "-" + String.format("%03d", token.getTokenNumber());
    }

    private String buildTemplate(String title, String subtitle, String contentHtml) {
        return "<!doctype html><html><body style='margin:0;background:#f4f7fb;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='padding:24px;'>"
                + "<tr><td align='center'>"
                + "<table role='presentation' width='640' cellspacing='0' cellpadding='0' style='max-width:640px;background:#ffffff;border:1px solid #dbe7f5;border-radius:14px;overflow:hidden;'>"
                + "<tr><td style='background:linear-gradient(135deg,#0f4c81,#1d5fa8);padding:22px 24px;color:#ffffff;'>"
                + "<h1 style='margin:0;font-size:22px;line-height:1.3;'>" + escapeHtml(title) + "</h1>"
                + "<p style='margin:6px 0 0;font-size:14px;opacity:0.92;'>" + escapeHtml(subtitle) + "</p>"
                + "</td></tr>"
                + "<tr><td style='padding:24px;font-size:15px;line-height:1.65;color:#1e293b;'>" + contentHtml + "</td></tr>"
                + "<tr><td style='padding:16px 24px;background:#f8fbff;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;'>"
                + "Queue Management System | This is an automated notification."
                + "</td></tr>"
                + "</table>"
                + "</td></tr></table></body></html>";
    }

    private String detailTable(String label1, String value1, String label2, String value2, String label3, String value3, String label4, String value4) {
        return "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border:1px solid #dbe7f5;border-radius:10px;overflow:hidden;'>"
                + tableRow(label1, value1)
                + tableRow(label2, value2)
                + tableRow(label3, value3)
                + tableRow(label4, value4)
                + "</table>";
    }

    private String tableRow(String label, String value) {
        return "<tr>"
                + "<td style='padding:10px 12px;background:#f8fbff;border-bottom:1px solid #e2e8f0;color:#475569;width:34%;font-size:13px;'>" + escapeHtml(label) + "</td>"
                + "<td style='padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;font-size:13px;'>" + escapeHtml(value) + "</td>"
                + "</tr>";
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
