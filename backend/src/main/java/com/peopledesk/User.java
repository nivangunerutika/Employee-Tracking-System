package com.peopledesk;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User extends Base {
    public String name;
    @Column(unique = true) public String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) public String password;
    @Column(name = "user_role") public String role;   // "admin" or "employee"
}
