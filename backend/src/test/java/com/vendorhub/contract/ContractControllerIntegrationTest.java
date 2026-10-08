package com.vendorhub.contract;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vendorhub.contract.dto.ContractCreateRequest;
import com.vendorhub.contract.dto.MilestoneCreateRequest;
import com.vendorhub.contract.enums.ContractType;
import com.vendorhub.vendor.entity.Vendor;
import com.vendorhub.vendor.enums.VendorStatus;
import com.vendorhub.vendor.repository.VendorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContractControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VendorRepository vendorRepository;

    @Test
    @WithMockUser(username = "procurement", roles = "PROCUREMENT_OFFICER")
    @DisplayName("Should query paginated list of contracts")
    void shouldQueryContracts() throws Exception {
        mockMvc.perform(get("/api/v1/contracts")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @WithMockUser(username = "procurement", roles = "PROCUREMENT_OFFICER")
    @DisplayName("Should create contract linked to an approved vendor with milestones")
    void shouldCreateContractWithMilestones() throws Exception {
        Vendor approvedVendor = vendorRepository.findByStatus(VendorStatus.APPROVED, null)
                .getContent().get(0);

        ContractCreateRequest request = ContractCreateRequest.builder()
                .vendorPublicId(approvedVendor.getPublicId())
                .contractNumber("VHB-2026-TEST01")
                .title("عقد توريد مستلزمات مكتبية وتقنية")
                .contractType(ContractType.SUPPLY)
                .totalAmount(new BigDecimal("250000.00"))
                .currency("SAR")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(6))
                .paymentTerms("الدفع عند كل مرحلة")
                .milestones(List.of(
                        MilestoneCreateRequest.builder()
                                .title("الدفعة الأولى: التوريد المبدئي")
                                .amount(new BigDecimal("125000.00"))
                                .dueDate(LocalDate.now().plusMonths(2))
                                .build(),
                        MilestoneCreateRequest.builder()
                                .title("الدفعة الثانية: الاستلام النهائي")
                                .amount(new BigDecimal("125000.00"))
                                .dueDate(LocalDate.now().plusMonths(6))
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/v1/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contractNumber", is("VHB-2026-TEST01")))
                .andExpect(jsonPath("$.totalAmount", is(250000.00)))
                .andExpect(jsonPath("$.milestones", hasSize(2)))
                .andExpect(jsonPath("$.status", is("DRAFT")));
    }
}
