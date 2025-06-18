package com.example.Assets; // Ensure this package matches the import in Main.java

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.example.DatabaseUtil; // Import from com.example
import com.example.JwtUtil;     // Import from com.example
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class AssetController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Handles POST requests to add a new asset.
     * Requires a valid JWT in the Authorization header.
     */
public HttpHandler handleAddAsset() {
    return exchange -> {
        setCorsHeaders(exchange);

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
            exchange.close();
            return;
        }

        try {
            // Authentication and authorization
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Missing or invalid token.\"}");
                exchange.close();
                return;
            }
            
            String token = authHeader.substring(7);
            String userEmail = JwtUtil.extractEmail(token);
            if (userEmail == null) {
                sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Invalid token.\"}");
                exchange.close();
                return;
            }

            // Read request body
            String requestBody = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                    .lines().collect(Collectors.joining("\n"));
            Asset newAsset = objectMapper.readValue(requestBody, Asset.class);

            // Get user ID
            int userId;
            try (Connection conn = DatabaseUtil.getConnection()) {
                String getUserIdSql = "SELECT id FROM users WHERE email = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(getUserIdSql)) {
                    pstmt.setString(1, userEmail);
                    ResultSet rs = pstmt.executeQuery();
                    if (!rs.next()) {
                        sendResponse(exchange, 404, "{\"message\":\"User not found.\"}");
                        exchange.close();
                        return;
                    }
                    userId = rs.getInt("id");
                }

                // Insert new asset
                String sql = "INSERT INTO assets (asset_type, department, description, created_at, location, last_maintenance, serial_number, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    pstmt.setString(1, newAsset.getAsset_type());
                    pstmt.setString(2, newAsset.getDepartment());
                    pstmt.setString(3, newAsset.getDescription());
                    pstmt.setString(4, newAsset.getCreated_at());
                    pstmt.setString(5, newAsset.getLocation());
                    pstmt.setString(6, newAsset.getLast_maintenance());
                    pstmt.setString(7, newAsset.getSerial_number());
                    pstmt.setInt(8, userId);

                    int affectedRows = pstmt.executeUpdate();

                    if (affectedRows > 0) {
                        try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                            if (generatedKeys.next()) {
                                newAsset.setId(generatedKeys.getInt(1));
                            }
                        }
                        sendResponse(exchange, 201, objectMapper.writeValueAsString(newAsset));
                    } else {
                        sendResponse(exchange, 500, "{\"message\":\"Failed to add asset: No rows affected.\"}");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("SQL Error adding asset: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Database error: " + e.getMessage().replace("\"", "'") + "\"}");
        } catch (Exception e) {
            System.err.println("Error adding asset: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Error: " + e.getMessage().replace("\"", "'") + "\"}");
        } finally {
            exchange.close();
        }
    };
}

    /**
     * Handles GET requests to retrieve assets specific to the authenticated user.
     * Requires a valid JWT in the Authorization header.
     */
    public HttpHandler handleGetUserAssets() {
        return exchange -> {
            setCorsHeaders(exchange); // Set CORS headers

            // Handle preflight OPTIONS requests
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1); // 204 No Content for preflight
                exchange.close();
                return;
            }

            // Only allow GET method
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
                exchange.close();
                return;
            }

            try {
                // Authenticate and authorize the user using JWT
                String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Missing or invalid token.\"}");
                    exchange.close();
                    return;
                }
                String token = authHeader.substring(7);
                String userEmail = JwtUtil.extractEmail(token);
                if (userEmail == null) {
                    sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Invalid token.\"}");
                    exchange.close();
                    return;
                }
                
                // Retrieve userId from the database using the extracted email
                int userId;
                try (Connection conn = DatabaseUtil.getConnection()) {
                    String getUserIdSql = "SELECT id FROM users WHERE email = ?";
                    try (PreparedStatement pstmt = conn.prepareStatement(getUserIdSql)) {
                        pstmt.setString(1, userEmail);
                        ResultSet rs = pstmt.executeQuery();
                        if (rs.next()) {
                            userId = rs.getInt("id");
                        } else {
                            sendResponse(exchange, 404, "{\"message\":\"User not found.\"}");
                            exchange.close();
                            return;
                        }
                    }

                    // Fetch assets associated with the retrieved userId
                    List<Asset> userAssets = new ArrayList<>();
                    String sql = "SELECT id, asset_type, department, description, created_at, location, last_maintenance, serial_number FROM assets WHERE user_id = ?";
                    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                        pstmt.setInt(1, userId);
                        ResultSet rs = pstmt.executeQuery();
                        while (rs.next()) {
                            Asset asset = new Asset();
                            asset.setId(rs.getInt("id"));
                            asset.setAsset_type(rs.getString("asset_type"));
                            asset.setDepartment(rs.getString("department"));
                            asset.setDescription(rs.getString("description"));
                            asset.setCreated_at(rs.getString("created_at"));
                            asset.setLocation(rs.getString("location"));
                            asset.setLast_maintenance(rs.getString("last_maintenance"));
                            asset.setSerial_number(rs.getString("serial_number"));
                            asset.setUserId(userId); // Set the user ID for consistency
                            userAssets.add(asset);
                        }
                    }
                    // Send the list of user-specific assets as JSON
                    sendResponse(exchange, 200, objectMapper.writeValueAsString(userAssets), "application/json");
                }
            } catch (Exception e) {
                System.err.println("Get user assets error: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Internal server error while fetching assets.\"}");
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
        byte[] bytes = response.getBytes();
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    public HttpHandler handleGetTotalAssets() {
        return exchange -> {
            setCorsHeaders(exchange);

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
                exchange.close();
                return;
            }
            

            try {
                // Authentication and Authorization (check for admin role if desired)
                String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Missing or invalid token.\"}");
                    exchange.close();
                    return;
                }
                String token = authHeader.substring(7);
                String userEmail = JwtUtil.extractEmail(token);
                String userRole = JwtUtil.extractRole(token); // Extract role
                if (userEmail == null) {
                    sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Invalid token.\"}");
                    exchange.close();
                    return;
                }
                // In handleGetTotalAssets() method
                // Replace the role check with:
                if (!"EIC_Contract".equalsIgnoreCase(userRole) && !"service_engineer".equalsIgnoreCase(userRole)) {
                    sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only administrators or service engineers can access this resource.\"}");
                    exchange.close();
                    return;
                }

                // Optional: Authorize based on role (e.g., only 'admin' can view total assets)
                // If you uncomment this, ensure your admin users have the 'admin' role in the DB.
                // if (!"admin".equalsIgnoreCase(userRole)) {
                //     sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only administrators can access this resource.\"}");
                //     exchange.close();
                //     return;
                // }

                int totalAssets = 0;
                try (Connection conn = DatabaseUtil.getConnection()) {
                    String sql = "SELECT COUNT(*) AS total_assets FROM assets";
                    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                        ResultSet rs = pstmt.executeQuery();
                        if (rs.next()) {
                            totalAssets = rs.getInt("total_assets");
                        }
                    }
                }
                String jsonResponse = "{\"total_assets\":" + totalAssets + "}";
                sendResponse(exchange, 200, jsonResponse, "application/json");

            } catch (SQLException e) {
                System.err.println("SQL Error getting total assets: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Database error: " + e.getMessage().replace("\"", "'") + "\"}");
            } catch (Exception e) {
                System.err.println("Error getting total assets: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Error: " + e.getMessage().replace("\"", "'") + "\"}");
            } finally {
                exchange.close();
            }
        };
    }

    
