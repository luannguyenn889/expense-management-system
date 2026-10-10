package com.expensemanagement.backend.service;

import com.expensemanagement.backend.DTO.request.UserCreationRequest;
import com.expensemanagement.backend.DTO.request.UserUpdateRequest;
import com.expensemanagement.backend.entity.User;
import com.expensemanagement.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// Service la lop chua logic xu ly, tuong tac voi repository de lay du lieu va tra ve cho controller de tra ve cho client
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User createRequest(UserCreationRequest request){
       User users = new User();
       users.setUsername(request.getUsername());
       users.setPassword(request.getPassword());
       users.setFirstname(request.getFirstname());
       users.setLastname(request.getLastname());
       users.setDob(request.getDob());

       return userRepository.save(users);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUser(Long id){
       return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateRequest(Long userID, UserUpdateRequest request){
        User users = getUser(userID);
        users.setFirstname(request.getFirstname());
        users.setLastname(request.getLastname());
        users.setDob(request.getDob());
        users.setPassword(request.getPassword());
// Tra ve Responsitory de luu vao db
        return userRepository.save(users);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Tim user theo username va password (su dung query thong qua Spring Data JPA cho toi uu)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
    
    // Tim user theo password -> ban khong nen co ham nay, rat mat bao mat va khong thuc te.
}
