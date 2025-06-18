package com.example.complaints;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors; // Import Pattern for regex

import com.example.DatabaseUtil;
import com.example.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class ComplaintController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Regex pattern to match /ContractManagementSystem/complaints/{id}/status
    private static final Pattern COMPLAINT_STATUS_PATTERN = Pattern.compile("/ContractManagementSystem/complaints/(\\d+)/status");


    /**
     * Main handler for /ContractManagementSystem/complaints path and its sub-paths.
     * Dispatches requests based on HTTP method and path structure.
     */
    public HttpHandler handleComplaintsBase() {
        return exchange -> {
            setCorsHeaders(exchange);

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            // --- ADD THIS LINE FOR DEBUGGING ---
            System.out.println("Received Method: " + method + ", Path: " + path);
            // -----------------------------------

            Matcher statusMatcher = COMPLAINT_STATUS_PATTERN.matcher(path);

            if ("GET".equalsIgnoreCase(method) && path.equals("/ContractManagementSystem/complaints")) {
                handleGetAllComplaintsInternal(exchange);
            } else if ("POST".equalsIgnoreCase(method) && path.equals("/ContractManagementSystem/complaints")) {
                handleAddComplaintInternal(exchange);
            } else if ("GET".equalsIgnoreCase(method) && path.equals("/ContractManagementSystem/complaints/total")) {
                handleGetTotalComplaintsInternal(exchange); // New endpoint for total complaints
            }else if ("PUT".equalsIgnoreCase(method) && statusMatcher.matches()) {
                // If it's a PUT request and matches the /complaints/{id}/status pattern
                int complaintId = Integer.parseInt(statusMatcher.group(1)); // Extract ID from regex group
                handleUpdateComplaintStatusInternal(exchange, complaintId);
            } else {
                sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed or Path Not Found\"}");
                exchange.close();
            }
        };
    }

    /**
     * Internal method to handle adding a new complaint (POST logic).
     */
    private void handleAddComplaintInternal(HttpExchange exchange) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authentication token not found.\"}");
                return;
            }
            String token = authHeader.substring(7);

            if (!JwtUtil.validateToken(token)) {
                sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}");
                return;
            }

            int raised_by_user_id = JwtUtil.extractUserId(token);
            String raised_by_user_name = JwtUtil.extractUsername(token);

            if (raised_by_user_id == 0 || raised_by_user_name == null) {
                sendResponse(exchange, 401, "{\"message\":\"User information not found in token.\"}");
                return;
            }

            String requestBody = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                    .lines().collect(Collectors.joining("\n"));
            Complaint newComplaint = objectMapper.readValue(requestBody, Complaint.class);

            newComplaint.setRaised_by_user_id(raised_by_user_id);
            newComplaint.setRaised_by_user_name(raised_by_user_name);
            newComplaint.setCreated_at(new SimpleDateFormat("yyyy-MM-dd").format(new Date()));
            newComplaint.setStatus("OPEN");

            String sql = "INSERT INTO complaints (asset_id, asset_type, location, complaint_category, description, department, raised_by_user_id, raised_by_user_name, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (Connection conn = DatabaseUtil.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

                pstmt.setInt(1, newComplaint.getAsset_id());
                pstmt.setString(2, newComplaint.getAsset_type());
                pstmt.setString(3, newComplaint.getLocation());
                pstmt.setString(4, newComplaint.getComplaint_category());
                pstmt.setString(5, newComplaint.getDescription());
                pstmt.setString(6, newComplaint.getDepartment());
                pstmt.setInt(7, newComplaint.getRaised_by_user_id());
                pstmt.setString(8, newComplaint.getRaised_by_user_name());
                pstmt.setString(9, newComplaint.getCreated_at());
                pstmt.setString(10, newComplaint.getStatus());

                int affectedRows = pstmt.executeUpdate();
                if (affectedRows > 0) {
                    try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            newComplaint.setId(generatedKeys.getInt(1));
                        }
                    }
                    sendResponse(exchange, 201, objectMapper.writeValueAsString(newComplaint));
                } else {
                    sendResponse(exchange, 500, "{\"message\":\"Failed to add complaint.\"}");
                }
            }
        } catch (Exception e) {
            System.err.println("Add complaint error: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Internal server error while adding complaint.\"}");
        } finally {
            // No exchange.close() here as it's handled by handleComplaintsBase
        }
    }

    /**
     * Internal method to handle retrieving all complaints (GET logic).
     */
    private void handleGetAllComplaintsInternal(HttpExchange exchange) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authentication token not found.\"}");
                return;
            }
            String token = authHeader.substring(7);

            String userRole = JwtUtil.extractRole(token);
            System.out.println("Extracted User Role for All Complaints: '" + userRole + "'");

            // Normalize the role by trimming and converting to lowercase
            String normalizedRole = userRole != null ? userRole.trim().toLowerCase() : null; // Added Line

            // Check if the user has the 'admin' or 'service_engineer' role
            if (!("service_engineer".equals(normalizedRole) || "eic_contract".equals(normalizedRole))) { // Modified Line
                sendResponse(exchange, 403, "{\"message\":\"Access Denied. Only authorized personnel can view all complaints.\"}");
                return;
            }

            List<Complaint> complaints = new ArrayList<>();
            String sql = "SELECT * FROM complaints ORDER BY created_at DESC";
            try (Connection conn = DatabaseUtil.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {

                while (rs.next()) {
                    complaints.add(new Complaint(
                            rs.getInt("id"),
                            rs.getInt("asset_id"),
                            rs.getString("asset_type"),
                            rs.getString("location"),
                            rs.getString("complaint_category"),
                            rs.getString("description"),
                            rs.getString("department"),
                            rs.getInt("raised_by_user_id"),
                            rs.getString("raised_by_user_name"),
                            rs.getString("created_at"),
                            rs.getString("status"),
                            rs.getString("closed_at"),
                            rs.getString("closed_feedback")
                    ));
                }
                sendResponse(exchange, 200, objectMapper.writeValueAsString(complaints));
            }
        } catch (Exception e) {
            System.err.println("Get all complaints error: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Internal server error while fetching all complaints.\"}");
        } finally {
            // No exchange.close() here as it's handled by handleComplaintsBase
        }
    }

    /**
     * Internal method to handle retrieving the total count of complaints (GET logic).
     */
    private void handleGetTotalComplaintsInternal(HttpExchange exchange) throws IOException {
    try {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"message\":\"Authentication token not found.\"}");
            return;
        }
        String token = authHeader.substring(7);

        String userRole = JwtUtil.extractRole(token);
        System.out.println("Extracted User Role for Total Complaints: '" + userRole + "'"); // Debug log

        // Normalize the role by trimming and converting to lowercase
        // Inside handleGetTotalComplaintsInternal()
        String normalizedRole = userRole != null ? userRole.trim().toLowerCase() : null;

        // Allow 'admin', 'service_engineer', or 'eic_contract' to access this endpoint
        if (!JwtUtil.validateToken(token) || 
            !("admin".equals(normalizedRole) || 
              "service_engineer".equals(normalizedRole) || 
              "eic_contract".equals(normalizedRole))) {
            sendResponse(exchange, 403, "{\"message\":\"Access Denied. User role: " + normalizedRole + "\"}");
            return;
        }
        String sql = "SELECT COUNT(*) AS total_complaints FROM complaints";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                int totalComplaints = rs.getInt("total_complaints");
                sendResponse(exchange, 200, "{\"total_complaints\":" + totalComplaints + "}");
            } else {
                sendResponse(exchange, 500, "{\"message\":\"Failed to retrieve total complaints count.\"}");
            }
        }
    } catch (Exception e) {
        System.err.println("Get total complaints error: " + e.getMessage());
        sendResponse(exchange, 500, "{\"message\":\"Internal server error while fetching total complaints.\"}");
    }
}
    /**
     * Handles GET requests to retrieve complaints raised by a specific user.
     * Requires a valid JWT. The user ID is extracted from the token.
     */
    public HttpHandler handleGetUserComplaints() {
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
                String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    sendResponse(exchange, 401, "{\"message\":\"Authentication token not found.\"}");
                    exchange.close();
                    return;
                }
                String token = authHeader.substring(7);
                if (!JwtUtil.validateToken(token)) {
                    sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}");
                    exchange.close();
                    return;
                }
                int userId = JwtUtil.extractUserId(token); // Assuming you have this in JwtUtil
                List<Complaint> complaints = new ArrayList<>();
                String sql = "SELECT * FROM complaints WHERE raised_by_user_id = ? ORDER BY created_at DESC";
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setInt(1, userId);
                    try (ResultSet rs = pstmt.executeQuery()) {
                        while (rs.next()) {
                            complaints.add(new Complaint(
                                    rs.getInt("id"),
                                    rs.getInt("asset_id"),
                                    rs.getString("asset_type"),
                                    rs.getString("location"),
                                    rs.getString("complaint_category"),
                                    rs.getString("description"),
                                    rs.getString("department"),
                                    rs.getInt("raised_by_user_id"),
                                    rs.getString("raised_by_user_name"),
                                    rs.getString("created_at"),
                                    rs.getString("status"),
                                    rs.getString("closed_at"),
                                    rs.getString("closed_feedback")
                            ));
                        }
                    }
                    sendResponse(exchange, 200, objectMapper.writeValueAsString(complaints));
                }
            } catch (Exception e) {
                System.err.println("Get user complaints error: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Internal server error while fetching user complaints.\"}");
            } finally {
                exchange.close();
            }
        };
    }


    /**
     * Internal method to handle updating complaint status (PUT logic).
     */
    private void handleUpdateComplaintStatusInternal(HttpExchange exchange, int complaintId) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authentication token not found.\"}");
                return;
            }
            String token = authHeader.substring(7);

            // Validate token and extract user role
            String userRole = JwtUtil.extractRole(token);
            String normalizedRole = userRole != null ? userRole.trim().toLowerCase() : null;

            // Allow 'admin', 'service_engineer', or 'eic_contract' to update status
            if (!JwtUtil.validateToken(token) || 
                !("admin".equals(normalizedRole) || 
                  "service_engineer".equals(normalizedRole) || 
                  "eic_contract".equals(normalizedRole))) {
                sendResponse(exchange, 403, "{\"message\":\"Access Denied. Only authorized personnel can update complaint status.\"}");
                return;
            }

            String requestBody = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                    .lines().collect(Collectors.joining("\n"));
            
            // Using a generic Map to parse the flexible JSON structure
            // This allows us to handle both 'status' and 'feedback' without a dedicated ComplaintStatusUpdate class
            @SuppressWarnings("unchecked")
            Map<String, String> updateData = objectMapper.readValue(requestBody, Map.class);
            String newStatus = updateData.get("status");
            String feedback = updateData.get("feedback"); // Can be null

            if (newStatus == null || newStatus.isEmpty()) {
                sendResponse(exchange, 400, "{\"message\":\"Status is required.\"}");
                return;
            }

            String sql;
            if ("CLOSED".equalsIgnoreCase(newStatus)) {
                sql = "UPDATE complaints SET status = ?, closed_at = ?, closed_feedback = ? WHERE id = ?";
            } else {
                sql = "UPDATE complaints SET status = ? WHERE id = ?";
            }

            try (Connection conn = DatabaseUtil.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql)) {

                pstmt.setString(1, newStatus);
                if ("CLOSED".equalsIgnoreCase(newStatus)) {
                    pstmt.setString(2, new SimpleDateFormat("yyyy-MM-dd").format(new Date()));
                    pstmt.setString(3, feedback);
                    pstmt.setInt(4, complaintId);
                } else {
                    pstmt.setInt(2, complaintId);
                }

                int affectedRows = pstmt.executeUpdate();
                if (affectedRows > 0) {
                    sendResponse(exchange, 200, "{\"message\":\"Complaint status updated successfully.\"}");
                } else {
                    sendResponse(exchange, 404, "{\"message\":\"Complaint not found or no change in status.\"}");
                }
            }
        } catch (Exception e) {
            System.err.println("Update complaint status error: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Internal server error while updating complaint status.\"}");
        } finally {
            // No exchange.close() here as it's handled by handleComplaintsBase
        }
    }


    /**
     * Handles GET requests to retrieve complaints for a specific department.
     * This endpoint is intended for service engineers to view complaints relevant to their department.
     */
    public HttpHandler handleGetDepartmentComplaints() {
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
                String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    sendResponse(exchange, 401, "{\"message\":\"Authentication token not found.\"}");
                    exchange.close();
                    return;
                }
                String token = authHeader.substring(7);

                // Validate token and extract user role and department
                String userRole = JwtUtil.extractRole(token);
                String userDepartment = JwtUtil.extractDepartment(token);

                String normalizedRole = userRole != null ? userRole.trim().toLowerCase() : null;


                // Only 'service_engineer' and 'admin' roles can access department-specific complaints
                if (!JwtUtil.validateToken(token) || 
                    !("service_engineer".equals(normalizedRole) || 
                      "admin".equals(normalizedRole) || 
                      "eic_contract".equals(normalizedRole)) ||
                    userDepartment == null || userDepartment.isEmpty()) {
                    sendResponse(exchange, 403, "{\"message\":\"Access Denied. Insufficient role or department information.\"}");
                    exchange.close();
                    return;
                }
                
                // Extract department from path - This assumes the path structure is like /ContractManagementSystem/complaints/department/{department}
                String path = exchange.getRequestURI().getPath();
                String[] pathSegments = path.split("/");
                String departmentFromPath = null;
                if (pathSegments.length > 4 && "department".equals(pathSegments[pathSegments.length - 2])) {
                    departmentFromPath = URLDecoder.decode(pathSegments[pathSegments.length - 1], StandardCharsets.UTF_8.name());
                }

                if (departmentFromPath == null || departmentFromPath.isEmpty()) {
                    sendResponse(exchange, 400, "{\"message\":\"Department not specified in path.\"}");
                    exchange.close();
                    return;
                }

                // Security check: A service engineer should only be able to view complaints for their own department.
                // Admins can view all departments, but this specific endpoint is for department-filtered view.
                // If an admin requests a specific department, we allow it.
                // If a service engineer requests a department different from their own, deny.
                if ("service_engineer".equals(normalizedRole) && !userDepartment.equalsIgnoreCase(departmentFromPath)) {
                     sendResponse(exchange, 403, "{\"message\":\"Access Denied. Service engineers can only view complaints for their own department.\"}");
                     exchange.close();
                     return;
                }


                List<Complaint> complaints = new ArrayList<>();
                String sql = "SELECT * FROM complaints WHERE department = ? ORDER BY created_at DESC";
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, departmentFromPath);
                    try (ResultSet rs = pstmt.executeQuery()) {
                        while (rs.next()) {
                            complaints.add(new Complaint(
                                    rs.getInt("id"),
                                    rs.getInt("asset_id"),
                                    rs.getString("asset_type"),
                                    rs.getString("location"),
                                    rs.getString("complaint_category"),
                                    rs.getString("description"),
                                    rs.getString("department"),
                                    rs.getInt("raised_by_user_id"),
                                    rs.getString("raised_by_user_name"),
                                    rs.getString("created_at"),
                                    rs.getString("status"),
                                    rs.getString("closed_at"),
                                    rs.getString("closed_feedback")
                            ));
                        }
                    }
                    sendResponse(exchange, 200, objectMapper.writeValueAsString(complaints));
                }
            } catch (Exception e) {
                System.err.println("Get department complaints error: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Internal server error while fetching department complaints.\"}");
            } finally {
                exchange.close();
            }
        };
    }
    
