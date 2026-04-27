package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.Problem;
import com.project.anonymousplatform.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public Problem createProblem(Problem problem) {
        // Validate required fields
        if (problem.getTitle() == null || problem.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Problem title cannot be empty");
        }
        if (problem.getDescription() == null || problem.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Problem description cannot be empty");
        }

        // Content moderation check
        if (ContentModerationUtil.containsRestrictedContent(problem.getTitle())) {
            throw new IllegalArgumentException("Title contains restricted content");
        }
        if (ContentModerationUtil.containsRestrictedContent(problem.getDescription())) {
            throw new IllegalArgumentException("Description contains restricted content");
        }

        // Timestamps and status are now handled by @PrePersist in the entity
        return problemRepository.save(problem);
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Optional<Problem> getProblemById(Long id) {
        return problemRepository.findById(id);
    }

    // ← this fixes "Cannot resolve getProblemsByUserId" error
    public List<Problem> getProblemsByUserId(Long userId) {
        return problemRepository.findByAuthorId(userId);
    }

    // ← this fixes "Cannot resolve getProblemsByCategory" error
    public List<Problem> getProblemsByCategory(String category) {
        return problemRepository.findByCategory(category);
    }

    public void deleteProblem(Long id) {
        if (!problemRepository.existsById(id)) {
            throw new IllegalArgumentException("Problem not found with id: " + id);
        }
        problemRepository.deleteById(id);
    }

    public Problem likeProblem(Long id) {
        Problem problem = problemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Problem not found with id: " + id));
        problem.setLikes(problem.getLikes() + 1);
        return problemRepository.save(problem);
    }
}