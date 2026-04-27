package com.project.anonymousplatform.controller;

import com.project.anonymousplatform.entity.Problem;
import com.project.anonymousplatform.service.ProblemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")        // ← add /api prefix to match UserController pattern
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    // POST /api/problems
    @PostMapping
    public ResponseEntity<Problem> createProblem(@RequestBody Problem problem) {
        Problem created = problemService.createProblem(problem);
        return ResponseEntity.ok(created);      // ← return ResponseEntity, not raw object
    }

    // GET /api/problems
    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    // GET /api/problems/1
    @GetMapping("/{id}")                        // ← add get by ID
    public ResponseEntity<Problem> getProblemById(@PathVariable Long id) {
        return problemService.getProblemById(id)
                .map(problem -> ResponseEntity.ok(problem))
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/problems/user/5  ← get all problems by a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Problem>> getProblemsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(problemService.getProblemsByUserId(userId));
    }

    // GET /api/problems/category/TECH  ← filter by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Problem>> getProblemsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(problemService.getProblemsByCategory(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/problems/1/like
    @PutMapping("/{id}/like")
    public ResponseEntity<Problem> likeProblem(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.likeProblem(id));
    }
}