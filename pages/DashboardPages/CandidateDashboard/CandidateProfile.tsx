// import Header from "./header"
// import ComingSoonBanner from "./coming-soon-banner"
import JobProfileCard from "./components/job-profile-card"
import JobApplicationCard from "./components/job-application-card"
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CandidateProfile() {
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;
  const navigate = useNavigate();

  console.log("Token:", token);
  console.log("Tenant ID:", tenantId);
  console.log("User:", user);

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page in history
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4 p-2 hover:bg-gray-200 rounded-full" 
            onClick={handleGoBack}
            title="Go back"
          >
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Candidate Profile</h1>
        </div>

        <div className="space-y-6">
          <JobProfileCard />

          {/* <a href="/candidate/assessment">
          <JobApplicationCard />
          </a> */}
        </div>
      </main>
    </div>
  )
}