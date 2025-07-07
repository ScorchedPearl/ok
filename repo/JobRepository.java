// package com.screening.interviews.repo;

// import com.screening.interviews.model.Job;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import java.util.UUID;

// @Repository
// public interface JobRepository extends JpaRepository<Job, UUID> {
// }


package com.screening.interviews.repo;

import com.screening.interviews.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByTenantId(Long tenantId);
    List<Job> findByTenantIdAndDepartment(Long tenantId, String department);
}
