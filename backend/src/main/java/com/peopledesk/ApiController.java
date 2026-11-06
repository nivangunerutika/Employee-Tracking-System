package com.peopledesk;

import static org.springframework.http.HttpStatus.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class ApiController {

    private static final Sort ORDER = Sort.by("createdAt");
    private final UserRepo users;
    private final EmployeeRepo emps;
    private final SalaryRepo sals;
    private final LeaveRepo leaves;

    public ApiController(UserRepo u, EmployeeRepo e, SalaryRepo s, LeaveRepo l) {
        this.users = u; this.emps = e; this.sals = s; this.leaves = l;
    }

    private static ResponseStatusException err(org.springframework.http.HttpStatus s, String m) {
        return new ResponseStatusException(s, m);
    }

    // ------------------------------ AUTH ------------------------------
    @PostMapping("/auth/register")
    public User register(@RequestBody User in) {
        String name = in.name == null ? "" : in.name.trim();
        String email = in.email == null ? "" : in.email.trim().toLowerCase();
        if (name.isEmpty() || email.isEmpty() || in.password == null || in.password.length() < 4)
            throw err(BAD_REQUEST, "Please check all fields.");
        if (users.findByEmail(email).isPresent())
            throw err(CONFLICT, "An account with this email already exists.");
        User u = new User();
        u.name = name; u.email = email; u.password = in.password;
        u.role = "admin".equals(in.role) ? "admin" : "employee";
        users.save(u);
        if (u.role.equals("employee")) {
            Employee e = new Employee();
            e.userId = u.id; e.name = name; e.email = email;
            e.department = "General"; e.position = "Employee"; e.phone = "";
            e.joiningDate = LocalDate.now().toString(); e.status = "Active";
            emps.save(e);
        }
        return u;
    }

    @PostMapping("/auth/login")
    public User login(@RequestBody Map<String, String> b) {
        String email = b.getOrDefault("email", "").trim().toLowerCase();
        String pass = b.get("password");
        return users.findByEmail(email)
                .filter(u -> u.password != null && u.password.equals(pass))
                .orElseThrow(() -> err(UNAUTHORIZED, "Invalid email or password. Please register first."));
    }

    @GetMapping("/users")
    public List<User> users() { return users.findAll(ORDER); }

    // ---------------------------- EMPLOYEES ----------------------------
    @GetMapping("/employees")
    public List<Employee> employees() { return emps.findAll(ORDER); }

    @PostMapping("/employees")
    public Employee addEmployee(@RequestBody Employee in) { return saveEmployee(new Employee(), in); }

    @PutMapping("/employees/{id}")
    public Employee editEmployee(@PathVariable String id, @RequestBody Employee in) {
        Employee e = emps.findById(id).orElseThrow(() -> err(NOT_FOUND, "Employee not found."));
        return saveEmployee(e, in);
    }

    @DeleteMapping("/employees/{id}")
    public void deleteEmployee(@PathVariable String id) { emps.deleteById(id); }

    private Employee saveEmployee(Employee e, Employee in) {
        String email = in.email == null ? "" : in.email.trim().toLowerCase();
        if (in.name == null || in.name.isBlank() || email.isEmpty())
            throw err(BAD_REQUEST, "Name and email are required.");
        if (emps.findByEmailIgnoreCase(email).stream().anyMatch(x -> !x.id.equals(e.id)))
            throw err(CONFLICT, "An employee with this email already exists.");
        e.name = in.name.trim(); e.email = email;
        e.department = in.department; e.position = in.position; e.phone = in.phone;
        e.joiningDate = in.joiningDate;
        e.status = in.status == null ? "Active" : in.status;
        e.userId = (in.userId == null || in.userId.isBlank()) ? null : in.userId;
        emps.save(e);
        if (e.userId != null) {
            users.findById(e.userId).ifPresent(u -> { u.name = e.name; u.email = e.email; users.save(u); });
        }
        return e;
    }

    // ----------------------------- SALARIES -----------------------------
    @GetMapping("/salaries")
    public List<Salary> salaries() { return sals.findAll(ORDER); }

    @PostMapping("/salaries")
    public Salary addSalary(@RequestBody SalaryRequest r) {
        if (r.employeeId() == null || r.employeeId().isBlank())
            throw err(BAD_REQUEST, "Select a valid employee.");
        Employee emp = emps.findById(r.employeeId())
                .orElseThrow(() -> err(BAD_REQUEST, "Select a valid employee."));
        if (r.month() == null || r.month().isBlank())
            throw err(BAD_REQUEST, "Salary month is required.");
        double basic = r.basic() == null ? 0 : r.basic();
        double allowance = r.allowance() == null ? 0 : r.allowance();
        double ded = r.deductions() == null ? 0 : r.deductions();
        if (ded > basic + allowance) throw err(BAD_REQUEST, "Deductions cannot exceed gross salary.");
        Salary s = new Salary();
        s.employeeId = emp.id; s.userId = emp.userId; s.employeeName = emp.name;
        s.month = r.month();
        s.basic = basic; s.allowance = allowance; s.deductions = ded;
        s.netSalary = basic + allowance - ded;
        return sals.save(s);
    }

    @DeleteMapping("/salaries/{id}")
    public void deleteSalary(@PathVariable String id) { sals.deleteById(id); }

    // ------------------------------ LEAVES ------------------------------
    @GetMapping("/leaves")
    public List<Leave> leaves() { return leaves.findAll(ORDER); }

    @PostMapping("/leaves")
    public Leave addLeave(@RequestBody Leave in) {
        if (in.userId == null || in.fromDate == null || in.toDate == null || in.reason == null || in.reason.isBlank())
            throw err(BAD_REQUEST, "Please fill all required fields.");
        if (in.toDate.compareTo(in.fromDate) < 0)
            throw err(BAD_REQUEST, "End date must be on or after start date.");
        Leave l = new Leave();
        l.userId = in.userId; l.employeeName = in.employeeName;
        l.fromDate = in.fromDate; l.toDate = in.toDate; l.reason = in.reason.trim();
        l.status = "Pending"; l.created = LocalDate.now().toString();
        return leaves.save(l);
    }

    @PutMapping("/leaves/{id}/status")
    public Leave setLeaveStatus(@PathVariable String id, @RequestBody Map<String, String> b) {
        String st = b.get("status");
        if (!"Approved".equals(st) && !"Rejected".equals(st)) throw err(BAD_REQUEST, "Invalid status.");
        Leave l = leaves.findById(id).orElseThrow(() -> err(NOT_FOUND, "Leave request not found."));
        l.status = st;
        return leaves.save(l);
    }
}
