package com.screening.interviews.controller;

import com.screening.interviews.dto.*;
import com.screening.interviews.enums.TaskStatus;
import com.screening.interviews.service.OnboardingTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/onboarding-tasks")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OnboardingTaskController {

    private final OnboardingTaskService onboardingTaskService;

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<OnboardingTaskDTO>> getAllTasksForTenant(
            @PathVariable Long tenantId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) UUID jobId,
            @RequestParam(required = false) Long candidateId) {

        try {
            List<OnboardingTaskDTO> tasks;

            if (candidateId != null) {
                tasks = onboardingTaskService.getTasksForTenantByCandidate(tenantId, candidateId);
            } else if (jobId != null) {
                tasks = onboardingTaskService.getTasksForTenantByJob(tenantId, jobId);
            } else if (status != null) {
                tasks = onboardingTaskService.getTasksForTenantByStatus(tenantId, status);
            } else {
                tasks = onboardingTaskService.getAllTasksForTenant(tenantId);
            }

            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error fetching tasks for tenant {}: {}", tenantId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/tenant/{tenantId}")
    public ResponseEntity<OnboardingTaskDTO> createTask(
            @PathVariable Long tenantId,
            @RequestParam Long assignedByUserId,
            @Valid @RequestBody OnboardingTaskCreateRequest request) {
        System.out.println("request: " + request);
        try {
            OnboardingTaskDTO createdTask = onboardingTaskService.createTask(tenantId, assignedByUserId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (Exception e) {
            log.error("Error creating task for tenant {}: {}", tenantId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/tenant/{tenantId}/overdue")
    public ResponseEntity<List<OnboardingTaskDTO>> getOverdueTasksForTenant(@PathVariable Long tenantId) {
        try {
            List<OnboardingTaskDTO> tasks = onboardingTaskService.getOverdueTasksForTenant(tenantId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error fetching overdue tasks for tenant {}: {}", tenantId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<OnboardingTaskDTO>> getTasksForCandidate(
            @PathVariable Long candidateId,
            @RequestParam(required = false) TaskStatus status) {

        try {
            List<OnboardingTaskDTO> tasks;

            if (status != null) {
                tasks = onboardingTaskService.getTasksForCandidateByStatus(candidateId, status);
            } else {
                tasks = onboardingTaskService.getTasksForCandidate(candidateId);
            }

            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error fetching tasks for candidate {}: {}", candidateId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/candidate/{candidateId}/pending")
    public ResponseEntity<List<OnboardingTaskDTO>> getPendingTasksForCandidate(@PathVariable Long candidateId) {
        try {
            List<OnboardingTaskDTO> tasks = onboardingTaskService.getPendingTasksForCandidate(candidateId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error fetching pending tasks for candidate {}: {}", candidateId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/candidate/{candidateId}/completed")
    public ResponseEntity<List<OnboardingTaskDTO>> getCompletedTasksForCandidate(@PathVariable Long candidateId) {
        try {
            List<OnboardingTaskDTO> tasks = onboardingTaskService.getCompletedTasksForCandidate(candidateId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error fetching completed tasks for candidate {}: {}", candidateId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/candidate/{candidateId}/tasks/{taskId}/complete")
    public ResponseEntity<OnboardingTaskDTO> completeTask(
            @PathVariable Long candidateId,
            @PathVariable Long taskId,
            @RequestBody(required = false) OnboardingTaskCompleteRequest request) {

        try {
            if (request == null) {
                request = new OnboardingTaskCompleteRequest();
            }
            OnboardingTaskDTO completedTask = onboardingTaskService.completeTask(taskId, candidateId, request);
            return ResponseEntity.ok(completedTask);
        } catch (RuntimeException e) {
            log.error("Error completing task {} for candidate {}: {}", taskId, candidateId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Unexpected error completing task {} for candidate {}: {}", taskId, candidateId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/candidate/{candidateId}/summary")
    public ResponseEntity<OnboardingTaskSummaryDTO> getTaskSummaryForCandidate(@PathVariable Long candidateId) {
        try {
            OnboardingTaskSummaryDTO summary = onboardingTaskService.getTaskSummaryForCandidate(candidateId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error fetching task summary for candidate {}: {}", candidateId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<OnboardingTaskDTO> getTaskById(@PathVariable Long taskId) {
        try {
            OnboardingTaskDTO task = onboardingTaskService.getTaskById(taskId);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            log.error("Task {} not found: {}", taskId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error fetching task {}: {}", taskId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<OnboardingTaskDTO> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody OnboardingTaskUpdateRequest request) {

        try {
            OnboardingTaskDTO updatedTask = onboardingTaskService.updateTask(taskId, request);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            log.error("Error updating task {}: {}", taskId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Unexpected error updating task {}: {}", taskId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        try {
            onboardingTaskService.deleteTask(taskId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting task {}: {}", taskId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Unexpected error deleting task {}: {}", taskId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/statuses")
    public ResponseEntity<TaskStatus[]> getTaskStatuses() {
        return ResponseEntity.ok(TaskStatus.values());
    }
}