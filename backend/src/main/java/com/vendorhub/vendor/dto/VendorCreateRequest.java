package com.vendorhub.vendor.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorCreateRequest {

    @NotBlank(message = "Arabic company name is required")
    @Size(max = 200, message = "Arabic company name cannot exceed 200 characters")
    private String companyNameAr;

    @NotBlank(message = "English company name is required")
    @Size(max = 200, message = "English company name cannot exceed 200 characters")
    private String companyNameEn;

    @NotBlank(message = "Commercial Registration (CR) is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "CR number must be exactly 10 digits")
    private String crNumber;

    @NotNull(message = "CR expiry date is required")
    @Future(message = "CR expiry date must be in the future")
    private LocalDate crExpiryDate;

    @NotBlank(message = "Tax / VAT number is required")
    @Pattern(regexp = "^3[0-9]{13}3$", message = "Saudi VAT number must be 15 digits starting and ending with 3")
    private String taxNumber;

    @Size(max = 255)
    private String nationalAddress;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Valid email is required")
    @Size(max = 100)
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    @Size(max = 20)
    private String contactPhone;

    @Size(max = 255)
    private String websiteUrl;
}
