package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.Problem;
import com.project.anonymousplatform.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserService userService;

    public ProblemService(ProblemRepository problemRepository, UserService userService) {
        this.problemRepository = problemRepository;
        this.userService = userService;
    }

    public Problem createProblem(Problem problem) {
        if (problem.getCreatedAt() == null) {
            problem.setCreatedAt(LocalDateTime.now());
        }
        if (problem.getUpdatedAt() == null) {
            problem.setUpdatedAt(LocalDateTime.now());
        }
        if (problem.getStatus() == null) {
            problem.setStatus("OPEN");
        }
        Problem savedProblem = problemRepository.save(problem);
        
        // Award 5 trust score points for sharing a problem/asking for help
        if (savedProblem.getAuthor() != null) {
            userService.increaseTrustScore(savedProblem.getAuthor().getId(), 5);
        }
        
        return savedProblem;
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Optional<Problem> getProblemById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }
        return problemRepository.findById(id);
    }

    public void deleteProblem(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }
        problemRepository.deleteById(id);
    }

    public Problem updateProblem(Long id, Problem updatedProblem) {
        if (id == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }
        
        Problem existingProblem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found with id " + id));

        if (updatedProblem.getTitle() != null) {
            existingProblem.setTitle(updatedProblem.getTitle());
        }
        if (updatedProblem.getDescription() != null) {
            existingProblem.setDescription(updatedProblem.getDescription());
        }
        if (updatedProblem.getCategory() != null) {
            existingProblem.setCategory(updatedProblem.getCategory());
        }
        if (updatedProblem.getStatus() != null) {
            existingProblem.setStatus(updatedProblem.getStatus());
        }
        existingProblem.setUpdatedAt(LocalDateTime.now());
        
        return problemRepository.save(existingProblem);
    }
}