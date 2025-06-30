package com.screening.interviews.dto;

public class DepartmentUpdateRequest {
    private String oldDepartment;
    private String newDepartment;

    // Getters and setters
    public String getOldDepartment() {
        return oldDepartment;
    }

    public void setOldDepartment(String oldDepartment) {
        this.oldDepartment = oldDepartment;
    }

    public String getNewDepartment() {
        return newDepartment;
    }

    public void setNewDepartment(String newDepartment) {
        this.newDepartment = newDepartment;
    }
}