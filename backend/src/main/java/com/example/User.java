package com.example; // Ensure this package is correct

public class User {
    private int id;
    private String name;
    private String email;
    private String password; // For registration input (plain text, not stored directly)
    private String passwordHash; // Stored in DB (hashed password)
    private String contactNo;
    private String role;
    private String department;

    // Default constructor for Jackson deserialization
    public User() {
    }

    // Constructor for registration (takes plain password for hashing)
    public User(String name, String email, String password, String contactNo, String role, String department) {
        this.name = name;
        this.email = email;
        this.password = password; // This is the raw password to be hashed
        this.contactNo = contactNo;
        this.role = role;
        this.department = department;
    }

    // Constructor for retrieving from DB (takes hashed password)
    public User(int id, String name, String email, String passwordHash, String contactNo, String role, String department) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash; // This is the hashed password from DB
        this.contactNo = contactNo;
        this.role = role;
        this.department = department;
    }

    // Getters and Setters (Important for Jackson serialization/deserialization)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password; // Only for deserialization from frontend input
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getContactNo() {
        return contactNo;
    }

    public void setContactNo(String contactNo) {
        this.contactNo = contactNo;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}