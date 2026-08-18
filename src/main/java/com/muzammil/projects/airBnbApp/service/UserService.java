package com.muzammil.projects.airBnbApp.service;

import com.muzammil.projects.airBnbApp.dto.ProfileUpdateRequestDto;
import com.muzammil.projects.airBnbApp.dto.UserDto;
import com.muzammil.projects.airBnbApp.entity.User;

public interface UserService {

    User getUserById(Long id);

    void updateProfile(ProfileUpdateRequestDto profileUpdateRequestDto);

    UserDto getMyProfile();
}
