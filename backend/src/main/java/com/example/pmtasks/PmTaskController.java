package com.example.pmtasks;

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

import com.example.DatabaseUtil;
import com.example.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class PmTaskController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ... (Your existing handleCreatePmTask, handleGetAllPmTasks, handleGetPmTaskCount, handleGetPendingPmTasksCount, sendResponse, setCorsHeaders methods) ...

    private void handleCreatePmTask(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}", "application/json");
            return;
        }

        try {
            String requestBody = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                    .lines().collect(Collectors.joining("\n"));
            PmTask newTask = objectMapper.readValue(requestBody, PmTask.class);

            // Validate JWT and extract user ID
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Missing or invalid token\"}", "application/json");
                return;
            }
            String token = authHeader.substring(7);
            Integer raisedByUserId = JwtUtil.extractUserId(token);
            if (raisedByUserId == null || raisedByUserId == 0) {
                sendResponse(exchange, 401, "{\"message\":\"Unauthorized: Invalid token user ID\"}", "application/json");
                return;
            }

            // Check user role
            String userRole = JwtUtil.extractRole(token);
            if (!"Service_Engineer".equals(userRole)) {
                sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only Service Engineers can create PM tasks\"}", "application/json");
                return;
            }

            // Input validation
            if (newTask.getAsset_id() <= 0) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid asset_id: Must be a positive integer\"}", "application/json");
                return;
            }
            if (newTask.getQuarter() == null || newTask.getQuarter().trim().isEmpty() || !newTask.getQuarter().matches("Q[1-4]-\\d{4}")) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid quarter: Must be in format Q1-YYYY (e.g., Q1-2025)\"}", "application/json");
                return;
            }
            if (newTask.getLast_pm_date() == null || newTask.getLast_pm_date().trim().isEmpty() || !newTask.getLast_pm_date().matches("\\d{4}-\\d{2}-\\d{2}")) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid last_pm_date: Must be in formatYYYY-MM-DD\"}", "application/json");
                return;
            }

            // Verify asset_id and raised_by_user_id exist
            try (Connection conn = DatabaseUtil.getConnection()) {
                String checkAssetSql = "SELECT id FROM assets WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(checkAssetSql)) {
                    pstmt.setInt(1, newTask.getAsset_id());
                    ResultSet rs = pstmt.executeQuery();
                    if (!rs.next()) {
                        sendResponse(exchange, 400, "{\"message\":\"Invalid asset_id: Asset does not exist\"}", "application/json");
                        return;
                    }
                }

                String checkUserSql = "SELECT id FROM users WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(checkUserSql)) {
                    pstmt.setInt(1, raisedByUserId);
                    ResultSet rs = pstmt.executeQuery();
                    if (!rs.next()) {
                        sendResponse(exchange, 400, "{\"message\":\"Invalid raised_by_user_id: User does not exist\"}", "application/json");
                        return;
                    }
                }

                // Set task properties
                newTask.setRaised_by_user_id(raisedByUserId);
                newTask.setStatus("PENDING");
                String currentTimestamp = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());
                newTask.setCreated_at(currentTimestamp);
                newTask.setUpdated_at(currentTimestamp);

                // Insert into database
                String sql = "INSERT INTO pm_tasks (asset_id, quarter, last_pm_date, status, raised_by_user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    stmt.setInt(1, newTask.getAsset_id());
                    stmt.setString(2, newTask.getQuarter());
                    stmt.setString(3, newTask.getLast_pm_date());
                    stmt.setString(4, newTask.getStatus());
                    stmt.setInt(5, newTask.getRaised_by_user_id());
                    stmt.setString(6, newTask.getCreated_at());
                    stmt.setString(7, newTask.getUpdated_at());

                    int affectedRows = stmt.executeUpdate();
                    if (affectedRows > 0) {
                        try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                            if (generatedKeys.next()) {
                                newTask.setId(generatedKeys.getInt(1));
                            }
                        }
                        sendResponse(exchange, 201, objectMapper.writeValueAsString(newTask), "application/json");
                    } else {
                        sendResponse(exchange, 500, "{\"message\":\"Failed to insert PM task: No rows affected\"}", "application/json");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("SQL Error inserting PM task: " + e.getMessage() + ", SQLState: " + e.getSQLState() + ", ErrorCode: " + e.getErrorCode());
            sendResponse(exchange, 500, "{\"message\":\"Database error: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
        } catch (Exception e) {
            System.err.println("Error processing create PM task: " + e.getMessage());
            sendResponse(exchange, 400, "{\"message\":\"Invalid request: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
        } finally {
            exchange.close();
        }
    }

    private void handleGetAllPmTasks(HttpExchange exchange) throws IOException {
        List<PmTask> pmTasks = new ArrayList<>();
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authorization header missing or invalid.\"}", "application/json");
                return;
            }
            String token = authHeader.substring(7);
            if (!JwtUtil.validateToken(token)) {
                sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}", "application/json");
                return;
            }

            String userRole = JwtUtil.extractRole(token);
            // Allow more roles to view PM tasks as per Main.java comments suggests
            if (!"Service_Engineer".equals(userRole) && !"Section_Coordinator".equals(userRole) &&
                !"EIC_Contract".equals(userRole) && !"ETL_Dept_EIC".equals(userRole) &&
                !"Section_InCharge".equals(userRole) && !"admin".equals(userRole)) { // Added 'admin' role
                sendResponse(exchange, 403, "{\"message\":\"Forbidden: You do not have permission to view PM tasks.\"}", "application/json");
                return;
            }

            // Modified SQL query to join with assets table
            String sql = "SELECT p.*, a.asset_type, a.department, a.description " +
                         "FROM pm_tasks p JOIN assets a ON p.asset_id = a.id " +
                         "ORDER BY p.created_at DESC";

            try (Connection conn = DatabaseUtil.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql);
                 ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    PmTask pmTask = new PmTask();
                    pmTask.setId(rs.getInt("id"));
                    pmTask.setAsset_id(rs.getInt("asset_id"));
                    pmTask.setQuarter(rs.getString("quarter"));
                    pmTask.setLast_pm_date(rs.getString("last_pm_date"));
                    pmTask.setStatus(rs.getString("status"));
                    pmTask.setRaised_by_user_id(rs.getInt("raised_by_user_id"));
                    if (rs.wasNull()) pmTask.setRaised_by_user_id(null);
                    pmTask.setVerified_by_user_id(rs.getInt("verified_by_user_id"));
                    if (rs.wasNull()) pmTask.setVerified_by_user_id(null);
                    pmTask.setApproved_by_user_id(rs.getInt("approved_by_user_id"));
                    if (rs.wasNull()) pmTask.setApproved_by_user_id(null);
                    pmTask.setBill_approved_by_user_id(rs.getInt("bill_approved_by_user_id"));
                    if (rs.wasNull()) pmTask.setBill_approved_by_user_id(null);
                    pmTask.setCreated_at(rs.getString("created_at"));
                    pmTask.setUpdated_at(rs.getString("updated_at"));

                    // Set joined fields
                    pmTask.setAsset_type(rs.getString("asset_type"));
                    pmTask.setDepartment(rs.getString("department"));
                    pmTask.setDescription(rs.getString("description"));

                    pmTasks.add(pmTask);
                }
            } catch (SQLException e) {
                System.err.println("Database error fetching PM tasks: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Database error fetching PM tasks.\"}", "application/json");
                return;
            }
            sendResponse(exchange, 200, objectMapper.writeValueAsString(pmTasks), "application/json");
        } catch (Exception e) {
            System.err.println("Error fetching PM tasks: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Internal server error fetching PM tasks.\"}", "application/json");
        } finally {
            exchange.close();
        }
    }

    private void handleGetPmTaskCount(HttpExchange exchange) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authorization header missing or invalid.\"}", "application/json");
                return;
            }
            String token = authHeader.substring(7);
            if (!JwtUtil.validateToken(token)) {
                sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}", "application/json");
                return;
            }

            // Only allow 'admin' and 'ETL_Dept_EIC' to view the total count for an admin dashboard feature
            String userRole = JwtUtil.extractRole(token);
            if (!"admin".equals(userRole) && !"EIC_Contract".equals(userRole)) {
                sendResponse(exchange, 403, "{\"message\":\"Forbidden: You do not have permission to view PM task count.\"}", "application/json");
                return;
            }

            int pmTaskCount = 0;
            String sql = "SELECT COUNT(*) FROM pm_tasks";
            try (Connection conn = DatabaseUtil.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql);
                 ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    pmTaskCount = rs.getInt(1);
                }
            } catch (SQLException e) {
                System.err.println("Database error fetching PM task count: " + e.getMessage());
                sendResponse(exchange, 500, "{\"message\":\"Database error fetching PM task count.\"}", "application/json");
                return;
            }
            sendResponse(exchange, 200, "{\"totalPmTasks\":" + pmTaskCount + "}", "application/json");
        } catch (Exception e) {
            System.err.println("Error fetching PM task count: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Internal server error fetching PM task count.\"}", "application/json");
        } finally {
            exchange.close();
        }
    }

    private void handleVerifyPmTask(HttpExchange exchange) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authorization header missing or invalid.\"}", "application/json");
                return;
            }
            String token = authHeader.substring(7);
            if (!JwtUtil.validateToken(token)) {
                sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}", "application/json");
                return;
            }

            String userRole = JwtUtil.extractRole(token);
            if (!"Section_Coordinator".equals(userRole)) {
                sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only Section Coordinators can verify PM tasks.\"}", "application/json");
                return;
            }

            int userId = JwtUtil.extractUserId(token);
            String path = exchange.getRequestURI().getPath();
            String[] pathSegments = path.split("/");
            if (pathSegments.length < 5 || !pathSegments[pathSegments.length - 1].equals("verify")) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid URL format.\"}", "application/json");
                return;
            }
            String pmIdStr = pathSegments[pathSegments.length - 2];
            int pmId;
            try {
                pmId = Integer.parseInt(pmIdStr);
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid PM task ID: Must be a number.\"}", "application/json");
                return;
            }

            try (Connection conn = DatabaseUtil.getConnection()) {
                String checkSql = "SELECT status FROM pm_tasks WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(checkSql)) {
                    pstmt.setInt(1, pmId);
                    ResultSet rs = pstmt.executeQuery();
                    if (!rs.next()) {
                        sendResponse(exchange, 404, "{\"message\":\"PM task not found.\"}", "application/json");
                        return;
                    }
                    if (!"PENDING".equals(rs.getString("status"))) {
                        sendResponse(exchange, 400, "{\"message\":\"PM task can only be verified if its status is PENDING.\"}", "application/json");
                        return;
                    }
                }

                String sql = "UPDATE pm_tasks SET status = ?, verified_by_user_id = ?, updated_at = ? WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, "VERIFIED");
                    pstmt.setInt(2, userId);
                    pstmt.setString(3, new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date()));
                    pstmt.setInt(4, pmId);
                    int affectedRows = pstmt.executeUpdate();
                    if (affectedRows > 0) {
                        sendResponse(exchange, 200, "{\"message\":\"PM task verified successfully.\"}", "application/json");
                    } else {
                        sendResponse(exchange, 404, "{\"message\":\"PM task not found or unable to verify.\"}", "application/json");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error verifying PM task: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Database error verifying PM task.\"}", "application/json");
        } catch (Exception e) {
            System.err.println("Error verifying PM task: " + e.getMessage());
            sendResponse(exchange, 400, "{\"message\":\"Invalid request: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
        } finally {
            exchange.close();
        }
    }

    private void handleApprovePmTask(HttpExchange exchange) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authorization header missing or invalid.\"}", "application/json");
                return;
            }
            String token = authHeader.substring(7);
            if (!JwtUtil.validateToken(token)) {
                sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}", "application/json");
                return;
            }

            String userRole = JwtUtil.extractRole(token);
            if (!"Section_InCharge".equals(userRole)) {
                sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only EIC_Contract or Section_InCharge can approve PM tasks.\"}", "application/json");
                return;
            }

            int userId = JwtUtil.extractUserId(token);
            String path = exchange.getRequestURI().getPath();
            String[] pathSegments = path.split("/");
            if (pathSegments.length < 5 || !pathSegments[pathSegments.length - 1].equals("approve")) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid URL format.\"}", "application/json");
                return;
            }
            String pmIdStr = pathSegments[pathSegments.length - 2];
            int pmId;
            try {
                pmId = Integer.parseInt(pmIdStr);
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid PM task ID: Must be a number.\"}", "application/json");
                return;
            }

            try (Connection conn = DatabaseUtil.getConnection()) {
                String checkSql = "SELECT status FROM pm_tasks WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(checkSql)) {
                    pstmt.setInt(1, pmId);
                    ResultSet rs = pstmt.executeQuery();
                    if (!rs.next()) {
                        sendResponse(exchange, 404, "{\"message\":\"PM task not found.\"}", "application/json");
                        return;
                    }
                    if (!"VERIFIED".equals(rs.getString("status"))) {
                        sendResponse(exchange, 400, "{\"message\":\"PM task can only be approved if its status is VERIFIED.\"}", "application/json");
                        return;
                    }
                }

                String sql = "UPDATE pm_tasks SET status = ?, approved_by_user_id = ?, updated_at = ? WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, "APPROVED");
                    pstmt.setInt(2, userId);
                    pstmt.setString(3, new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date()));
                    pstmt.setInt(4, pmId);
                    int affectedRows = pstmt.executeUpdate();
                    if (affectedRows > 0) {
                        sendResponse(exchange, 200, "{\"message\":\"PM task approved successfully.\"}", "application/json");
                    } else {
                        sendResponse(exchange, 404, "{\"message\":\"PM task not found or unable to approve.\"}", "application/json");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error approving PM task: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Database error approving PM task.\"}", "application/json");
        } catch (Exception e) {
            System.err.println("Error approving PM task: " + e.getMessage());
            sendResponse(exchange, 400, "{\"message\":\"Invalid request: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
        } finally {
            exchange.close();
        }
    }

    private void handleRejectPmTask(HttpExchange exchange) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authorization header missing or invalid.\"}", "application/json");
                return;
            }
            String token = authHeader.substring(7);
            if (!JwtUtil.validateToken(token)) {
                sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}", "application/json");
                return;
            }

            String userRole = JwtUtil.extractRole(token);
            if (!"EIC_Contract".equals(userRole) && !"Section_Coordinator".equals(userRole) && !"Section_InCharge".equals(userRole)) {
                sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only EIC_Contract, Section Coordinator, or Section_InCharge can reject PM tasks.\"}", "application/json");
                return;
            }

            int userId = JwtUtil.extractUserId(token);
            String path = exchange.getRequestURI().getPath();
            String[] pathSegments = path.split("/");
            if (pathSegments.length < 5 || !pathSegments[pathSegments.length - 1].equals("reject")) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid URL format.\"}", "application/json");
                return;
            }
            String pmIdStr = pathSegments[pathSegments.length - 2];
            int pmId;
            try {
                pmId = Integer.parseInt(pmIdStr);
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid PM task ID: Must be a number.\"}", "application/json");
                return;
            }

            try (Connection conn = DatabaseUtil.getConnection()) {
                String checkSql = "SELECT status FROM pm_tasks WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(checkSql)) {
                    pstmt.setInt(1, pmId);
                    ResultSet rs = pstmt.executeQuery();
                    if (!rs.next()) {
                        sendResponse(exchange, 404, "{\"message\":\"PM task not found.\"}", "application/json");
                        return;
                    }
                    if ("REJECTED".equals(rs.getString("status")) || "APPROVED".equals(rs.getString("status")) || "BILL_APPROVED".equals(rs.getString("status"))) {
                        sendResponse(exchange, 400, "{\"message\":\"PM task cannot be rejected from its current status (Rejected, Approved, or Bill Approved).\"}", "application/json");
                        return;
                    }
                }

                String sql = "UPDATE pm_tasks SET status = ?, updated_at = ? WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, "REJECTED");
                    pstmt.setString(2, new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date()));
                    pstmt.setInt(3, pmId);
                    int affectedRows = pstmt.executeUpdate();
                    if (affectedRows > 0) {
                        sendResponse(exchange, 200, "{\"message\":\"PM task rejected successfully.\"}", "application/json");
                    } else {
                        sendResponse(exchange, 404, "{\"message\":\"PM task not found or unable to reject.\"}", "application/json");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error rejecting PM task: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Database error rejecting PM task.\"}", "application/json");
        } catch (Exception e) {
            System.err.println("Error rejecting PM task: " + e.getMessage());
            sendResponse(exchange, 400, "{\"message\":\"Invalid request: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
        } finally {
            exchange.close();
        }
    }

    private void handleBillApprovePmTask(HttpExchange exchange) throws IOException {
        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"message\":\"Authorization header missing or invalid.\"}", "application/json");
                return;
            }
            String token = authHeader.substring(7);
            if (!JwtUtil.validateToken(token)) {
                sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}", "application/json");
                return;
            }

            String userRole = JwtUtil.extractRole(token);
            if (!"EIC_Contract".equals(userRole)) {
                sendResponse(exchange, 403, "{\"message\":\"Forbidden: Only EIC_Contract can bill approve PM tasks.\"}", "application/json");
                return;
            }

            int userId = JwtUtil.extractUserId(token);
            String path = exchange.getRequestURI().getPath();
            String[] pathSegments = path.split("/");
            if (pathSegments.length < 5 || !pathSegments[pathSegments.length - 1].equals("bill-approve")) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid URL format.\"}", "application/json");
                return;
            }
            String pmIdStr = pathSegments[pathSegments.length - 2];
            int pmId;
            try {
                pmId = Integer.parseInt(pmIdStr);
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid PM task ID: Must be a number.\"}", "application/json");
                return;
            }

            try (Connection conn = DatabaseUtil.getConnection()) {
                String checkSql = "SELECT status FROM pm_tasks WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(checkSql)) {
                    pstmt.setInt(1, pmId);
                    ResultSet rs = pstmt.executeQuery();
                    if (!rs.next()) {
                        sendResponse(exchange, 404, "{\"message\":\"PM task not found.\"}", "application/json");
                        return;
                    }
                    if (!"APPROVED".equals(rs.getString("status"))) {
                        sendResponse(exchange, 400, "{\"message\":\"PM task can only be bill approved if its status is APPROVED.\"}", "application/json");
                        return;
                    }
                }

                String sql = "UPDATE pm_tasks SET status = ?, bill_approved_by_user_id = ?, updated_at = ? WHERE id = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, "BILL_APPROVED");
                    pstmt.setInt(2, userId);
                    pstmt.setString(3, new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date()));
                    pstmt.setInt(4, pmId);
                    int affectedRows = pstmt.executeUpdate();
                    if (affectedRows > 0) {
                        // Fetch the updated task to return it
                        String selectSql = "SELECT * FROM pm_tasks WHERE id = ?";
                        try (PreparedStatement selectPstmt = conn.prepareStatement(selectSql)) {
                            selectPstmt.setInt(1, pmId);
                            ResultSet rs = selectPstmt.executeQuery();
                            if (rs.next()) {
                                PmTask updatedTask = new PmTask();
                                updatedTask.setId(rs.getInt("id"));
                                updatedTask.setAsset_id(rs.getInt("asset_id"));
                                updatedTask.setQuarter(rs.getString("quarter"));
                                updatedTask.setLast_pm_date(rs.getString("last_pm_date"));
                                updatedTask.setStatus(rs.getString("status"));
                                updatedTask.setRaised_by_user_id(rs.getInt("raised_by_user_id"));
                                if (rs.wasNull()) updatedTask.setRaised_by_user_id(null);
                                updatedTask.setVerified_by_user_id(rs.getInt("verified_by_user_id"));
                                if (rs.wasNull()) updatedTask.setVerified_by_user_id(null);
                                updatedTask.setApproved_by_user_id(rs.getInt("approved_by_user_id"));
                                if (rs.wasNull()) updatedTask.setApproved_by_user_id(null);
                                updatedTask.setBill_approved_by_user_id(rs.getInt("bill_approved_by_user_id"));
                                if (rs.wasNull()) updatedTask.setBill_approved_by_user_id(null);
                                updatedTask.setCreated_at(rs.getString("created_at"));
                                updatedTask.setUpdated_at(rs.getString("updated_at"));
                                sendResponse(exchange, 200, objectMapper.writeValueAsString(updatedTask), "application/json");
                            } else {
                                sendResponse(exchange, 404, "{\"message\":\"PM task not found after update.\"}", "application/json");
                            }
                        }
                    } else {
                        sendResponse(exchange, 404, "{\"message\":\"PM task not found or unable to bill approve.\"}", "application/json");
                    }
                }
            } catch (SQLException e) {
                System.err.println("Database error bill approving PM task: " + e.getMessage() +
                                   ", SQLState: " + e.getSQLState() +
                                   ", ErrorCode: " + e.getErrorCode());
                sendResponse(exchange, 500, "{\"message\":\"Database error bill approving PM task: " +
                                   e.getMessage().replace("\"", "'") + "\"}", "application/json");
            } catch (Exception e) {
                System.err.println("Error bill approving PM task: " + e.getMessage());
                sendResponse(exchange, 400, "{\"message\":\"Invalid request: " +
                                   e.getMessage().replace("\"", "'") + "\"}", "application/json");
            } finally {
                exchange.close();
            }
        } catch (Exception e) {
            System.err.println("Unexpected error in handleBillApprovePmTask: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Unexpected error in handleBillApprovePmTask: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
            exchange.close();
        }
    }
    private void handleGetPendingPmTasksCount(HttpExchange exchange) throws IOException {
    try {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"message\":\"Authorization header missing or invalid.\"}", "application/json");
            return;
        }
        String token = authHeader.substring(7);
        if (!JwtUtil.validateToken(token)) {
            sendResponse(exchange, 401, "{\"message\":\"Invalid or expired token.\"}", "application/json");
            return;
        }

        String userRole = JwtUtil.extractRole(token);
        if (!"Service_Engineer".equals(userRole) && !"Section_Coordinator".equals(userRole) &&
            !"Section_InCharge".equals(userRole) && !"EIC_Contract".equals(userRole) &&
            !"admin".equals(userRole)) {
            sendResponse(exchange, 403, "{\"message\":\"Forbidden: You do not have permission to view pending PM tasks count.\"}", "application/json");
            return;
        }

        int pendingCount = 0;
        String sql = "SELECT COUNT(*) FROM pm_tasks WHERE status = 'PENDING'";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                pendingCount = rs.getInt(1);
            }
            sendResponse(exchange, 200, "{\"count\":" + pendingCount + "}", "application/json");
        } catch (SQLException e) {
            System.err.println("Database error fetching pending PM tasks count: " + e.getMessage());
            sendResponse(exchange, 500, "{\"message\":\"Database error: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
        }
    } catch (Exception e) {
        System.err.println("Error fetching pending PM tasks count: " + e.getMessage());
        sendResponse(exchange, 500, "{\"message\":\"Internal server error: " + e.getMessage().replace("\"", "'") + "\"}", "application/json");
    } finally {
        exchange.close();
    }
}


