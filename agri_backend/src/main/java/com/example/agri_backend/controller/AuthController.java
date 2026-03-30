package com.example.agri_backend.controller;

import com.example.agri_backend.dto.AuthDTO;
import com.example.agri_backend.dto.AuthDTO.*;
import com.example.agri_backend.entity.User;
import com.example.agri_backend.entity.User.UserRole;
import com.example.agri_backend.repository.UserRepository;
import com.example.agri_backend.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getEntityId(), user.getName());

        AuthResponse.UserInfo info = new AuthResponse.UserInfo();
        info.setId(user.getEntityId());
        info.setUsername(user.getUsername());
        info.setName(user.getName());
        info.setRole(user.getRole().name());
        info.setEntityId(user.getEntityId());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(info);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .name(req.getName())
                .role(UserRole.valueOf(req.getRole().toUpperCase()))
                .entityId(req.getEntityId())
                .build();

        userRepository.save(user);
        return ResponseEntity.ok().body(java.util.Map.of("message", "User registered successfully"));
    }
}
