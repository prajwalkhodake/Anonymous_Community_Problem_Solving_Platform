package com.project.anonymousplatform.controller;

import com.project.anonymousplatform.entity.User;
import com.project.anonymousplatform.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String anonymousName = request.get("anonymousName");
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null || anonymousName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, password, and anonymousName are required"));
        }

        authService.register(anonymousName, email, password);
        return ResponseEntity.ok(Map.of("message", "Registration successful. Please check your email for the verification code."));
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<?> verifyRegistration(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        authService.verifyRegistration(email, otp);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now login."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        authService.initiateLogin(email, password);
        return ResponseEntity.ok(Map.of("message", "OTP sent to your email."));
    }

    @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        User user = authService.verifyLogin(email, otp);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        authService.resendOtp(email);
        return ResponseEntity.ok(Map.of("message", "A new verification code has been sent to your email."));
    }
}
