// frontend/src/java/com/example/Complaints/Complaint.java
package com.example.complaints; // Ensure this package matches where you place the file

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import for ignoring unknown properties during deserialization

@JsonIgnoreProperties(ignoreUnknown = true) // To ignore any extra fields from frontend
public class Complaint {
    private int id;
    private int asset_id; // From frontend assetId
    private String asset_type; // From frontend assetType
    private String location; // From frontend location
    private String complaint_category; // From frontend complaintCategory
    private String description; // From frontend complaintDescription
    private String department; // From frontend department
    private int raised_by_user_id; // Foreign key to link complaint to a user
    private String raised_by_user_name; // To store the name of the user who raised it (for display)
    private String created_at; // YYYY-MM-DD format
    private String status; // e.g., "OPEN", "IN_PROGRESS", "CLOSED"
    private String closed_at; // YYYY-MM-DD format, nullable
    private String closed_feedback; // Nullable

    // Default constructor for Jackson deserialization
    public Complaint() {
    }

    // Constructor for creating new complaints (without ID, status, closed_at, closed_feedback initially)
    public Complaint(int asset_id, String asset_type, String location, String complaint_category,
                     String description, String department, int raised_by_user_id,
                     String raised_by_user_name, String created_at) {
        this.asset_id = asset_id;
        this.asset_type = asset_type;
        this.location = location;
        this.complaint_category = complaint_category;
        this.description = description;
        this.department = department;
        this.raised_by_user_id = raised_by_user_id;
        this.raised_by_user_name = raised_by_user_name;
        this.created_at = created_at;
        this.status = "OPEN"; // Default status
    }

    // Full constructor for retrieving from DB (with ID, status, closed_at, closed_feedback)
    public Complaint(int id, int asset_id, String asset_type, String location, String complaint_category,
                     String description, String department, int raised_by_user_id,
                     String raised_by_user_name, String created_at, String status,
                     String closed_at, String closed_feedback) {
        this.id = id;
        this.asset_id = asset_id;
        this.asset_type = asset_type;
        this.location = location;
        this.complaint_category = complaint_category;
        this.description = description;
        this.department = department;
        this.raised_by_user_id = raised_by_user_id;
        this.raised_by_user_name = raised_by_user_name;
        this.created_at = created_at;
        this.status = status;
        this.closed_at = closed_at;
        this.closed_feedback = closed_feedback;
    }

    // Getters and Setters for all fields (Important for Jackson serialization/deserialization)
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getAsset_id() { return asset_id; }
    public void setAsset_id(int asset_id) { this.asset_id = asset_id; }

    public String getAsset_type() { return asset_type; }
    public void setAsset_type(String asset_type) { this.asset_type = asset_type; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getComplaint_category() { return complaint_category; }
    public void setComplaint_category(String complaint_category) { this.complaint_category = complaint_category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getRaised_by_user_id() { return raised_by_user_id; }
    public void setRaised_by_user_id(int raised_by_user_id) { this.raised_by_user_id = raised_by_user_id; }

    public String getRaised_by_user_name() { return raised_by_user_name; }
    public void setRaised_by_user_name(String raised_by_user_name) { this.raised_by_user_name = raised_by_user_name; }

    public String getCreated_at() { return created_at; }
    public void setCreated_at(String created_at) { this.created_at = created_at; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getClosed_at() { return closed_at; }
    public void setClosed_at(String closed_at) { this.closed_at = closed_at; }

    public String getClosed_feedback() { return closed_feedback; }
    public void setClosed_feedback(String closed_feedback) { this.closed_feedback = closed_feedback; }
}