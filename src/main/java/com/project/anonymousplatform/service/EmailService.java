package com.project.anonymousplatform.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendRegistrationEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Welcome to Anonymous Platform - Verify Your Email");
        
        String text = "Welcome to the Anonymous Community Problem Solving Platform!\n\n" +
                "Your email verification code is: " + otp + "\n\n" +
                "Please enter this code on the registration page to verify your account.\n\n" +
                "=== Terms, Conditions, and Rules ===\n" +
                "1. Be Kind & Supportive: Treat all members with respect.\n" +
                "2. Respect Anonymity: Do not attempt to reveal the real identity of yourself or others.\n" +
                "3. Offer Genuine Advice: Focus on helping solve the problem presented.\n" +
                "4. No Hate Speech: Any form of discrimination or hate speech will result in immediate ban.\n" +
                "5. No Personal Attacks: Attack the problem, not the person.\n\n" +
                "By verifying your account, you agree to abide by these rules. Violations may result in account termination.\n\n" +
                "Thank you for joining our community!\n" +
                "- Anonymous Platform Team";
        
        message.setText(text);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Log the error but don't crash the app if mail properties are not set up perfectly yet.
            // For development, we print to console.
            System.err.println("Failed to send email to " + to + ". Check SMTP settings.");
            System.err.println("EMAIL CONTENT:\n" + text);
        }
    }

    public void sendLoginOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Login Verification Code");
        
        String text = "Your login verification code is: " + otp + "\n\n" +
                "If you did not request this code, please ignore this email.";
        
        message.setText(text);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Log the error but don't crash the app if mail properties are not set up perfectly yet.
            System.err.println("Failed to send OTP email to " + to + ". Check SMTP settings.");
            System.err.println("OTP CODE: " + otp);
        }
    }
}
