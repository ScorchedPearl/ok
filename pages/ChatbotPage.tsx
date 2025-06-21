// ChatbotComponent.tsx
import React, { useState, useEffect, useRef } from 'react';

// Define types for the component
type UserRole = 'general' | 'candidate' | 'tenant' | 'interviewer';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface ChatResponse {
  response: string;
  session_id: string;
  error?: string;
}

const ChatbotComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user role and master prompt from localStorage or your authentication system
  const userRole = (localStorage.getItem('userRole') as UserRole) || 'general';
  const masterPrompt = useRef<string>('');

  // Create session ID when component mounts
  useEffect(() => {
    // Generate a random session ID
    const newSessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    
    // Initialize with a welcome message based on role
    const welcomeMessage = getWelcomeMessage(userRole);
    setMessages([{ type: 'bot', content: welcomeMessage }]);
    
    // Fetch master prompt based on role and user info
    fetchMasterPrompt();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMasterPrompt = async (): Promise<void> => {
    // Simulate fetching master prompt from your microservice
    // In a real app, replace with actual API call to your microservice
    try {
      // Example: const response = await fetch('/api/get-master-prompt?role=' + userRole);
      // const data = await response.json();
      // masterPrompt.current = data.masterPrompt;
      
      // For demo, we'll use mock data based on role
      if (userRole === 'candidate') {
        masterPrompt.current = "You've applied for Software Engineer and Marketing Manager positions. Your interview is scheduled for next Tuesday. Your resume highlights 5 years of experience in web development.";
      } else if (userRole === 'tenant') {
        masterPrompt.current = "You manage 3 job listings. You have 15 candidate applications pending review. Your subscription expires in 14 days.";
      } else if (userRole === 'interviewer') {
        masterPrompt.current = "You have 5 interviews scheduled today. Next interview is with John Doe for Software Engineer position at 2:00 PM.";
      } else {
        masterPrompt.current = "Welcome to our job screening platform. How can I help you today?";
      }
    } catch (error) {
      console.error('Error fetching master prompt:', error);
      masterPrompt.current = "How can I assist you today?";
    }
  };

  const getWelcomeMessage = (role: UserRole): string => {
    switch (role) {
      case 'candidate':
        return "Hello candidate! I'm here to help with your job applications and interview preparation.";
      case 'tenant':
        return "Welcome back! I can assist with managing your job listings and candidates.";
      case 'interviewer':
        return "Hello interviewer! I can help you prepare for upcoming interviews and manage your schedule.";
      default:
        return "Hello! How can I assist you with our job screening platform today?";
    }
  };

  const toggleChat = (): void => {
    setIsOpen(!isOpen);
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
      // Call your Flask API
      const response = await fetch('http://localhost:5611/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
          role: userRole,
          master_prompt: masterPrompt.current
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

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col">
      {!isOpen ? (
        <button 
          className="self-end bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-indigo-600 text-white flex justify-between items-center">
            <h3 className="font-medium">
              {userRole === 'general' ? 'Chat Support' : `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Support`}
            </h3>
            <button 
              className="text-white hover:text-gray-200 focus:outline-none" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    message.type === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none max-w-xs flex">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form 
            className="border-t border-gray-200 p-2 flex"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !inputValue.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotComponent;