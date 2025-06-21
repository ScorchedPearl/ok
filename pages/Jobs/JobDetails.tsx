import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Building, X, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface JobDetails {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  disable?: boolean; // Add the disable property
}

const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "https://api.screenera.ai/api/api/auth-service";

export default function ViewJob() {
  const { jobId } = useParams();
  const navigate = useNavigate(); // Add useNavigate hook
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobNotAvailable, setJobNotAvailable] = useState(false); // New state for handling disabled jobs
  const [showAuthPopover, setShowAuthPopover] = useState(false);
  const { isAuthenticated, login, user } = useAuth();
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "CANDIDATE"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`${interviewServiceUrl}/api/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          
          // Check if job is disabled
          if (data.disable) {
            setJobNotAvailable(true);
            setJob(null);
          } else {
            setJob({
              ...data,
            });
          }
        } else {
          // Handle case where job doesn't exist
          setJobNotAvailable(true);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setJobNotAvailable(true);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setShowAuthPopover(true);
    } else {
      // Navigate to application form if authenticated
      window.location.href = `/job-application/${job?.id}`;
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    
    try {
      // Using the context's login function with candidate-realm
      await login('candidate-realm', loginData.username, loginData.password);
      
      // Close popover
      setShowAuthPopover(false);
      
      // Navigate to application form
      window.location.href = `/job-application/${job?.id}`;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    
    try {
      // Register the candidate
      const response = await axios.post(
        `${AUTH_SERVICE_URL}/candidate/register`, 
        {
          email: registerData.email,
          password: registerData.password,
          fullName: registerData.fullName,
          role: registerData.role
        }
      );
      
      if (response.status === 201 || response.status === 200) {
        // Automatically log in after successful registration
        await login('candidate-realm', registerData.email, registerData.password);
        
        // Close popover
        setShowAuthPopover(false);
        
        // Navigate to application form
        window.location.href = `/job-application/${job?.id}`;
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setAuthError(error.response.data?.message || 'Registration failed');
      } else {
        setAuthError(error instanceof Error ? error.message : 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render job not available message
  if (jobNotAvailable || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-4"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job No Longer Available</h2>
          <p className="text-gray-600 mb-6">This position has been filled or is no longer accepting applications.</p>
          <div className="flex justify-center">
            <Link to="/jobs">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Browse Available Jobs</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold text-xl text-indigo-600">Screenera</Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/jobs" className="text-gray-600 hover:text-indigo-600 font-medium">Jobs</Link>
              <Link to="/companies" className="text-gray-600 hover:text-indigo-600 font-medium">Companies</Link>
              <Link to="/resources" className="text-gray-600 hover:text-indigo-600 font-medium">Resources</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.fullName?.split(' ')[0]}</span>
                <Link to="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-indigo-600"
                  onClick={() => setShowAuthPopover(true)}
                >
                  Login
                </Button>
                <Button 
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setShowAuthPopover(true)}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-16 px-4 relative overflow-hidden">
        {/* Background content */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        
        {/* Job details */}
        <div className="container mx-auto max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-start"
          >
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-1">
                Job Details
              </Badge>
              
              {/* Company Name Above Job Title */}
              <div className="flex items-center space-x-2 text-gray-100 text-xl">
                <Building className="h-4 w-4" />
                <span className="font-semibold ">{job.companyName}</span>
              </div>
              
              <h1 className="text-4xl font-bold">{job.title}</h1>
              <div className="flex items-center space-x-4 text-indigo-50">
                <span>{job.department}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
              </div>
            </div>
            <Button
              onClick={handleApplyClick}
              className="bg-white text-indigo-600 hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105"
            >
              Apply
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Job Info Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/80 backdrop-blur-3xl shadow-xl border border-[#E2E8F0]">
              <CardHeader className="border-b border-[#E2E8F0] pb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-[#6366F1] bg-opacity-10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <CardTitle className="text-[#1E293B] text-xl font-bold">Job Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Company Field */}
                  <div className="space-y-2">
                    <div className="text-sm text-[#64748B] flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Company
                    </div>
                    <div className="text-[#1E293B] font-medium">{job.companyName}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-[#64748B] flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                        />
                      </svg>
                      Department
                    </div>
                    <div className="text-[#1E293B] font-medium">{job.department}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-[#64748B] flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                      </svg>
                      Location
                    </div>
                    <div className="text-[#1E293B] font-medium">{job.location}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-[#64748B] flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                        />
                      </svg>
                      Employment Type
                    </div>
                    <Badge className="bg-[#6366F1] bg-opacity-10 text-[#6366F1] capitalize">
                      {job.employmentType.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-[#64748B] flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      Posted Date
                    </div>
                    <div className="text-[#1E293B] font-medium">
                      {job.createdAt ? (
                        (() => {
                          try {
                            return format(new Date(job.createdAt), 'MMMM d, yyyy');
                          } catch (error) {
                            console.error('Error formatting date:', error);
                            return 'Date not available';
                          }
                        })()
                      ) : (
                        'Date not available'
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Description Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-[#E2E8F0]">
              <CardHeader className="border-b border-[#E2E8F0] pb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-[#6366F1] bg-opacity-10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <CardTitle className="text-[#1E293B] text-xl font-bold">Job Description</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-gray max-w-none">
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-[#334155] mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Share Button */}
          <motion.div 
            variants={cardVariants}
            className="flex justify-end"
          >
            <Button
              variant="outline"
              className="border-[#E2E8F0] text-[#64748B] hover:bg-gray-50"
            >
              Share Job
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Authentication Popover */}
      {showAuthPopover && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden"
          >
            {/* Close button */}
            <button 
              onClick={() => setShowAuthPopover(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Authentication header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Authenticate to Apply</h2>
              <p className="text-indigo-100 mt-1">Login or create an account to apply for this job</p>
            </div>
            
            {/* Auth error message */}
            {authError && (
              <div className="bg-red-50 text-red-600 p-3 text-sm font-medium border-b border-red-100">
                {authError}
              </div>
            )}
            
            {/* Auth tabs */}
            <div className="p-6">
              <Tabs defaultValue="login">
                <TabsList className="grid grid-cols-1 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  {/* <TabsTrigger value="register">Register</TabsTrigger> */}
                </TabsList>
                
                {/* Login form */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="username" 
                          name="username"
                          type="email" 
                          placeholder="your@email.com"
                          className="pl-10"
                          value={loginData.username}
                          onChange={handleLoginChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="password" 
                          name="password"
                          type="password" 
                          placeholder="••••••••"
                          className="pl-10"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>

                  {/* <a href=''>
                    <p className="text-sm text-gray-500 mt-2">
                      Don't have an account? 
                      <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer" onClick={() => setShowAuthPopover(false)}>
                        Sign Up
                      </span>
                    </p>
                  </a> */}
                 
                  </form>
                </TabsContent>
                <a href='/candidate-registration'>

              <Button 
                variant="outline"
                className="w-full text-gray-500 hover:text-gray-700 border-gray-300 hover:bg-gray-50"
                // className="w-full bg-indigo-600 hover:bg-indigo-700"
              
              >
                Register
              </Button>
              </a>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}