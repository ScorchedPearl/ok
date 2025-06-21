// ChatbotComponent.tsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust the import path as needed
import ReactMarkdown from 'react-markdown';

// Define types for the component
type UserRole = 'general' | 'candidate' | 'tenant' | 'interviewer';
type ThemeColor = 'purple' | 'blue' | 'green' | 'pink';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface ChatResponse {
  response: string;
  session_id: string;
  error?: string;
}

interface TenantInfo {
  tenantId: number;
  tenantName: string;
  subscriptionPlanId: string;
  departments: string[];
  metadata: string;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  userId: number;
  keycloakId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  tenant?: TenantInfo;
  status: string;
  isFirstLogin: boolean;
  createdAt: string;
}

const ChatbotComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [theme, setTheme] = useState<ThemeColor>('purple');
  const [animation, setAnimation] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const interviewServiceUrl =
  import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";
  const CHAT_BOT_URL =
  import.meta.env.VITE_CHATBOT_URL || "http://localhost:8007";
  // Get auth context
  const { token, realm, user,  } = useAuth();
  
  // Determine userRole based on realm and user info
  const getUserRole = (): UserRole => {
    // First try to get role from user object if available
    if (user) {
      const userRole = user.role?.toLowerCase() || '';
      if (userRole.includes('tenant')) {
        return 'tenant';
      } else if (userRole.includes('candidate')) {
        return 'candidate';
      } else if (userRole.includes('interviewer')) {
        return 'interviewer';
      }
    }
    
    // Fall back to realm-based detection if no user or role not recognized
    const realmLower = realm?.toLowerCase() || '';
    if (realmLower.includes('tenant')) {
      return 'tenant';
    } else if (realmLower.includes('candidate')) {
      return 'candidate';
    } else if (realmLower.includes('interviewer')) {
      return 'interviewer';
    }
    
    // Default to general if no specific role can be determined
    return 'general';
  };
  
  const userRole = getUserRole();
  const masterPrompt = useRef<string>('');

  // Set theme color based on user role
  useEffect(() => {
    switch (userRole) {
      case 'tenant':
        setTheme('purple'); // Purple theme for tenants
        break;
      case 'candidate':
        setTheme('blue'); // Blue theme for candidates
        break;
      case 'interviewer':
        setTheme('green'); // Green theme for interviewers
        break;
      default:
        setTheme('pink'); // Pink theme for general users
    }
  }, [userRole]);

  // Create session ID when component mounts
  useEffect(() => {
    // Generate a random session ID
    const newSessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    
    // Initialize with a welcome message based on role
    const welcomeMessage = getWelcomeMessage(userRole, user);
    setMessages([{ type: 'bot', content: welcomeMessage }]);
    
    // Fetch master prompt based on role and user info
    fetchMasterPrompt();
    
    // Log the detected realm and role
    console.log(`Detected realm: ${realm}, assigned role: ${userRole}`);
    if (user) {
      console.log(`User details available: ${user.fullName}, ${user.role}`);
    }
  }, [realm, user]); // Re-run if realm or user changes

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

 const fetchMasterPrompt = async (): Promise<void> => {
  try {
    // Build personalized master prompt based on user info
    if (user) {
      if (userRole === 'tenant') {
        const tenantInfo = user.tenant;
        const industry = tenantInfo?.metadata ? 
          JSON.parse(tenantInfo.metadata).industry || 'your industry' : 
          'your industry';
        
        masterPrompt.current = 
          `You are ${user.fullName}, a ${user.role} at ${tenantInfo?.tenantName || 'your company'}. ` +
          `You work in the ${industry} industry. ` +
          `You've been using our platform since ${new Date(user.createdAt).toLocaleDateString()}.`;
      } else if (userRole === 'candidate') {
        // Fetch candidate's job applications to include in the prompt
        try {
          const response = await fetch(`${interviewServiceUrl}/api/job-applications/user/${user.userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const applications = await response.json() as Array<{
              jobId: string;
              status: string;
              appliedAt: string;
              matchScore: number;
              skills?: string[];
            }>;
            
            // Get job details for the applications
            const jobIds = [...new Set(applications.map(app => app.jobId))];
            const jobDetails: Record<string, { 
              title: string; 
              company: string;
              description?: string;
              requirements?: string[];
              location?: string;
            }> = {};
            
            if (jobIds.length > 0) {
              await Promise.all(jobIds.map(async (jobId) => {
                try {
                  const jobResponse = await fetch(`${interviewServiceUrl}/api/jobs/${jobId}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  if (jobResponse.ok) {
                    const jobData = await jobResponse.json();
                    jobDetails[jobId] = {
                      title: jobData.title || 'position',
                      company: jobData.companyName || 'company',
                      description: jobData.description,
                      requirements: jobData.requirements || [],
                      location: jobData.location
                    };
                  }
                } catch (error) {
                  console.error('Error fetching job details:', error);
                }
              }));
            }
            
            // Create a summary of the candidate's job applications
            let applicationsText = '';
            let mostRecentJobDetails = '';
            
            if (applications.length > 0) {
              // Sort applications by date (newest first)
              applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
              
              // Take the 3 most recent applications
              const recentApplications = applications.slice(0, 3);
              
              const applicationsList = recentApplications.map(app => {
                const jobTitle = jobDetails[app.jobId]?.title || 'a position';
                const company = jobDetails[app.jobId]?.company || 'a company';
                const date = new Date(app.appliedAt).toLocaleDateString();
                const matchScore = app.matchScore ? `with a ${app.matchScore}% match score` : '';
                const status = app.status ? `(Status: ${app.status})` : '';
                
                return `${jobTitle} at ${company} (applied on ${date}) ${matchScore} ${status}`;
              }).join(', ');
              
              applicationsText = applications.length === 1 
                ? `You have applied for ${applicationsList}.` 
                : `You have applied for ${applications.length} positions, including ${applicationsList}.`;
              
              // Add detailed information about the most recent job application
              const mostRecentApp = applications[0];
              const mostRecentJob = jobDetails[mostRecentApp.jobId];
              
              if (mostRecentJob && (mostRecentJob.description)) {
                mostRecentJobDetails = `\n\nYour most recent application is for ${mostRecentJob.title} at ${mostRecentJob.company}.`;
                
                if (mostRecentJob.description) {
                  // Include a condensed version of the job description (first 200 characters)
                  const shortenedDescription = mostRecentJob.description.length > 200 
                    ? mostRecentJob.description.substring(0, 200) + '...' 
                    : mostRecentJob.description;
                  
                  mostRecentJobDetails += ` The role involves: ${shortenedDescription}`;
                }
                
                if (mostRecentJob.requirements && mostRecentJob.requirements.length > 0) {
                  // Include up to 5 key requirements
                  const keyRequirements = mostRecentJob.requirements.slice(0, 5);
                  mostRecentJobDetails += ` Key requirements include: ${keyRequirements.join(', ')}.`;
                }
                
                if (mostRecentApp.matchScore) {
                  mostRecentJobDetails += ` Your profile has a ${mostRecentApp.matchScore}% match with this position.`;
                }
              }
            } else {
              applicationsText = "You haven't applied to any positions yet.";
            }
            
            // Create the skills summary if available
            let skillsText = '';
            const allSkills = applications.flatMap(app => app.skills || []);
            if (allSkills.length > 0) {
              // Count skill frequency
              const skillCounts = allSkills.reduce((acc, skill) => {
                acc[skill] = (acc[skill] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              // Get top 5 most frequent skills
              const topSkills = Object.entries(skillCounts)
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, 5)
                .map(([skill]) => skill);
              
              skillsText = `Your top skills include ${topSkills.join(', ')}.`;
            }
            
            // Create a suggested jobs section based on skills
            let suggestedJobsText = '';
            if (allSkills.length > 0 && applications.length > 0) {
              suggestedJobsText = `\n\nBased on your skills and application history, you might be interested in roles such as Software Engineer, Full Stack Developer, or DevOps Engineer.`;
            }
            
            masterPrompt.current = 
              `You are ${user.fullName}, a job candidate using our platform. ` +
              `Your email is ${user.email}. ` +
              `You've been using our platform since ${new Date(user.createdAt).toLocaleDateString()}. ` +
              applicationsText + ' ' +
              skillsText +
              mostRecentJobDetails +
              suggestedJobsText + 
              `\n\nYou can ask me about your job applications, how to improve your profile, or for help preparing for interviews.`;
          } else {
            // Fallback if job applications fetch fails
            masterPrompt.current = 
              `You are ${user.fullName}, applying for positions through our platform. ` +
              `Your email is ${user.email}. You've been using our platform since ${new Date(user.createdAt).toLocaleDateString()}.`;
          }
        } catch (error) {
          console.error('Error fetching job applications:', error);
          // Fallback if job applications fetch fails
          masterPrompt.current = 
            `You are ${user.fullName}, applying for positions through our platform. ` +
            `Your email is ${user.email}. You've been using our platform since ${new Date(user.createdAt).toLocaleDateString()}.`;
        }
      } else if (userRole === 'interviewer') {
        const tenantInfo = user.tenant;
        masterPrompt.current = 
          `You are ${user.fullName}, an interviewer at ${tenantInfo?.tenantName || 'your company'}. ` +
          `You've been conducting interviews through our platform since ${new Date(user.createdAt).toLocaleDateString()}.`;
      } else {
        masterPrompt.current = "How can I assist you today?";
      }
    } else {
      // Default prompts when no user info is available
      if (userRole === 'candidate') {
        masterPrompt.current = "You've applied for Software Engineer and Marketing Manager positions. Your interview is scheduled for next Tuesday. Your resume highlights 5 years of experience in web development.";
      } else if (userRole === 'tenant') {
        masterPrompt.current = "You manage 3 job listings. You have 15 candidate applications pending review. Your subscription expires in 14 days.";
      } else if (userRole === 'interviewer') {
        masterPrompt.current = "You have 5 interviews scheduled today. Next interview is with John Doe for Software Engineer position at 2:00 PM.";
      } else {
        masterPrompt.current = "Welcome to our job screening platform. How can I help you today?";
      }
    }
  } catch (error) {
    console.error('Error building master prompt:', error);
    masterPrompt.current = "How can I assist you today?";
  }
};

  const getWelcomeMessage = (role: UserRole, userInfo?: any): string => {
    // Personalized welcome messages when user info is available
    if (userInfo) {
      const firstName = userInfo.fullName.split(' ')[0]; // Get first name
      
      switch (role) {
        case 'candidate':
          return `# Hello ${firstName}! 👋\n\nI'm **Screenera AI**, your personal assistant for job applications and interview preparation. How can I help you today?`;
        case 'tenant':
          return `# Welcome back, ${firstName}! ✨\n\nI'm **Screenera AI**, ready to assist with managing your job listings and candidates for ${userInfo.tenant?.tenantName || 'your company'}. What would you like to do today?`;
        case 'interviewer':
          return `# Hello ${firstName}! 🌟\n\nI'm **Screenera AI**, your interviewing assistant at ${userInfo.tenant?.tenantName || 'your company'}. I can help with upcoming interviews, candidate evaluations, and scheduling. What do you need?`;
        default:
          return `# Hello ${firstName}! 👋\n\nI'm **Screenera AI**, here to assist with our job screening platform. How can I help you today?`;
      }
    }
    
    // Default welcome messages when no user info is available
    switch (role) {
      case 'candidate':
        return "# Hello there! 👋\n\nI'm **Screenera AI**, your personal assistant for job applications and interview preparation. How can I help you today?";
      case 'tenant':
        return "# Welcome back! ✨\n\nI'm **Screenera AI**, ready to assist with managing your job listings and candidates. What would you like to do today?";
      case 'interviewer':
        return "# Hello there! 🌟\n\nI'm **Screenera AI**, your interviewing assistant. I can help with upcoming interviews, candidate evaluations, and scheduling. What do you need?";
      default:
        return "# Hello! 👋\n\nI'm **Screenera AI**, here to assist with our job screening platform. How can I help you today?";
    }
  };

  const toggleChat = (): void => {
    setAnimation(true);
    setIsOpen(!isOpen);
    setTimeout(() => setAnimation(false), 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage = inputValue.trim();
    setMessages([...messages, { type: 'user', content: userMessage }]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Add user information to the request if available
      const userData = user ? {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        tenantName: user.tenant?.tenantName,
        tenantId: user.tenant?.tenantId
      } : undefined;

      
      // Call your Flask API
      const response = await fetch(`${CHAT_BOT_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
          role: userRole,
          master_prompt: masterPrompt.current,
          user: userData
        }),
      });
      
      const data: ChatResponse = await response.json();
      
      if (response.ok) {
        // Add bot response to chat
        setMessages(prevMessages => [...prevMessages, { type: 'bot', content: data.response }]);
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get theme color classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'purple':
        return {
          button: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
          header: 'bg-gradient-to-r from-purple-600 to-indigo-600',
          userBubble: 'bg-gradient-to-r from-purple-600 to-indigo-600',
          botBubble: 'bg-white border border-gray-200',
          loadingDot: 'bg-purple-500',
          input: 'focus:ring-purple-500 focus:border-purple-500'
        };
      case 'blue':
        return {
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          header: 'bg-gradient-to-r from-blue-600 to-cyan-600',
          userBubble: 'bg-gradient-to-r from-blue-600 to-cyan-600',
          botBubble: 'bg-white border border-gray-200',
          loadingDot: 'bg-blue-500',
          input: 'focus:ring-blue-500 focus:border-blue-500'
        };
      case 'green':
        return {
          button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
          header: 'bg-gradient-to-r from-emerald-600 to-teal-600',
          userBubble: 'bg-gradient-to-r from-emerald-600 to-teal-600',
          botBubble: 'bg-white border border-gray-200',
          loadingDot: 'bg-emerald-500',
          input: 'focus:ring-emerald-500 focus:border-emerald-500'
        };
      case 'pink':
        return {
          button: 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-500',
          header: 'bg-gradient-to-r from-pink-600 to-rose-600',
          userBubble: 'bg-gradient-to-r from-pink-600 to-rose-600',
          botBubble: 'bg-white border border-gray-200',
          loadingDot: 'bg-pink-500',
          input: 'focus:ring-pink-500 focus:border-pink-500'
        };
      default:
        return {
          button: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
          header: 'bg-gradient-to-r from-indigo-600 to-purple-600',
          userBubble: 'bg-gradient-to-r from-indigo-600 to-purple-600',
          botBubble: 'bg-white border border-gray-200',
          loadingDot: 'bg-indigo-500',
          input: 'focus:ring-indigo-500 focus:border-indigo-500'
        };
    }
  };
  
  const themeClasses = getThemeClasses();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col">
      {!isOpen ? (
        <button 
          className={`self-end ${themeClasses.button} text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${animation ? 'scale-0' : 'scale-100'}`}
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className={`w-96 sm:w-[450px] h-[36rem] bg-gray-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 transform ${animation ? 'scale-0' : 'scale-100'}`}>
          {/* Chat Header */}
          <div className={`px-6 py-4 ${themeClasses.header} text-white flex justify-between items-center`}>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-xl">
                  {user?.tenant?.tenantName 
                    ? `${user.tenant.tenantName} AI` 
                    : 'Screenera AI'}
                </h3>
                <p className="text-xs text-gray-100 opacity-90">
                  {userRole === 'general' 
                    ? 'Your assistant' 
                    : `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} assistant`}
                </p>
              </div>
            </div>
            <button 
              className="text-white hover:text-gray-200 focus:outline-none rounded-full hover:bg-white/10 p-2 transition-colors" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-6 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${index === 0 ? 'animate-fadeIn' : ''}`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex-shrink-0 mr-3 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-${theme === 'purple' ? 'purple' : theme === 'blue' ? 'blue' : theme === 'green' ? 'emerald' : 'pink'}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                )}
                <div 
                  className={`px-5 py-4 rounded-xl max-w-[85%] ${
                    message.type === 'user' 
                      ? `${themeClasses.userBubble} text-white rounded-tr-none shadow-md` 
                      : `${themeClasses.botBubble} text-gray-800 rounded-tl-none shadow-sm`
                  } animate-messageSlide`}
                >
                  {message.type === 'bot' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex-shrink-0 ml-3 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4 animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex-shrink-0 mr-3 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-${theme === 'purple' ? 'purple' : theme === 'blue' ? 'blue' : theme === 'green' ? 'emerald' : 'pink'}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className={`${themeClasses.botBubble} px-5 py-3 rounded-xl rounded-tl-none shadow-sm flex items-center`}>
                  <div className="flex space-x-2">
                    <div className={`w-2 h-2 ${themeClasses.loadingDot} rounded-full animate-bounce`}></div>
                    <div className={`w-2 h-2 ${themeClasses.loadingDot} rounded-full animate-bounce delay-75`}></div>
                    <div className={`w-2 h-2 ${themeClasses.loadingDot} rounded-full animate-bounce delay-150`}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form 
            className="border-t border-gray-200 p-4 bg-white"
            onSubmit={handleSubmit}
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                className={`flex-1 border border-gray-300 rounded-full py-3 pl-5 pr-16 text-gray-700 text-base ${themeClasses.input} focus:outline-none focus:ring-2 focus:border-transparent shadow-sm`}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className={`absolute right-2 ${themeClasses.button} text-white p-2 rounded-full hover:bg-opacity-90 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isLoading || !inputValue.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Powered by Screenera AI
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotComponent;