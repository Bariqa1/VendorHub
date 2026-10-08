package com.vendorhub.dashboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vendorhub.ai.dto.ContractQuestionRequest;
import com.vendorhub.contract.entity.Contract;
import com.vendorhub.contract.repository.ContractRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DashboardAndAiControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContractRepository contractRepository;

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    @DisplayName("Should return aggregated dashboard metrics")
    void shouldReturnDashboardMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVendors", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.activeVendors", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.activeContracts", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalCommittedValueSAR", greaterThan(0.0)));
    }

    @Test
    @WithMockUser(username = "procurement", roles = "PROCUREMENT_OFFICER")
    @DisplayName("Should analyze contract via AI service or resilient fallback")
    void shouldAnalyzeContract() throws Exception {
        Contract contract = contractRepository.findAll().get(0);

        mockMvc.perform(post("/api/v1/ai/contracts/" + contract.getPublicId() + "/analyze"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contractPublicId", is(contract.getPublicId().toString())))
                .andExpect(jsonPath("$.summary", notNullValue()))
                .andExpect(jsonPath("$.clauses", not(empty())))
                .andExpect(jsonPath("$.confidenceScore", greaterThan(0.0)));
    }

    @Test
    @WithMockUser(username = "procurement", roles = "PROCUREMENT_OFFICER")
    @DisplayName("Should answer contract questions accurately via AI endpoint")
    void shouldAnswerContractQuestion() throws Exception {
        Contract contract = contractRepository.findAll().get(0);

        ContractQuestionRequest request = ContractQuestionRequest.builder()
                .question("ما هي القيمة الإجمالية للعقد؟")
                .build();

        mockMvc.perform(post("/api/v1/ai/contracts/" + contract.getPublicId() + "/ask")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", notNullValue()))
                .andExpect(jsonPath("$.relevantClause", notNullValue()));
    }
}
