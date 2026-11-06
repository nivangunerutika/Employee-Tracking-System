package com.peopledesk;

public record SalaryRequest(String employeeId, String month, Double basic, Double allowance, Double deductions) {}
