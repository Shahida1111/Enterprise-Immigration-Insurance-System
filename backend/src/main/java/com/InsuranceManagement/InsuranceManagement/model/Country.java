package com.InsuranceManagement.InsuranceManagement.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
public class Country {

    private Long id;
    private String name;
    private String code;
}
