package com.project.anonymousplatform.controller;

import com.project.anonymousplatform.entity.User;
import com.project.anonymousplatform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {   // constructor injection, not @Autowired
        this.userService = userService;
    }

    // POST /api/users?anonymousName=SilentFox
    @PostMapping
    public ResponseEntity<User> createUser(@RequestParam String anonymousName) {
        User user = userService.createUser(anonymousName);
        return ResponseEntity.ok(user);
    }

    // GET /api/users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/users/1
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(user))   // ← explicit lambda, fixes 'ok' ambiguity
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/users/name/SilentFox
    @GetMapping("/name/{anonymousName}")
    public ResponseEntity<User> getUserByName(@PathVariable String anonymousName) {
        return userService.getUserByAnonymousName(anonymousName)   // ← fixed method name
                .map(user -> ResponseEntity.ok(user))              // ← explicit lambda, fixes 'ok' ambiguity
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/users/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}