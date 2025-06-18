package com.example;

import java.io.IOException;
import java.net.InetSocketAddress;

import com.example.Assets.AssetController; // Import AssetController from its package
import com.example.complaints.ComplaintController; // Import ComplaintController
import com.example.pmtasks.PmTaskController;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

public class Main {
    public static void main(String[] args) throws IOException {
        int port = 8080; // Port for the backend server
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Create instances of controllers
        AuthController authController = new AuthController();
        AssetController assetController = new AssetController(); // Instantiate the AssetController
        ComplaintController complaintController = new ComplaintController(); // Instantiate the ComplaintController
        PmTaskController pmTaskController = new PmTaskController(); // Instantiate the PmTaskController

        // Set up a global CORS filter. This is crucial for allowing your frontend
        // (running on a different port/origin) to communicate with this backend.
        server.createContext("/ContractManagementSystem/", (HttpExchange exchange) -> {
            // Allow requests from your frontend origin (e.g., Vite's default http://localhost:5173)
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
            // Allow common HTTP methods
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            // Allow specific headers, including Content-Type and Authorization for JWT
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            // Allow credentials (like cookies, if you were using them, though not strictly needed for JWT in header)
            exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
            // Handle preflight OPTIONS requests
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1); // No Content
            } else {
                // For actual requests, proceed to the next handler in the chain
                // (or let the specific context handlers below handle it)
                // This is handled automatically by HttpServer if you register context handlers
                // below a more general path, so no explicit call to chain is needed here.
            }
        });


        // Register specific API endpoints with their respective handlers
        server.createContext("/ContractManagementSystem/register", authController.handleRegister());
        server.createContext("/ContractManagementSystem/login", authController.handleLogin());

        // Register Asset Management endpoints
        server.createContext("/ContractManagementSystem/assets", assetController.handleAddAsset()); // For adding new assets (POST)
        server.createContext("/ContractManagementSystem/assets/all", assetController.handleGetAllAssets()); // ADDED: Endpoint for getting all assets (GET)
        server.createContext("/ContractManagementSystem/user-assets", assetController.handleGetUserAssets()); // For getting user-specific assets (GET)
        server.createContext("/ContractManagementSystem/assets/total", assetController.handleGetTotalAssets()); // New endpoint for total assets

        // Register Complaint Management endpoints
        // The /ContractManagementSystem/complaints path now handles GET (all), POST (add), and PUT /{id}/status
        server.createContext("/ContractManagementSystem/complaints", complaintController.handleComplaintsBase());
        server.createContext("/ContractManagementSystem/user-complaints", complaintController.handleGetUserComplaints()); // For getting user-specific complaints (GET)
        server.createContext("/ContractManagementSystem/complaints/department/", complaintController.handleGetDepartmentComplaints()); // For department-specific complaints (GET)
        // Total open complaints endpoints

        //Pm Tasks endpoints
        server.createContext("/ContractManagementSystem/pm-tasks", pmTaskController.handlePmTasks());

        // Add these after existing context registrations
        server.createContext("/ContractManagementSystem/complaints/open-count", complaintController.handleGetOpenComplaintsCount());
        server.createContext("/ContractManagementSystem/pm-tasks/pending-count", pmTaskController.handlePmTasks());
        


        server.setExecutor(null); // Use a default executor for handling requests
        server.start(); // Start the HTTP server

        // Print server status and endpoints for easy access
        System.out.println("Java Backend server started on port " + port);
        System.out.println("Registration endpoint: http://localhost:8080/ContractManagementSystem/register");
        System.out.println("Login endpoint: http://localhost:8080/ContractManagementSystem/login");
        System.out.println("Add Asset endpoint: http://localhost:8080/ContractManagementSystem/assets");
        System.out.println("Get All Assets endpoint: http://localhost:8080/ContractManagementSystem/assets/all"); // Added to print statements
        System.out.println("Get User Assets endpoint: http://localhost:8080/ContractManagementSystem/user-assets");
        System.out.println("Get Total Assets endpoint: http://localhost:8080/ContractManagementSystem/assets/total");
        System.out.println("Add Complaint endpoint: http://localhost:8080/ContractManagementSystem/complaints (POST)");
        System.out.println("Get All Complaints endpoint: http://localhost:8080/ContractManagementSystem/complaints (GET, Admin/Service Engineer)");
        System.out.println("Get User Complaints endpoint: http://localhost:8080/ContractManagementSystem/user-complaints (GET)");
        System.out.println("Update Complaint Status endpoint: http://localhost:8080/ContractManagementSystem/complaints/{id}/status (PUT)");
        System.out.println("Get Department Complaints endpoint: http://localhost:8080/ContractManagementSystem/complaints/department/{department} (GET)");
        System.out.println("Add PM Task endpoint: http://localhost:8080/ContractManagementSystem/pm-tasks (POST)"); // New endpoint
        System.out.println("Get All PM Tasks endpoint: http://localhost:8080/ContractManagementSystem/pm-tasks (GET)");
        
    }
}