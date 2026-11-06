package com.peopledesk;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;
import java.util.UUID;

@MappedSuperclass
public abstract class Base {
    @Id public String id = UUID.randomUUID().toString();
    public Instant createdAt = Instant.now();
}
