package com.example.pmtasks;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PmTask {
    private int id;
    private int asset_id;
    private String quarter;
    private String last_pm_date;
    private String status;
    private Integer raised_by_user_id; // Use Integer for nullable foreign keys
    private Integer verified_by_user_id;
    private Integer approved_by_user_id;
    private Integer bill_approved_by_user_id;
    private String created_at;
    private String updated_at;

    // Fields from joined Asset table (for display in frontend)
    private String asset_type;
    private String department;
    private String description; // Corresponds to asset's description, not PM task's

    public PmTask() {
    }

    // Getters and Setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getAsset_id() {
        return asset_id;
    }

    public void setAsset_id(int asset_id) {
        this.asset_id = asset_id;
    }

    public String getQuarter() {
        return quarter;
    }

    public void setQuarter(String quarter) {
        this.quarter = quarter;
    }

    public String getLast_pm_date() {
        return last_pm_date;
    }

    public void setLast_pm_date(String last_pm_date) {
        this.last_pm_date = last_pm_date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRaised_by_user_id() {
        return raised_by_user_id;
    }

    public void setRaised_by_user_id(Integer raised_by_user_id) {
        this.raised_by_user_id = raised_by_user_id;
    }

    public Integer getVerified_by_user_id() {
        return verified_by_user_id;
    }

    public void setVerified_by_user_id(Integer verified_by_user_id) {
        this.verified_by_user_id = verified_by_user_id;
    }

    public Integer getApproved_by_user_id() {
        return approved_by_user_id;
    }

    public void setApproved_by_user_id(Integer approved_by_user_id) {
        this.approved_by_user_id = approved_by_user_id;
    }

    public Integer getBill_approved_by_user_id() {
        return bill_approved_by_user_id;
    }

    public void setBill_approved_by_user_id(Integer bill_approved_by_user_id) {
        this.bill_approved_by_user_id = bill_approved_by_user_id;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at;
    }

    public String getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(String updated_at) {
        this.updated_at = updated_at;
    }

    // Getters and Setters for joined fields
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
}
