package com.peopledesk;

import jakarta.persistence.*;

@Entity
public class Salary extends Base {
    public String employeeId;
    public String userId;
    public String employeeName;
    @Column(name = "salary_month") public String month;   // yyyy-MM
    public double basic;
    public double allowance;
    public double deductions;
    public double netSalary;
}
