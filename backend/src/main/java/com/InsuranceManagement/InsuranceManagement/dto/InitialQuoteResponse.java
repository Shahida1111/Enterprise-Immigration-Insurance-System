package com.InsuranceManagement.InsuranceManagement.dto;

import com.InsuranceManagement.InsuranceManagement.model.Country;
import lombok.Data;

import java.util.List;

@Data
public class InitialQuoteResponse {
    // This tells Java: "I am sending a list of Country objects"
    private List<Country> countries;
    private List<String> terms;
    private String status = "IQ";
}