public HttpHandler handleGetAllAssets() {
    return exchange -> {
        setCorsHeaders(exchange); // Set CORS headers for all responses

        // Handle preflight OPTIONS requests
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1); // 204 No Content for preflight
            exchange.close();
            return;
        }

        // Only allow GET method
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}", "application/json");
            exchange.close();
            return;
        }

        try {
            // Authenticate and authorize the user using JWT
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Missing or invalid token.\"}", "application/json");
                exchange.close();
                return;
            }
            String token = authHeader.substring(7);
            String userEmail = JwtUtil.extractEmail(token);
            if (userEmail == null) {
                sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Invalid token.\"}", "application/json");
                exchange.close();
                return;
            }

            // Fetch all assets from the database
            List<Asset> allAssets = new ArrayList<>();
            try (Connection conn = DatabaseUtil.getConnection()) {
                String sql = "SELECT id, asset_type, department, description, created_at, location, last_maintenance, serial_number, user_id FROM assets";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    ResultSet rs = pstmt.executeQuery();
                    while (rs.next()) {
                        Asset asset = new Asset();
                        asset.setId(rs.getInt("id"));
                        asset.setAsset_type(rs.getString("asset_type"));
                        asset.setDepartment(rs.getString("department"));
                        asset.setDescription(rs.getString("description"));
                        asset.setCreated_at(rs.getString("created_at"));
                        asset.setLocation(rs.getString("location"));
                        asset.setLast_maintenance(rs.getString("last_maintenance"));
                        asset.setSerial_number(rs.getString("serial_number"));
                        asset.setUserId(rs.getInt("user_id"));
                        allAssets.add(asset);
                    }
                }
                // Send the list of all assets as JSON
                sendResponse(exchange, 200, objectMapper.writeValueAsString(allAssets), "application/json");
            }
        } catch (SQLException e) {
            System.err.println("SQL Error fetching all assets: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Database error: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
        } catch (Exception e) {
            System.err.println("Error fetching all assets: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Error: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
        } finally {
            exchange.close();
        }
    };
}

    // CORS headers utility method
    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
    }
    
}