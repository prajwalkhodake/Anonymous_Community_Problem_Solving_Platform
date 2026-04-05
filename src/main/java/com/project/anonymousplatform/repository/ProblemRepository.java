package com.project.anonymousplatform.repository;

import com.project.anonymousplatform.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByAuthorId(Long authorId);         // ← used by getProblemsByUserId
    List<Problem> findByCategory(String category);       // ← used by getProblemsByCategory
    List<Problem> findByStatus(String status);           // ← useful for filtering OPEN/CLOSED
}