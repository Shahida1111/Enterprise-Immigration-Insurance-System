package com.InsuranceManagement.InsuranceManagement.controller;


import com.InsuranceManagement.InsuranceManagement.dto.InitialQuoteResponse;
import com.InsuranceManagement.InsuranceManagement.service.ReferenceService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quote") // Best practice for clean URLs
@CrossOrigin(origins = "http://localhost:4200") // Allows Angular to connect
public class QuoteController {

    private final ReferenceService referenceService;

    public QuoteController(ReferenceService referenceService) {
        this.referenceService = referenceService;
    }

    @GetMapping("/initiateQuote")
    public InitialQuoteResponse initiateQuote(
            @RequestParam String product,
            @RequestParam String intermediary) {

        InitialQuoteResponse response = new InitialQuoteResponse();

        // 1. Data from JSON Files
        response.setCountries(referenceService.getCountries());
        response.setTerms(referenceService.getTerms());

        // 2. Set Status (This is critical for your state machine)
        response.setStatus("IQ");

        return response;
    }
}
