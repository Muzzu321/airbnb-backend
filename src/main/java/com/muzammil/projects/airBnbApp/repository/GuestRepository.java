package com.muzammil.projects.airBnbApp.repository;

import com.muzammil.projects.airBnbApp.entity.Guest;
import com.muzammil.projects.airBnbApp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestRepository extends JpaRepository<Guest, Long> {
    List<Guest> findByUser(User user);
}