// Update handlePmTasks() to include new endpoint
public HttpHandler handlePmTasks() {
    return exchange -> {
        setCorsHeaders(exchange);
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        String path = exchange.getRequestURI().getPath();
        if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            handleCreatePmTask(exchange);
        } else if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            if (path.equals("/ContractManagementSystem/pm-tasks/count")) {
                handleGetPmTaskCount(exchange);
            } else if (path.equals("/ContractManagementSystem/pm-tasks/pending-count")) {
                handleGetPendingPmTasksCount(exchange);
            } else {
                handleGetAllPmTasks(exchange);
            }
        } else if ("PUT".equalsIgnoreCase(exchange.getRequestMethod())) { // ADD THIS BLOCK
            if (path.matches("/ContractManagementSystem/pm-tasks/\\d+/verify")) {
                handleVerifyPmTask(exchange);
            } else if (path.matches("/ContractManagementSystem/pm-tasks/\\d+/approve")) {
                handleApprovePmTask(exchange);
            } else if (path.matches("/ContractManagementSystem/pm-tasks/\\d+/reject")) {
                handleRejectPmTask(exchange);
            } else if (path.matches("/ContractManagementSystem/pm-tasks/\\d+/bill-approve")) {
                handleBillApprovePmTask(exchange);
            } else {
                sendResponse(exchange, 404, "{\"message\":\"Not Found: PM task PUT endpoint not recognized.\"}", "application/json");
            }
        } else {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}", "application/json");
        }
    };
}

    private void sendResponse(HttpExchange exchange, int statusCode, String response, String contentType) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        byte[] bytes = response.getBytes();
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
    }
}