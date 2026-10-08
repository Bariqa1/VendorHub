package com.vendorhub.vendor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorUpdateRequest {

    @NotBlank(message = "Arabic company name is required")
    @Size(max = 200)
    private String companyNameAr;

    @NotBlank(message = "English company name is required")
    @Size(max = 200)
    private String companyNameEn;

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
