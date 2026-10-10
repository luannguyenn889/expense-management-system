package com.expensemanagement.backend.controller;


import com.expensemanagement.backend.DTO.request.UserCreationRequest;
import com.expensemanagement.backend.DTO.request.UserUpdateRequest;
import com.expensemanagement.backend.entity.User;
import com.expensemanagement.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller la lop chua cac endpoint,
// nhan request tu client, goi service de xu ly va tra ve response cho client
@RestController
@RequestMapping("/users")
// @CrossOrigin(origins = "*")
public class UserControllers {
    @Autowired
    private UserService userService;

    @PostMapping
    public User createUser(@RequestBody UserCreationRequest request) {
        return userService.createRequest(request);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{userId}")
    public User users(@PathVariable("userId") Long userId){
        return userService.getUser(userId);
    }
    
    @PutMapping("/{userId}")
    public User updateRequest(@PathVariable("userId") Long userId, @RequestBody UserUpdateRequest request) {
         return userService.updateRequest(userId, request);
    }

    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable("userId") Long userId) {
        userService.deleteUser(userId);
        return "User has been deleted!";
    }
}

