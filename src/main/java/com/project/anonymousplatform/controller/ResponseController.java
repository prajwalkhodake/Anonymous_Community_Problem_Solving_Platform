package com.project.anonymousplatform.controller;

import com.project.anonymousplatform.entity.Response;
import com.project.anonymousplatform.service.ResponseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responses")
public class ResponseController {

    private final ResponseService responseService;

    public ResponseController(ResponseService responseService) {
        this.responseService = responseService;
    }

    // POST /api/responses
    @PostMapping
    public ResponseEntity<Response> createResponse(@RequestBody Response response) {
        return ResponseEntity.ok(responseService.createResponse(response));
    }

    // GET /api/responses/problem/1  ← all responses for a problem
    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<Response>> getByProblem(@PathVariable Long problemId) {
        return ResponseEntity.ok(responseService.getResponsesByProblemId(problemId));
    }

    // GET /api/responses/user/1  ← all responses by a user
    @GetMapping("/user/{authorId}")
    public ResponseEntity<List<Response>> getByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(responseService.getResponsesByAuthorId(authorId));
    }

    // PATCH /api/responses/1/helpful  ← mark as helpful
    @PatchMapping("/{id}/helpful")
    public ResponseEntity<Response> markHelpful(@PathVariable Long id) {
        return ResponseEntity.ok(responseService.markAsHelpful(id));
    }

    // DELETE /api/responses/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResponse(@PathVariable Long id) {
        responseService.deleteResponse(id);
        return ResponseEntity.noContent().build();
    }
}