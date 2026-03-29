package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.Response;
import com.project.anonymousplatform.repository.ResponseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class ResponseService {

    private final ResponseRepository responseRepository;
    private final UserService userService;

    public ResponseService(ResponseRepository responseRepository, UserService userService) {
        this.responseRepository = responseRepository;
        this.userService = userService;
    }

    public Response createResponse(Response response) {
        if (response.getCreatedAt() == null) {
            response.setCreatedAt(LocalDateTime.now());
        }
        Response savedResponse = responseRepository.save(response);
        
        // Award 2 trust score points for participating with a response
        if (savedResponse.getAuthor() != null) {
            userService.increaseTrustScore(savedResponse.getAuthor().getId(), 2);
        }
        
        return savedResponse;
    }

    public List<Response> getAllResponses() {
        return responseRepository.findAll();
    }

    public List<Response> getResponsesByProblem(Long problemId) {
        if (problemId == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }
        return responseRepository.findByProblemId(problemId);
    }

    public Optional<Response> getResponseById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }
        return responseRepository.findById(id);
    }

    public Response updateResponse(Long id, Response updatedResponse) {
        if (id == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }
        
        Response existingResponse = responseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Response not found with id " + id));

        if (updatedResponse.getContent() != null) {
            existingResponse.setContent(updatedResponse.getContent());
        }
        if (updatedResponse.getResponseType() != null) {
            existingResponse.setResponseType(updatedResponse.getResponseType());
        }
        
        // If the response is marked as helpful and wasn't before
        if (updatedResponse.getIsHelpful() != null && updatedResponse.getIsHelpful() && !Boolean.TRUE.equals(existingResponse.getIsHelpful())) {
            existingResponse.setIsHelpful(true);
            if (existingResponse.getAuthor() != null) {
                // Award 10 trust score points for a helpful answer
                userService.increaseTrustScore(existingResponse.getAuthor().getId(), 10);
            }
        }
        
        return responseRepository.save(existingResponse);
    }

    public void deleteResponse(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }
        responseRepository.deleteById(id);
    }
}