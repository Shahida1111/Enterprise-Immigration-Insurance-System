package com.InsuranceManagement.InsuranceManagement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.InsuranceManagement.InsuranceManagement.model.Country;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class ReferenceService {

    private List<Country> cachedCountries;
    private List<String> cachedTerms; // New memory cache for terms
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() throws IOException {
        // Load Countries
        InputStream countriesStream = getClass().getResourceAsStream("/data/countries.json");
        this.cachedCountries = objectMapper.readValue(countriesStream, new TypeReference<List<Country>>(){});

        // Load Terms & Conditions
        InputStream termsStream = getClass().getResourceAsStream("/data/terms.json");
        this.cachedTerms = objectMapper.readValue(termsStream, new TypeReference<List<String>>(){});
    }

    public List<Country> getCountries() {
        return this.cachedCountries;
    }

    // No longer needs @Cacheable because it's already in memory!
    public List<String> getTerms() {
        return this.cachedTerms;
    }

    // ... getPlans method ...
}