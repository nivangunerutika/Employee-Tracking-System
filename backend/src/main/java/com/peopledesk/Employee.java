package com.peopledesk;

import jakarta.persistence.*;

@Entity
public class Employee extends Base {
    public String userId;
    public String name;
    public String email;
    public String department;
    @Column(name = "job_position") public String position;
    public String phone;
    public String joiningDate;   // yyyy-MM-dd
    public String status;        // Active / Inactive
}
