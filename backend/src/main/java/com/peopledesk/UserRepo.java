package com.peopledesk;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}
