package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.User;
import com.project.anonymousplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // Cooldown: user must wait at least 60 seconds between OTP requests
    private static final int OTP_COOLDOWN_SECONDS = 60;

    public AuthService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    private String generateOTP() {
        int number = SECURE_RANDOM.nextInt(900000) + 100000; // Always 6 digits (100000–999999)
        return String.valueOf(number);
    }

    // ── REGISTER ──
    public void register(String anonymousName, String email, String password) {
        if (anonymousName == null || anonymousName.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (email == null || !email.matches("^[\\w.-]+@[\\w.-]+\\.\\w{2,}$")) {
            throw new IllegalArgumentException("Please provide a valid email address");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        if (ContentModerationUtil.containsRestrictedContent(anonymousName)) {
            throw new IllegalArgumentException("Username contains restricted material");
        }
        if (userRepository.existsByAnonymousName(anonymousName.trim())) {
            throw new IllegalArgumentException("Username already taken");
        }

        // If email already exists but is NOT verified, allow re-registration (overwrite)
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            if (existing.getIsVerified()) {
                throw new IllegalArgumentException("Email already registered");
            }
            // Delete unverified user so they can re-register
            userRepository.delete(existing);
        }

        User user = new User();
        user.setAnonymousName(anonymousName.trim());
        user.setEmail(email.trim().toLowerCase());
        user.setPassword(password);
        user.setIsVerified(false);
        user.setTrustScore(0);

        String otp = generateOTP();
        user.setVerificationCode(otp);
        user.setCodeExpiryTime(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);
        emailService.sendRegistrationEmail(email, otp);
    }

    // ── VERIFY REGISTRATION ──
    public boolean verifyRegistration(String email, String otp) {
        User user = findUserByEmailOrThrow(email);

        if (user.getIsVerified()) {
            throw new IllegalArgumentException("User is already verified");
        }
        validateOtp(user, otp);

        user.setIsVerified(true);
        user.setVerificationCode(null);
        user.setCodeExpiryTime(null);
        userRepository.save(user);

        return true;
    }

    // ── INITIATE LOGIN ──
    public void initiateLogin(String email, String password) {
        User user = findUserByEmailOrThrow(email);

        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (!user.getIsVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in");
        }

        // Rate limit: prevent OTP spam
        if (user.getCodeExpiryTime() != null) {
            LocalDateTime cooldownEnd = user.getCodeExpiryTime().minusMinutes(5).plusSeconds(OTP_COOLDOWN_SECONDS);
            if (LocalDateTime.now().isBefore(cooldownEnd)) {
                throw new IllegalArgumentException("Please wait before requesting a new code");
            }
        }

        String otp = generateOTP();
        user.setVerificationCode(otp);
        user.setCodeExpiryTime(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendLoginOtp(email, otp);
    }

    // ── VERIFY LOGIN ──
    public User verifyLogin(String email, String otp) {
        User user = findUserByEmailOrThrow(email);
        validateOtp(user, otp);

        user.setVerificationCode(null);
        user.setCodeExpiryTime(null);
        userRepository.save(user);

        return user;
    }

    // ── RESEND OTP ──
    public void resendOtp(String email) {
        User user = findUserByEmailOrThrow(email);

        // Rate limit: prevent OTP spam
        if (user.getCodeExpiryTime() != null) {
            LocalDateTime sentAt = user.getCodeExpiryTime().minusMinutes(user.getIsVerified() ? 5 : 10);
            if (LocalDateTime.now().isBefore(sentAt.plusSeconds(OTP_COOLDOWN_SECONDS))) {
                throw new IllegalArgumentException("Please wait before requesting a new code");
            }
        }

        String otp = generateOTP();
        user.setVerificationCode(otp);

        if (user.getIsVerified()) {
            // Login resend
            user.setCodeExpiryTime(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);
            emailService.sendLoginOtp(email, otp);
        } else {
            // Registration resend
            user.setCodeExpiryTime(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            emailService.sendRegistrationEmail(email, otp);
        }
    }

    // ── HELPER METHODS ──

    private User findUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void validateOtp(User user, String otp) {
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(otp)) {
            throw new IllegalArgumentException("Invalid verification code");
        }
        if (user.getCodeExpiryTime() == null || user.getCodeExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }
    }
}
