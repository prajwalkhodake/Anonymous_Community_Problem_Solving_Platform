package com.project.anonymousplatform.repository;

import com.project.anonymousplatform.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    List<Response> findByProblemId(Long problemId);   // ← get all responses for a problem
    List<Response> findByAuthorId(Long authorId);     // ← get all responses by a user
    List<Response> findByIsHelpful(Boolean isHelpful);// ← filter helpful responses
}