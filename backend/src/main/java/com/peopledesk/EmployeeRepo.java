package com.peopledesk;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepo extends JpaRepository<Employee, String> {
    List<Employee> findByEmailIgnoreCase(String email);
}
