package com.screening.interviews.service;

import com.screening.interviews.dto.*;
import com.screening.interviews.enums.TaskStatus;
import com.screening.interviews.model.OnboardingTask;
import com.screening.interviews.repo.OnboardingTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingTaskService {

    private final OnboardingTaskRepository onboardingTaskRepository;

    // Tenant Operations

    /**
     * Get all onboarding tasks for a tenant
     */
    public List<OnboardingTaskDTO> getAllTasksForTenant(Long tenantId) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findByTenantIdOrderBySequenceOrderAsc(tenantId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks for a tenant filtered by status
     */
    public List<OnboardingTaskDTO> getTasksForTenantByStatus(Long tenantId, TaskStatus status) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findByTenantIdAndStatusOrderBySequenceOrderAsc(tenantId, status);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks for a specific job within a tenant
     */
    public List<OnboardingTaskDTO> getTasksForTenantByJob(Long tenantId, UUID jobId) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findByTenantIdAndJobIdOrderBySequenceOrderAsc(tenantId, jobId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks for a specific candidate within a tenant
     */
    public List<OnboardingTaskDTO> getTasksForTenantByCandidate(Long tenantId, Long candidateId) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findByTenantIdAndCandidateIdOrderBySequenceOrderAsc(tenantId, candidateId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new onboarding task
     */
    @Transactional
    public OnboardingTaskDTO createTask(Long tenantId, Long assignedByUserId, OnboardingTaskCreateRequest request) {
        OnboardingTask task = OnboardingTask.builder()
                .tenantId(tenantId)
                .candidateId(request.getCandidateId())
                .jobId(request.getJobId())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .sequenceOrder(request.getSequenceOrder())
                .dueDate(request.getDueDate())
                .assignedBy(assignedByUserId)
                .notes(request.getNotes())
                .isMandatory(request.getIsMandatory() != null ? request.getIsMandatory() : true)
                .status(TaskStatus.PENDING)
                .build();

        OnboardingTask savedTask = onboardingTaskRepository.save(task);
        log.info("Created onboarding task {} for candidate {} in tenant {}", savedTask.getTaskId(), request.getCandidateId(), tenantId);

        return convertToDTO(savedTask);
    }

    /**
     * Get overdue tasks for a tenant
     */
    public List<OnboardingTaskDTO> getOverdueTasksForTenant(Long tenantId) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findOverdueTasksByTenant(tenantId, LocalDateTime.now());
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Candidate Operations

    /**
     * Get all tasks assigned to a candidate
     */
    public List<OnboardingTaskDTO> getTasksForCandidate(Long candidateId) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findByCandidateIdOrderBySequenceOrderAsc(candidateId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks for a candidate filtered by status
     */
    public List<OnboardingTaskDTO> getTasksForCandidateByStatus(Long candidateId, TaskStatus status) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findByCandidateIdAndStatusOrderBySequenceOrderAsc(candidateId, status);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get pending tasks for a candidate
     */
    public List<OnboardingTaskDTO> getPendingTasksForCandidate(Long candidateId) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findPendingTasksByCandidate(candidateId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get completed tasks for a candidate
     */
    public List<OnboardingTaskDTO> getCompletedTasksForCandidate(Long candidateId) {
        List<OnboardingTask> tasks = onboardingTaskRepository.findCompletedTasksByCandidate(candidateId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mark a task as completed by candidate
     */
    @Transactional
    public OnboardingTaskDTO completeTask(Long taskId, Long candidateId, OnboardingTaskCompleteRequest request) {
        OnboardingTask task = onboardingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify the task belongs to the candidate
        if (!task.getCandidateId().equals(candidateId)) {
            throw new RuntimeException("Task does not belong to the specified candidate");
        }

        // Verify the task is not already completed
        if (task.isCompleted()) {
            throw new RuntimeException("Task is already completed");
        }

        task.markAsCompleted(candidateId);
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            task.setNotes(task.getNotes() != null ?
                    task.getNotes() + "\n\nCompletion Notes: " + request.getNotes() :
                    "Completion Notes: " + request.getNotes());
        }

        OnboardingTask savedTask = onboardingTaskRepository.save(task);
        log.info("Task {} marked as completed by candidate {}", taskId, candidateId);

        return convertToDTO(savedTask);
    }

    /**
     * Get task summary for a candidate
     */
    public OnboardingTaskSummaryDTO getTaskSummaryForCandidate(Long candidateId) {
        Long totalTasks = onboardingTaskRepository.countTasksByStatusForCandidate(candidateId, null);
        Long completedTasks = onboardingTaskRepository.countTasksByStatusForCandidate(candidateId, TaskStatus.COMPLETED);
        Long pendingTasks = onboardingTaskRepository.countTasksByStatusForCandidate(candidateId, TaskStatus.PENDING);
        Long overdueTasks = (long) onboardingTaskRepository.findOverdueTasksByCandidate(candidateId, LocalDateTime.now()).size();
        Double completionRate = onboardingTaskRepository.getCompletionRateForCandidate(candidateId);
        Boolean hasPendingMandatory = onboardingTaskRepository.hasPendingMandatoryTasks(candidateId);

        return OnboardingTaskSummaryDTO.builder()
                .candidateId(candidateId)
                .totalTasks(totalTasks != null ? totalTasks : 0L)
                .completedTasks(completedTasks != null ? completedTasks : 0L)
                .pendingTasks(pendingTasks != null ? pendingTasks : 0L)
                .overdueTasks(overdueTasks != null ? overdueTasks : 0L)
                .completionRate(completionRate != null ? completionRate : 0.0)
                .hasPendingMandatoryTasks(hasPendingMandatory != null ? hasPendingMandatory : false)
                .build();
    }

    // Common Operations

    /**
     * Update a task
     */
    @Transactional
    public OnboardingTaskDTO updateTask(Long taskId, OnboardingTaskUpdateRequest request) {
        OnboardingTask task = onboardingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getSequenceOrder() != null) task.setSequenceOrder(request.getSequenceOrder());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getNotes() != null) task.setNotes(request.getNotes());
        if (request.getIsMandatory() != null) task.setIsMandatory(request.getIsMandatory());

        OnboardingTask savedTask = onboardingTaskRepository.save(task);
        log.info("Updated onboarding task {}", taskId);

        return convertToDTO(savedTask);
    }

    /**
     * Delete a task
     */
    @Transactional
    public void deleteTask(Long taskId) {
        if (!onboardingTaskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found");
        }
        onboardingTaskRepository.deleteById(taskId);
        log.info("Deleted onboarding task {}", taskId);
    }

    /**
     * Get a specific task by ID
     */
    public OnboardingTaskDTO getTaskById(Long taskId) {
        OnboardingTask task = onboardingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return convertToDTO(task);
    }

    // Helper Methods

    private OnboardingTaskDTO convertToDTO(OnboardingTask task) {
        return OnboardingTaskDTO.builder()
                .taskId(task.getTaskId())
                .tenantId(task.getTenantId())
                .candidateId(task.getCandidateId())
                .jobId(task.getJobId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .sequenceOrder(task.getSequenceOrder())
                .dueDate(task.getDueDate())
                .assignedBy(task.getAssignedBy())
                .assignedAt(task.getAssignedAt())
                .completedAt(task.getCompletedAt())
                .completedBy(task.getCompletedBy())
                .notes(task.getNotes())
                .isMandatory(task.getIsMandatory())
                .isOverdue(task.isOverdue())
                // Additional fields would be populated if needed from joined data
                .build();
    }
}