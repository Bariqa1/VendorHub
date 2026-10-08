package com.vendorhub.contract.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vendorhub.contract.entity.ContractMilestone;
import com.vendorhub.contract.enums.MilestoneStatus;

import java.util.List;

@Repository
public interface ContractMilestoneRepository extends JpaRepository<ContractMilestone, Long> {

    List<ContractMilestone> findByContractId(Long contractId);

    List<ContractMilestone> findByContractIdAndStatus(Long contractId, MilestoneStatus status);
}
