package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.Problem;
import com.project.anonymousplatform.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public Problem createProblem(Problem problem) {
        problem.setCreatedAt(LocalDateTime.now());
        problem.setUpdatedAt(LocalDateTime.now());
        if (problem.getStatus() == null) {
            problem.setStatus("OPEN");
        }
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
}