package com.example.Assets; // Ensure this package matches the import in Main.java

public class Asset {
    private int id;
    private String asset_type;
    private String department;
    private String description;
    private String created_at; // Store as String (YYYY-MM-DD)
    private String location;
    private String last_maintenance; // Store as String (YYYY-MM-DD)
    private String serial_number;
    private int userId; // Foreign key to link asset to a user

    // Default constructor for Jackson deserialization
    public Asset() {
    }

    // Constructor for creating new assets (without ID initially)
    public Asset(String asset_type, String department, String description, String created_at, String location, String last_maintenance, String serial_number, int userId) {
        this.asset_type = asset_type;
        this.department = department;
        this.description = description;
        this.created_at = created_at;
        this.location = location;
        this.last_maintenance = last_maintenance;
        this.serial_number = serial_number;
        this.userId = userId;
    }

    // Constructor for retrieving assets from DB (with ID)
    public Asset(int id, String asset_type, String department, String description, String created_at, String location, String last_maintenance, String serial_number, int userId) {
        this.id = id;
        this.asset_type = asset_type;
        this.department = department;
        this.description = description;
        this.created_at = created_at;
        this.location = location;
        this.last_maintenance = last_maintenance;
        this.serial_number = serial_number;
        this.userId = userId;
    }

    // Getters and Setters (Important for Jackson serialization/deserialization)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getAsset_type() {
        return asset_type;
    }

    public void setAsset_type(String asset_type) {
        this.asset_type = asset_type;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getLast_maintenance() {
        return last_maintenance;
    }

    public void setLast_maintenance(String last_maintenance) {
        this.last_maintenance = last_maintenance;
    }

    public String getSerial_number() {
        return serial_number;
    }

    public void setSerial_number(String serial_number) {
        this.serial_number = serial_number;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }
}