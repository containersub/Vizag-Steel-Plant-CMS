package com.example; // Ensure this package is correct

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {

    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours expiration

    /**
     * Generates a JWT token for a given email, role, user ID, and department.
     * @param email The subject of the token (typically user's email).
     * @param role The role of the user (e.g., "admin", "user", "service_engineer").
     * @param userId The ID of the user.
     * @param userName The name of the user.
     * @param department The department the user belongs to.
     * @return A signed JWT string.
     */
    public static String generateToken(String email, String role, int userId, String userName, String department) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role); // Add role as a custom claim
        claims.put("userId", userId); // Add user ID as a custom claim
        claims.put("userName", userName); // Add user name as a custom claim
        claims.put("department", department); // Add department as a custom claim

        return Jwts.builder()
                .setClaims(claims) // Set the claims
                .setSubject(email) // Set the subject (user identifier)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Set creation time
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Set expiration time
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256) // Sign the token with the secret key
                .compact();
    }

    /**
     * Extracts the email (subject) from a JWT token.
     * @param token The JWT string.
     * @return The email extracted from the token, or null if parsing fails.
     */
    public static String extractEmail(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject(); // Returns the email
        } catch (Exception e) {
            System.err.println("JWT email extraction failed: " + e.getMessage());
            return null;
        }
    }

    /**
     * Extracts the role from a JWT token.
     * @param token The JWT string.
     * @return The role extracted from the token, or null if parsing fails.
     */
    public static String extractRole(String token) {
         try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("role", String.class); // Get custom "role" claim
        } catch (Exception e) {
            System.err.println("JWT role extraction failed: " + e.getMessage());
            return null;
        }
    }

    /**
     * Extracts the user ID from a JWT token.
     * @param token The JWT string.
     * @return The user ID extracted from the token, or 0 if parsing fails or not found.
     */
    public static int extractUserId(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("userId", Integer.class); // Get custom "userId" claim
        } catch (Exception e) {
            System.err.println("JWT user ID extraction failed: " + e.getMessage());
            return 0; // Return 0 or throw an exception as appropriate for your application
        }
    }

    /**
     * Extracts the user name from a JWT token.
     * @param token The JWT string.
     * @return The user name extracted from the token, or null if parsing fails.
     */
    public static String extractUsername(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("userName", String.class); // Get custom "userName" claim
        } catch (Exception e) {
            System.err.println("JWT user name extraction failed: " + e.getMessage());
            return null;
        }
    }


    /**
     * Extracts the department from a JWT token.
     * @param token The JWT string.
     * @return The department extracted from the token, or null if parsing fails.
     */
    public static String extractDepartment(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("department", String.class); // Get custom "department" claim
        } catch (Exception e) {
            System.err.println("JWT department extraction failed: " + e.getMessage());
            return null;
        }
    }

    /**
     * Validates a JWT token.
     * @param token The JWT string.
     * @return true if the token is valid and not expired, false otherwise.
     */
    public static boolean validateToken(String token) {
    try {
        System.out.println("Validating token: " + token); // Debug log
        Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
        System.out.println("Token is valid"); // Debug log
        return true;
    } catch (Exception e) {
        System.err.println("Token validation failed: " + e.getMessage()); // Debug log
        return false;
    }
}
}