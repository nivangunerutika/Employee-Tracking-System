package com.peopledesk;

import jakarta.persistence.*;

@Entity
@Table(name = "leave_requests")
public class Leave extends Base {
    public String userId;
    public String employeeName;
    public String fromDate;
    public String toDate;
    @Column(length = 500) public String reason;
    public String status;     // Pending / Approved / Rejected
    public String created;    // yyyy-MM-dd
}
