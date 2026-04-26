package com.project.anonymousplatform.repository;

import com.project.anonymousplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;  // ← add this
import java.util.Optional;

@Repository  // ← add this annotation
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByAnonymousName(String anonymousName);
    boolean existsByAnonymousName(String anonymousName);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}