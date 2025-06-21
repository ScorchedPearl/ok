"use client";

import  { useState, useEffect , } from "react";



import ManageInterviewersSection from "../InterviewDashboard/ManageInterviewers";

interface Interviewer {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface Interview {
  interviewId: number;
  candidateId: number;
  candidateEmail: string;
  testId?: number;
  position: string;
  roundNumber: number;
  interviewDate: string;
  mode: string;
  meetingLink: string | null;
  status: string;
  createdAt: string;
  emailSent: boolean;
  interviews: Interviewer[];
  secureToken?: string;
  tokenExpiration?: string;
  candidate_job_id?: number;
}






export default function AddInterviewersPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [positions, setPositions] = useState<string[]>([]);
  

  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

  useEffect(() => {
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  }, [interviews, activeTab, searchQuery, filterPosition]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${interviewServiceUrl}/api/interviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }
      const data: Record<string, any>[] = await response.json();
      console.log("Interviews Data", data);
      const transformedInterviews: Interview[] = data.map((interview) => ({
        interviewId: interview.interviewId,
        candidateId: interview.candidateId,
        candidateEmail: interview.candidateEmail,
        candidate_job_id: interview.candidate_job_id,
        testId: interview.testId,
        position: interview.position,
        roundNumber: interview.roundNumber,
        interviewDate: interview.interviewDate,
        mode: interview.mode,
        meetingLink: interview.meetingLink,
        status: interview.status,
        createdAt: interview.createdAt,
        emailSent: interview.emailSent,
        interviews: interview.interviews || [],
        secureToken: interview.secureToken,
        tokenExpiration: interview.tokenExpiration,
      }));

      const uniquePositions = [
        ...new Set(transformedInterviews.map((i) => i.position)),
      ];
      setPositions(uniquePositions);

      // Always sort with most recent date first (descending)
      const sortedInterviews = transformedInterviews.sort(
        (a, b) =>
          new Date(b.interviewDate).getTime() -
          new Date(a.interviewDate).getTime()
      );
      setInterviews(sortedInterviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };


  const applyFilters = () => {
    let result = [...interviews];
    if (activeTab !== "all") {
      result = result.filter((interview) => {
        switch (activeTab) {
          case "scheduled":
            return interview.status === "SCHEDULED";
          case "overdue":
            return interview.status === "COMPLETED_OVERDUE";
          case "completed":
            return interview.status === "COMPLETED_COMPLETED";
          case "cancelled":
            return interview.status === "CANCELLED";
          default:
            return true;
        }
      });
    }
    if (filterPosition !== "all") {
      result = result.filter(
        (interview) => interview.position === filterPosition
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (interview) =>
          interview.candidateEmail.toLowerCase().includes(query) ||
          interview.position.toLowerCase().includes(query) ||
          interview.interviews.some(
            (i) =>
              i.name.toLowerCase().includes(query) ||
              i.email.toLowerCase().includes(query)
          )
      );
    }
    // Always sort descending (most recent first)
    result = result.sort(
      (a, b) =>
        new Date(b.interviewDate).getTime() -
        new Date(a.interviewDate).getTime()
    );
    setFilteredInterviews(result);
  };


  return(
    <ManageInterviewersSection/>
  )

}