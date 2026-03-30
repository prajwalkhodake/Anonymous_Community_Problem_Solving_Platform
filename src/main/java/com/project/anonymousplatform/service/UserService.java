package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.User;
import com.project.anonymousplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String anonymousName) {
        if (ContentModerationUtil.containsRestrictedContent(anonymousName)) {
            throw new IllegalArgumentException("Username contains restricted (abusive or 18+) material.");
        }
        if (userRepository.findByAnonymousName(anonymousName).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }
        User user = new User();
        user.setAnonymousName(anonymousName);
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

    // Method to increase trust score when the user takes positive actions
    public void increaseTrustScore(Long userId, int points) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setTrustScore(user.getTrustScore() + points);
            userRepository.save(user);
        });
    }

    // Method to decrease trust score if someone performs poorly 
    public void decreaseTrustScore(Long userId, int points) {
        userRepository.findById(userId).ifPresent(user -> {
            int newScore = user.getTrustScore() - points;
            user.setTrustScore(Math.max(newScore, 0)); // keep score from being negative if desired
            userRepository.save(user);
        });
    }
}
