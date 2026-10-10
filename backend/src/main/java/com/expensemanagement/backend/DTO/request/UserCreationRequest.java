package com.expensemanagement.backend.DTO.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
public class UserCreationRequest {
    private String username;
    private  String password;
    private String firstname;
    private String lastname;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

}
