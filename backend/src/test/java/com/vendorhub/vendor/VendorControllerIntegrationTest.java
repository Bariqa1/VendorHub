package com.vendorhub.vendor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vendorhub.vendor.dto.VendorCreateRequest;
import com.vendorhub.vendor.dto.VendorStatusUpdateRequest;
import com.vendorhub.vendor.enums.VendorStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VendorControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "procurement", roles = "PROCUREMENT_OFFICER")
    @DisplayName("Should return paginated list of vendors with search and filtering")
    void shouldReturnPaginatedVendors() throws Exception {
        mockMvc.perform(get("/api/v1/vendors")
                        .param("page", "0")
                        .param("size", "5")
                        .param("status", "APPROVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.page", is(0)));
    }

    @Test
    @WithMockUser(username = "procurement", roles = "PROCUREMENT_OFFICER")
    @DisplayName("Should create vendor with valid Saudi CR and VAT format")
    void shouldCreateVendorSuccessfully() throws Exception {
        VendorCreateRequest request = VendorCreateRequest.builder()
                .companyNameAr("شركة واحة الأعمال")
                .companyNameEn("Business Oasis Co")
                .crNumber("1010778899")
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300332211009003")
                .nationalAddress("الرياض، طريق التخصصي")
                .city("الرياض")
                .contactEmail("procure@oasis.sa")
                .contactPhone("+966551234888")
                .build();

        mockMvc.perform(post("/api/v1/vendors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.publicId", notNullValue()))
                .andExpect(jsonPath("$.crNumber", is("1010778899")))
                .andExpect(jsonPath("$.status", is("SUBMITTED")));
    }

    @Test
    @WithMockUser(username = "procurement", roles = "PROCUREMENT_OFFICER")
    @DisplayName("Should return 400 Bad Request when CR number fails regex validation")
    void shouldRejectInvalidCrNumber() throws Exception {
        VendorCreateRequest request = VendorCreateRequest.builder()
                .companyNameAr("شركة غير صالحة")
                .companyNameEn("Invalid Co")
                .crNumber("999") // Invalid CR: only 3 digits
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300332211009003")
                .city("الرياض")
                .contactEmail("invalid@test.sa")
                .contactPhone("+966551111111")
                .build();

        mockMvc.perform(post("/api/v1/vendors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.validationErrors.crNumber", notNullValue()));
    }
}
