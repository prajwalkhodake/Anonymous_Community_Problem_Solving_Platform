package com.project.anonymousplatform.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendRegistrationEmail(String to, String otp) {
        String subject = "Welcome to Anonymous Platform — Verify Your Email";
        String html = buildRegistrationHtml(otp);
        sendHtmlEmail(to, subject, html, otp);
    }

    @Async
    public void sendLoginOtp(String to, String otp) {
        String subject = "Your Login Verification Code";
        String html = buildLoginOtpHtml(otp);
        sendHtmlEmail(to, subject, html, otp);
    }

    private void sendHtmlEmail(String to, String subject, String html, String otpForLog) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true); // true = HTML
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("═══ EMAIL FAILED (check SMTP settings) ═══");
            System.err.println("To: " + to);
            System.err.println("OTP CODE: " + otpForLog);
            System.err.println("Error: " + e.getMessage());
        }
    }

    // ──────────────────────────────────────────────
    // HTML EMAIL TEMPLATES
    // ──────────────────────────────────────────────

    private String buildRegistrationHtml(String otp) {
        return """
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0c0e16;color:#e0e0e0;border-radius:16px;overflow:hidden;border:1px solid #1a1d2e">
              <div style="background:linear-gradient(135deg,#00c9a7,#845ec2,#d65db1);padding:28px 32px;text-align:center">
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">🔒 Anonymous Platform</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px">Verify your email to get started</p>
              </div>

              <div style="padding:28px 32px">
                <p style="font-size:15px;line-height:1.7;color:#ccc">Welcome! Use the code below to complete your registration:</p>

                <div style="background:#141624;border:1px solid #252840;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
                  <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#00c9a7">%s</span>
                  <p style="margin:10px 0 0;font-size:12px;color:#888">This code expires in 10 minutes</p>
                </div>

                <div style="background:#141624;border:1px solid #252840;border-radius:12px;padding:20px;margin-top:20px">
                  <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#845ec2">📜 Terms, Conditions & Rules</h3>
                  <ol style="margin:0;padding-left:20px;font-size:13px;line-height:2;color:#aaa">
                    <li><strong style="color:#e0e0e0">Be Kind & Supportive</strong> — Treat all members with respect.</li>
                    <li><strong style="color:#e0e0e0">Respect Anonymity</strong> — Do not reveal the identity of yourself or others.</li>
                    <li><strong style="color:#e0e0e0">Offer Genuine Advice</strong> — Focus on solving the problem presented.</li>
                    <li><strong style="color:#e0e0e0">No Hate Speech</strong> — Discrimination results in immediate ban.</li>
                    <li><strong style="color:#e0e0e0">No Personal Attacks</strong> — Attack the problem, not the person.</li>
                  </ol>
                  <p style="margin:14px 0 0;font-size:12px;color:#777;border-top:1px solid #252840;padding-top:12px">By verifying your account, you agree to abide by these rules. Violations may result in account termination.</p>
                </div>
              </div>

              <div style="background:#0a0c14;padding:16px 32px;text-align:center;border-top:1px solid #1a1d2e">
                <p style="margin:0;font-size:11px;color:#555">© 2026 Anonymous Platform · All rights reserved</p>
              </div>
            </div>
            """.formatted(otp);
    }

    private String buildLoginOtpHtml(String otp) {
        return """
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0c0e16;color:#e0e0e0;border-radius:16px;overflow:hidden;border:1px solid #1a1d2e">
              <div style="background:linear-gradient(135deg,#4facfe,#00f2fe);padding:28px 32px;text-align:center">
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800">🔐 Login Verification</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px">Anonymous Platform</p>
              </div>

              <div style="padding:28px 32px">
                <p style="font-size:15px;line-height:1.7;color:#ccc">Your login verification code:</p>

                <div style="background:#141624;border:1px solid #252840;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
                  <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#4facfe">%s</span>
                  <p style="margin:10px 0 0;font-size:12px;color:#888">This code expires in 5 minutes</p>
                </div>

                <p style="font-size:13px;color:#777;line-height:1.6">If you did not request this code, please ignore this email. Do not share this code with anyone.</p>
              </div>

              <div style="background:#0a0c14;padding:16px 32px;text-align:center;border-top:1px solid #1a1d2e">
                <p style="margin:0;font-size:11px;color:#555">© 2026 Anonymous Platform · All rights reserved</p>
              </div>
            </div>
            """.formatted(otp);
    }
}
