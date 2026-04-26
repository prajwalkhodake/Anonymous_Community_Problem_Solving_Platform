package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.Response;
import com.project.anonymousplatform.repository.ResponseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResponseService {

    private final ResponseRepository responseRepository;

    public ResponseService(ResponseRepository responseRepository) {
        this.responseRepository = responseRepository;
    }

    public Response createResponse(Response response) {
        if (response.getContent() == null || response.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Response content cannot be empty");
        }

        // Content moderation check
        if (ContentModerationUtil.containsRestrictedContent(response.getContent())) {
            throw new IllegalArgumentException("Response contains restricted content");
        }

        // Timestamp and isHelpful default are now handled by @PrePersist in the entity
        return responseRepository.save(response);
    }

    public List<Response> getAllResponses() {
        return responseRepository.findAll();
    }

    public Optional<Response> getResponseById(Long id) {
        return responseRepository.findById(id);
    }

    // ← get all responses under a specific problem/post
    public List<Response> getResponsesByProblemId(Long problemId) {
        return responseRepository.findByProblemId(problemId);
    }

    // ← get all responses written by a specific user
    public List<Response> getResponsesByAuthorId(Long authorId) {
        return responseRepository.findByAuthorId(authorId);
    }

    // ← mark a response as helpful (increases trust score)
    public Response markAsHelpful(Long responseId) {
        Response response = responseRepository.findById(responseId)
                .orElseThrow(() -> new IllegalArgumentException("Response not found: " + responseId));
        response.setIsHelpful(true);
        return responseRepository.save(response);
    }

    public void deleteResponse(Long id) {
        if (!responseRepository.existsById(id)) {
            throw new IllegalArgumentException("Response not found with id: " + id);
        }
        responseRepository.deleteById(id);
    }
}