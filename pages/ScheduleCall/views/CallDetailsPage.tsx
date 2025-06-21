import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Info,
  Mail,
  Phone,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { getCallById } from "../data/mockCalls";
import { useAuth } from "@/context/AuthContext";

// Types
interface CallDetails {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdBy: string;
  tenantId: string;
}

interface ConversationEntry {
  id: string;
  speaker: "assistant" | "user";
  content: string;
}

interface ApiCallDetails {
  callId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  jobId: string;
  createdBy: string;
  createdAt: string;
}

interface ApiCandidate {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  resumeSummary: string;
}

interface ApiResponse {
  candidate: ApiCandidate;
  conversation?: ConversationEntry[];
  summary?: string;
  callDetails: ApiCallDetails;
}

export default function CallDetailsPage() {
  const [callDetails, setCallDetails] = useState<ApiCallDetails | null>(null);
  const [candidate, setCandidate] = useState<ApiCandidate | null>(null);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [summary, setSummary] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const { callId } = useParams();
  const navigate = useNavigate();
  const {token}=useAuth();
  const interviewServiceUrl =
    import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

  useEffect(() => {
    const fetchCallDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get<ApiResponse>(
          `${interviewServiceUrl}/api/calls/${callId}/analysis`
          ,{
            headers: {
              "Content-Type": "application/json",
               "Authorization": token ? `Bearer ${token.access_token}` : ''
          }
        }
        );
        if (response.data) {
          setCallDetails(response.data.callDetails);
          setCandidate(response.data.candidate);
          setConversation(response.data.conversation || []);
          setSummary(response.data.summary);
        } else {
          // fallback to mock
          const callData = getCallById(callId || "");
          if (callData) {
            setCallDetails({
              callId: callData.id,
              scheduledAt: callData.scheduledAt,
              durationMinutes: callData.durationMinutes,
              status: callData.status,
              jobId: callData.jobId,
              createdBy: callData.createdBy,
              createdAt: "",
            });
            setCandidate({
              id: 0,
              fullName: callData.candidateName,
              email: callData.candidateEmail,
              phoneNumber: callData.candidatePhone,
              resumeSummary: "",
            });
            setConversation([]);
            setSummary(undefined);
          }
        }
      } catch (error) {
        const callData = getCallById(callId || "");
        if (callData) {
          setCallDetails({
            callId: callData.id,
            scheduledAt: callData.scheduledAt,
            durationMinutes: callData.durationMinutes,
            status: callData.status,
            jobId: callData.jobId,
            createdBy: callData.createdBy,
            createdAt: "",
          });
          setCandidate({
            id: 0,
            fullName: callData.candidateName,
            email: callData.candidateEmail,
            phoneNumber: callData.candidatePhone,
            resumeSummary: "",
          });
          setConversation([]);
          setSummary(undefined);
        } else toast.error("Failed to fetch call details");
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [callId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  // Error state - call not found
  if (!callDetails || !candidate) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Not Found</h1>
        <p className="text-gray-600 mb-6">
          The scheduled call you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button
          onClick={() => navigate("/job/calls")}
          className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scheduled Calls
        </Button>
      </div>
    );
  }

  // Status banner text and color
  const statusBanner = {
    PENDING: {
      color: "bg-yellow-50 border border-yellow-200 text-yellow-800",
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      text: "This call is awaiting confirmation",
    },
    SCHEDULED: {
      color: "bg-blue-50 border border-blue-200 text-blue-800",
      icon: <Calendar className="h-5 w-5 text-blue-600" />,
      text: "This call has been confirmed and scheduled",
    },
    COMPLETED: {
      color: "bg-green-50 border border-green-200 text-green-800",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      text: "This call has been completed",
    },
    CANCELLED: {
      color: "bg-red-50 border border-red-200 text-red-800",
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      text: "This call has been cancelled",
    },
  }[callDetails.status];

  // --- DESIGN ---
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-screen min-h-screen h-full bg-gradient-to-br from-indigo-50 to-white p-0 m-0"
      style={{ maxWidth: "100vw", overflowX: "hidden" }}
    >
      <div className="flex justify-between items-center mb-8 px-8 pt-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call Details</h1>
            <p className="text-gray-500">All information for this scheduled call</p>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8 px-4 pb-12">
        {/* Main info column (3/5) */}
        <div className="md:col-span-3 space-y-8">
          {/* Status banner */}
          <div className={`p-4 rounded-lg flex items-center shadow ${statusBanner.color}`}>
            <div className="rounded-full p-2 mr-3 bg-white/60">{statusBanner.icon}</div>
            <div>
              <h3 className="font-semibold text-base">Call Status: {callDetails.status}</h3>
              <p className="text-xs mt-1">{statusBanner.text}</p>
            </div>
          </div>
          
          {/* Only show summary if present */}
          {callDetails.status === "COMPLETED" && summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-indigo-700">
                  <Info className="h-5 w-5 text-indigo-600" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{summary}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Only show transcript if COMPLETED and transcript exists */}
          {callDetails.status === "COMPLETED" && conversation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-indigo-700">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                  Call Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
                  <div className="space-y-3">
                    {conversation.map((entry) => (
                      <div key={entry.id} className="flex items-start">
                        <span className={`font-semibold mr-2 ${entry.speaker === "assistant" ? "text-indigo-700" : "text-gray-700"}`}>
                          {entry.speaker === "assistant" ? "Assistant:" : "Candidate:"}
                        </span>
                        <span className="text-gray-800 whitespace-pre-line">{entry.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          
        </div>

        {/* Sidebar (2/5) */}
        <div className="md:col-span-2 space-y-8">
          {/* Call Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-indigo-700">
                <Info className="h-5 w-5 text-indigo-600" />
                Call Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-800">Date:</span>
                  </div>
                  <div className="ml-7 text-gray-700">
                    {format(new Date(callDetails.scheduledAt), "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-800">Time:</span>
                  </div>
                  <div className="ml-7 text-gray-700">
                    {format(new Date(callDetails.scheduledAt), "h:mm a")}
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <ClipboardList className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-800">Duration:</span>
                  </div>
                  <div className="ml-7 text-gray-700">
                    {callDetails.durationMinutes} minutes
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-800">Scheduled By:</span>
                  </div>
                  <div className="ml-7 text-gray-700">{callDetails.createdBy}</div>
                </div>
                {/* <div>
                  <div className="flex items-center mb-2">
                    <ClipboardList className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-800">Job ID:</span>
                  </div>
                  <div className="ml-7 text-gray-700">{callDetails.jobId}</div>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <ClipboardList className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-800">Call ID:</span>
                  </div>
                  <div className="ml-7 text-gray-700">{callDetails.callId}</div>
                </div> */}
                {callDetails.createdAt && (
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="font-medium text-gray-800">Created At:</span>
                    </div>
                    <div className="ml-7 text-gray-700">
                      {format(new Date(callDetails.createdAt), "PPpp")}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Candidate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-indigo-700">
                <User className="h-5 w-5 text-indigo-600" />
                Candidate Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">{candidate.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 text-sm">{candidate.email}</span>
                </div>
                {candidate.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 text-sm">{candidate.phoneNumber}</span>
                  </div>
                )}
                {candidate.resumeSummary && (
                  <div className="mt-2">
                    <span className="font-medium text-gray-800">Resume Summary:</span>
                    <p className="text-gray-700 text-sm">{candidate.resumeSummary}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}