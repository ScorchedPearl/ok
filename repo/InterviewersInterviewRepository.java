package com.screening.interviews.repo;

import com.screening.interviews.model.InterviewersInterview;
import com.screening.interviews.model.InterviewersInterviewId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewersInterviewRepository extends JpaRepository<InterviewersInterview, InterviewersInterviewId> {
    List<InterviewersInterview> findByIdUserId(Long userId);
}
