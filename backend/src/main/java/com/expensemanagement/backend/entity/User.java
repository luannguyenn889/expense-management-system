package com.expensemanagement.backend.entity;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// Entity la lop tuong ung voi bang trong database, chua thong tin va cau truc cua bang, de spring tao bang trong database va tuong tac voi database
@Entity
@Getter
@Setter
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userid", nullable = false) // Map to userid (case-insensitive for MySQL)
    private Long id;

    private String username;
    private  String password;
    private String firstname;
    private String lastname;
    private LocalDate dob;


}
