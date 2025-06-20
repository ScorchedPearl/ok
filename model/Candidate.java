package com.screening.interviews.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "candidate_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "resume_file_url", columnDefinition = "text")
    private String resumeFileUrl;

    @Column(name = "resume_content", columnDefinition = "text")
    private String resumeContent;

    @Column(name = "resume_summary", columnDefinition = "text")
    private String resumeSummary;

    @Column(name = "job_title", length = 255)
    private String jobTitle;

    @Column(name = "salary", length = 50)
    private String salary;

    @Column(name = "language", length = 255)
    private String language;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "work_mode", length = 50)
    private String workMode;

    @Column(name = "preferred_role", length = 255)
    private String preferredRole;

    @Column(name = "preferred_locations", columnDefinition = "text")
    private String preferredLocations;

    @ElementCollection
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @Builder.Default
    private List<Skill> skills = new ArrayList<>();

//    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
//    @Builder.Default
//    private List candidateJobs = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", targetEntity = Job.class)
    private List<Job> candidateJobs;

    @Embeddable
    public static class Skill {
        @Column(name = "name", length = 255)
        private String name;

        @Column(name = "proficiency")
        private Integer proficiency;

        // Getters, setters, and constructors
        public Skill() {}

        public Skill(String name, Integer proficiency) {
            this.name = name;
            this.proficiency = proficiency;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getProficiency() {
            return proficiency;
        }

        public void setProficiency(Integer proficiency) {
            this.proficiency = proficiency;
        }
    }
}