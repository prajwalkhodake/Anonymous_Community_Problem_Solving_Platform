package com.project.anonymousplatform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "anonymous_name", unique = true)
    private String anonymousName;

    @Column(unique = true)
    private String email;

    @Column
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verification_code")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String verificationCode;

    @Column(name = "code_expiry_time")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private LocalDateTime codeExpiryTime;

    @Column(name = "trust_score")
    private Integer trustScore = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Problem> problems;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Response> responses;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (trustScore == null) {
            trustScore = 0;
        }
    }

    public User() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAnonymousName() {
        return anonymousName;
    }

    public void setAnonymousName(String anonymousName) {
        this.anonymousName = anonymousName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public LocalDateTime getCodeExpiryTime() {
        return codeExpiryTime;
    }

    public void setCodeExpiryTime(LocalDateTime codeExpiryTime) {
        this.codeExpiryTime = codeExpiryTime;
    }

    public Integer getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(Integer trustScore) {
        this.trustScore = trustScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Problem> getProblems() {
        return problems;
    }

    public void setProblems(List<Problem> problems) {
        this.problems = problems;
    }

    public List<Response> getResponses() {
        return responses;
    }

    public void setResponses(List<Response> responses) {
        this.responses = responses;
    }
}
