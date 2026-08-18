package com.muzammil.projects.airBnbApp.repository;

import com.muzammil.projects.airBnbApp.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
