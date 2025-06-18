package com.example; // Ensure this package is correct

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class AuthController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Handles user registration.
     */
    public HttpHandler handleRegister() {
        return exchange -> {
            setCorsHeaders(exchange); // Add CORS headers for every request

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1); // Handle preflight
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "Method Not Allowed");
                return;
            }

            try {
                String requestBody = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                        .lines().collect(Collectors.joining("\n"));
                User newUser = objectMapper.readValue(requestBody, User.class);

                if (newUser.getEmail() == null || newUser.getEmail().isEmpty() ||
                    newUser.getPassword() == null || newUser.getPassword().isEmpty()) {
                    sendResponse(exchange, 400, "{\"message\":\"Email and password are required.\"}");
                    return;
                }

                // Hash the password before storing
                String hashedPassword = PasswordUtil.hashPassword(newUser.getPassword());

                try (Connection conn = DatabaseUtil.getConnection()) {
                    // Check if email already exists
                    String checkEmailSql = "SELECT COUNT(*) FROM users WHERE email = ?";
                    try (PreparedStatement checkStmt = conn.prepareStatement(checkEmailSql)) {
                        checkStmt.setString(1, newUser.getEmail());
                        ResultSet rs = checkStmt.executeQuery();
                        if (rs.next() && rs.getInt(1) > 0) {
                            sendResponse(exchange, 409, "{\"message\":\"Email already registered.\"}");
                            return;
                        }
                    }

                    // Insert new user into the database
                    String sql = "INSERT INTO users (name, email, password_hash, contact_no, role, department) VALUES (?, ?, ?, ?, ?, ?)";
                    try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                        pstmt.setString(1, newUser.getName());
                        pstmt.setString(2, newUser.getEmail());
                        pstmt.setString(3, hashedPassword);
                        pstmt.setString(4, newUser.getContactNo());
                        pstmt.setString(5, newUser.getRole());
                        pstmt.setString(6, newUser.getDepartment());

                        int affectedRows = pstmt.executeUpdate();

                        if (affectedRows > 0) {
                            sendResponse(exchange, 200, "{\"message\":\"Registration successful!\"}");
                        } else {
                            sendResponse(exchange, 500, "{\"message\":\"Registration failed: No rows affected.\"}");
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Registration error: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Internal server error during registration.\"}");
            } finally {
                exchange.close();
            }
        };
    }

    /**
     * Handles user login and JWT token generation.
     */
    public HttpHandler handleLogin() {
        return exchange -> {
            setCorsHeaders(exchange); // Add CORS headers for every request

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1); // Handle preflight
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "Method Not Allowed");
                return;
            }

            try {
                String requestBody = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                        .lines().collect(Collectors.joining("\n"));
                User loginUser = objectMapper.readValue(requestBody, User.class); // Use User model for email/password

                if (loginUser.getEmail() == null || loginUser.getEmail().isEmpty() ||
                    loginUser.getPassword() == null || loginUser.getPassword().isEmpty()) {
                    sendResponse(exchange, 400, "{\"message\":\"Email and password are required.\"}");
                    return;
                }

                try (Connection conn = DatabaseUtil.getConnection()) {
                    String sql = "SELECT id, name, email, password_hash, contact_no, role, department FROM users WHERE email = ?";
                    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                        pstmt.setString(1, loginUser.getEmail());
                        ResultSet rs = pstmt.executeQuery();

                        if (rs.next()) {
                            String storedPasswordHash = rs.getString("password_hash");
                            if (PasswordUtil.checkPassword(loginUser.getPassword(), storedPasswordHash)) {
                                // Password matches, generate JWT
                                String email = rs.getString("email");
                                String role = rs.getString("role");
                                String token = JwtUtil.generateToken(
                                    email,
                                    role,
                                    rs.getInt("id"),
                                    rs.getString("name"),
                                    rs.getString("department")
                                );

                                // Prepare user object to send to frontend (without password hash)
                                User authenticatedUser = new User(
                                    rs.getInt("id"),
                                    rs.getString("name"),
                                    rs.getString("email"),
                                    null, // Don't send password hash to frontend
                                    rs.getString("contact_no"),
                                    rs.getString("role"),
                                    rs.getString("department")
                                );

                                String jsonResponse = objectMapper.writeValueAsString(new LoginResponse(token, authenticatedUser));
                                sendResponse(exchange, 200, jsonResponse, "application/json");
                            } else {
                                sendResponse(exchange, 401, "{\"message\":\"Invalid credentials.\"}");
                            }
                        } else {
                            sendResponse(exchange, 401, "{\"message\":\"Invalid credentials.\"}");
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Login error: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Internal server error during login.\"}");
            } finally {
                exchange.close();
            }
        };
    }

    // Helper method to send HTTP responses
    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        sendResponse(exchange, statusCode, response, "application/json");
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response, String contentType) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(statusCode, response.length());
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }

    // CORS headers utility method
    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
    }

    // Inner class for login response structure (token and user info)
    private static class LoginResponse {
        public String token;
        public User user;

        public LoginResponse(String token, User user) {
            this.token = token;
            this.user = user;
        }

        // Getters for Jackson serialization
        public String getToken() { return token; }
        public User getUser() { return user; }
    }
}