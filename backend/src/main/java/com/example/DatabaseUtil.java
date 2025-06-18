package com.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseUtil {

    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/etl_contract_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private static final String USER = "root";
    private static final String PASSWORD = "$Vijay162211"; // Make sure this is your correct password

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
    }

    /**
     * Creates the 'users', 'assets', 'complaints', and 'pm_tasks' tables if they do not already exist.
     * This method should be run once to set up the database schema.
     */
    public static void createTables() {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            // SQL to create 'users' table (ensure this is present if you don't have it)
            String createUsersTableSql = "CREATE TABLE IF NOT EXISTS users (" +
                                         "id INT AUTO_INCREMENT PRIMARY KEY," +
                                         "name VARCHAR(255)," +
                                         "email VARCHAR(255) NOT NULL UNIQUE," +
                                         "password_hash VARCHAR(255) NOT NULL," +
                                         "contactNo VARCHAR(20)," +
                                         "role VARCHAR(50) NOT NULL," + // e.g., Service Engineer, Coordinator, In-charge, ETL Dept EIC
                                         "department VARCHAR(100)" +
                                         ")";
            stmt.execute(createUsersTableSql);
            System.out.println("Table 'users' ensured to exist.");

            // SQL to create 'assets' table
            String createAssetsTableSql = "CREATE TABLE IF NOT EXISTS assets (" +
                                          "id INT AUTO_INCREMENT PRIMARY KEY," +
                                          "asset_name VARCHAR(255) NOT NULL," +
                                          "asset_type VARCHAR(100)," +
                                          "location VARCHAR(255)," +
                                          "status VARCHAR(50)," + // e.g., Operational, Under Maintenance, Decommissioned
                                          "department VARCHAR(100)," +
                                          "added_by_user_id INT," + // Foreign key to link asset to a user
                                          "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                                          "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                                          "FOREIGN KEY (added_by_user_id) REFERENCES users(id) ON DELETE SET NULL" +
                                          ")";
            stmt.execute(createAssetsTableSql);
            System.out.println("Table 'assets' ensured to exist.");

            // SQL to create 'complaints' table
            String createComplaintsTableSql = "CREATE TABLE IF NOT EXISTS complaints (" +
                                              "id INT AUTO_INCREMENT PRIMARY KEY," +
                                              "asset_id INT," +
                                              "asset_type VARCHAR(255)," +
                                              "location VARCHAR(255)," +
                                              "complaint_category VARCHAR(255)," +
                                              "description TEXT," +
                                              "department VARCHAR(255)," +
                                              "raised_by_user_id INT," +
                                              "raised_by_user_name VARCHAR(255)," +
                                              "created_at VARCHAR(10) NOT NULL," + // YYYY-MM-DD format
                                              "status VARCHAR(50) DEFAULT 'OPEN'," + // Default status
                                              "closed_at VARCHAR(10)," + // YYYY-MM-DD format, can be NULL
                                              "closed_feedback TEXT," + // Can be NULL
                                              "FOREIGN KEY (raised_by_user_id) REFERENCES users(id) ON DELETE CASCADE" +
                                              ")";
            stmt.execute(createComplaintsTableSql);
            System.out.println("Table 'complaints' ensured to exist.");

            // SQL to create 'pm_tasks' table for Preventive Maintenance
            String createPmTasksTableSql = "CREATE TABLE IF NOT EXISTS pm_tasks (" +
                                           "id INT AUTO_INCREMENT PRIMARY KEY," +
                                           "asset_id INT NOT NULL," +
                                           "quarter VARCHAR(50) NOT NULL," + // e.g., Q1-2023, Q2-2023
                                           "last_pm_date VARCHAR(10) NOT NULL," + // YYYY-MM-DD format
                                           "status VARCHAR(50) DEFAULT 'PENDING' NOT NULL," + // PENDING, VERIFIED, APPROVED, REJECTED, BILL_APPROVED
                                           "raised_by_user_id INT," + // Who initiated the PM task
                                           "verified_by_user_id INT," + // Who verified the PM task
                                           "approved_by_user_id INT," + // Who approved the PM task
                                           "bill_approved_by_user_id INT," + // Who bill approved the PM task
                                           "created_at VARCHAR(255) NOT NULL," + // ISO 8601 format
                                           "updated_at VARCHAR(255) NOT NULL," + // ISO 8601 format
                                           "FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE," +
                                           "FOREIGN KEY (raised_by_user_id) REFERENCES users(id) ON DELETE SET NULL," +
                                           "FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL," +
                                           "FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL," +
                                           "FOREIGN KEY (bill_approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL" +
                                           ")";
            stmt.execute(createPmTasksTableSql);
            System.out.println("Table 'pm_tasks' ensured to exist.");

        } catch (SQLException e) {
            System.err.println("Error creating tables: " + e.getMessage());
        }
    }

    /**
     * Main method to run once for initial database table creation.
     */
    public static void main(String[] args) {
        System.out.println("Attempting to create database tables...");
        createTables();
        System.out.println(" TABLE creation attempt complete.");
    }
}