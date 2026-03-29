package com.project.anonymousplatform.repository;

import com.project.anonymousplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByAnonymousName(String anonymousName);
}
