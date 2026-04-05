package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.User;
import com.project.anonymousplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String anonymousName) {
        if (anonymousName == null || anonymousName.trim().isEmpty()) {   // ← add null/blank guard
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (ContentModerationUtil.containsRestrictedContent(anonymousName)) {
            throw new IllegalArgumentException("Username contains restricted material.");
        }
        if (userRepository.findByAnonymousName(anonymousName).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }
        User user = new User();
        user.setAnonymousName(anonymousName.trim());   // ← trim whitespace before saving
        user.setTrustScore(0);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<User> getUserById(Long id) {
        if (id == null) throw new IllegalArgumentException("The given id must not be null");
        return userRepository.findById(id);
    }

    public Optional<User> getUserByAnonymousName(String anonymousName) {
        return userRepository.findByAnonymousName(anonymousName);
    }

    public List<User> getAllUsers() {          // ← add this, useful for admin panel
        return userRepository.findAll();
    }

    public void increaseTrustScore(Long userId, int points) {
        if (points <= 0) throw new IllegalArgumentException("Points must be positive");   // ← add guard
        userRepository.findById(userId).ifPresent(user -> {
            user.setTrustScore(user.getTrustScore() + points);
            userRepository.save(user);
        });
    }

    public void decreaseTrustScore(Long userId, int points) {
        if (points <= 0) throw new IllegalArgumentException("Points must be positive");   // ← add guard
        userRepository.findById(userId).ifPresent(user -> {
            int newScore = user.getTrustScore() - points;
            user.setTrustScore(Math.max(newScore, 0));
            userRepository.save(user);
        });
    }

    public void deleteUser(Long id) {          // ← add this, needed for admin panel
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}