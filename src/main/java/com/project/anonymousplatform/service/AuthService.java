package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.User;
import com.project.anonymousplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    private String generateOTP() {
        Random rnd = new Random();
        int number = rnd.nextInt(999999);
        return String.format("%06d", number);
    }

    public void register(String anonymousName, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (userRepository.existsByAnonymousName(anonymousName)) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (ContentModerationUtil.containsRestrictedContent(anonymousName)) {
            throw new IllegalArgumentException("Username contains restricted material.");
        }

        User user = new User();
        user.setAnonymousName(anonymousName);
        user.setEmail(email);
        user.setPassword(password); // Note: In production, hash this password using BCrypt
        user.setIsVerified(false);
        user.setTrustScore(0);
        user.setCreatedAt(LocalDateTime.now());

        String otp = generateOTP();
        user.setVerificationCode(otp);
        user.setCodeExpiryTime(LocalDateTime.now().plusMinutes(10)); // OTP valid for 10 minutes

        userRepository.save(user);

        // Send email with OTP and Terms & Conditions
        emailService.sendRegistrationEmail(email, otp);
    }

    public boolean verifyRegistration(String email, String otp) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = optionalUser.get();

        if (user.getIsVerified()) {
            throw new IllegalArgumentException("User is already verified");
        }
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(otp)) {
            throw new IllegalArgumentException("Invalid verification code");
        }
        if (user.getCodeExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setIsVerified(true);
        user.setVerificationCode(null);
        user.setCodeExpiryTime(null);
        userRepository.save(user);

        return true;
    }

    public void initiateLogin(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        User user = optionalUser.get();

        if (!user.getPassword().equals(password)) { // Again, in prod use BCrypt matches
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (!user.getIsVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in");
        }

        String otp = generateOTP();
        user.setVerificationCode(otp);
        user.setCodeExpiryTime(LocalDateTime.now().plusMinutes(5)); // Login OTP valid for 5 mins
        userRepository.save(user);

        emailService.sendLoginOtp(email, otp);
    }

    public User verifyLogin(String email, String otp) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = optionalUser.get();

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }
        if (user.getCodeExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        // Clear OTP after successful login
        user.setVerificationCode(null);
        user.setCodeExpiryTime(null);
        userRepository.save(user);

        return user;
    }
}
