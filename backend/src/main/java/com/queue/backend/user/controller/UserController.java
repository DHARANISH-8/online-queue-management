package com.queue.backend.user.controller;

import com.queue.backend.user.entity.User;
import com.queue.backend.user.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5176" })
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable String role) {
        System.out.println("Fetching users for role: " + role);
        List<User> users = userService.getUsersByRole(role);
        System.out.println("Found " + users.size() + " users for role: " + role);
        return users;
    }
}