// Only update the handleGetOpenComplaintsCount method
public HttpHandler handleGetOpenComplaintsCount() {
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
                String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    sendResponse(exchange, 401, "{\"message\":\"Authentication token not found.\"}");
                    exchange.close();
                    return;
                }
                String token = authHeader.substring(7);

                if (!JwtUtil.validateToken(token)) {
                    sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}");
                    exchange.close();
                    return;
                }

                // Only Service Engineers or Admins should be able to get this count
                String userRole = JwtUtil.extractRole(token);
                System.out.println("Token: " + token); // Debug log
                System.out.println("User Role: " + userRole); // Debug log
                if (!"Admin".equals(userRole) && !"Service_Engineer".equals(userRole)) {
                    sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only Admins and Service Engineers can view open complaints count.\"}");
                    exchange.close();
                    return;
                }

                int openComplaintsCount = 0;
                String sql = "SELECT COUNT(*) FROM complaints WHERE status = 'OPEN'";
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(sql);
                     ResultSet rs = pstmt.executeQuery()) {
                    if (rs.next()) {
                        openComplaintsCount = rs.getInt(1);
                    }
                }
                String jsonResponse = "{\"count\":" + openComplaintsCount + "}";
                sendResponse(exchange, 200, jsonResponse, "application/json");
            } catch (SQLException e) {
                System.err.println("SQL Error fetching open complaints count: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Database error: " + e.getMessage().replace("\"", "'") + "\"}");
                exchange.close();
            } catch (Exception e) {
                System.err.println("Error fetching open complaints count: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Error: " + e.getMessage().replace("\"", "'") + "\"}");
                exchange.close();
            } finally {
                exchange.close();
            }
        };
    }

    private void handleGetOpenComplaintsCountInternal(HttpExchange exchange) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authentication token not found.\"}");
                return;
            }
            String token = authHeader.substring(7);

            if (!JwtUtil.validateToken(token)) {
                sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}");
                return;
            }

            // Only Service Engineers or Admins should be able to get this count
            String userRole = JwtUtil.extractRole(token);
            if (!"Admin".equals(userRole) && !"Service_Engineer".equals(userRole)) {
                sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only Admins and Service Engineers can view open complaints count.\"}");
                return;
            }

            int openComplaintsCount = 0;
            String sql = "SELECT COUNT(*) FROM complaints WHERE status = 'OPEN'";
            try (Connection conn = DatabaseUtil.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql);
                 ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    openComplaintsCount = rs.getInt(1);
                }
            }
            sendResponse(exchange, 200, String.valueOf(openComplaintsCount), "text/plain");
        } catch (SQLException e) {
            System.err.println("SQL Error fetching open complaints count: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Database error: " + e.getMessage().replace("\"", "'") + "\"}");
        } catch (Exception e) {
            System.err.println("Error fetching open complaints count: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Error: " + e.getMessage().replace("\"", "'") + "\"}");
        } finally {
            exchange.close();
        }
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
    

    // CORS headers utility method (duplicate from other controllers, consider a shared utility)
    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
    }

    public HttpHandler handleGetTotalComplaintsInternal() {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}