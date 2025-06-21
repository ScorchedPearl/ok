import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Clock, Calendar, Video, MapPin, CheckCircle, XCircle, AlertCircle, Bot } from "lucide-react"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

const Toast = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: { title: string; description: string }
  type: 'success' | 'error'
  onClose: () => void 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        flex items-start gap-3 w-auto max-w-md
        bg-white shadow-lg rounded-lg overflow-hidden
        border-l-4 p-4
        ${type === 'success' ? 'border-l-emerald-500' : 'border-l-red-500'}
      `}
    >
      <div className={`
        flex-shrink-0 p-0.5 rounded-full
        ${type === 'success' ? 'text-emerald-500' : 'text-red-500'}
      `}>
        {type === 'success' ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <AlertCircle className="w-6 h-6" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={`
          text-sm font-semibold mb-1
          ${type === 'success' ? 'text-emerald-800' : 'text-red-800'}
        `}>
          {message.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {message.description}
        </p>
      </div>

      <button 
        onClick={onClose}
        className="flex-shrink-0 ml-4 mt-0.5 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

// Toast Container Component
const ToastContainer = ({ 
  toasts, 
  removeToast 
}: { 
  toasts: Array<{ id: string; type: 'success' | 'error'; message: { title: string; description: string } }>
  removeToast: (id: string) => void 
}) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Your existing interfaces remain the same
interface ValidationRules {
  required?: boolean
  minLength?: number
}


interface ValidationRules {
  required?: boolean
  minLength?: number
}

interface Field {
  name: string
  label: string
  icon?: string
  type: 'text' | 'textarea' | 'rating' | 'dropdown' | 'multiselect'
  placeholder?: string
  validation?: ValidationRules
  options?: string[] // Add support for dropdown options
}
interface TemplateData {
  id: string | number
  name: string
  fields: Field[]
}

interface ParsedTemplate extends TemplateData {
  id: number
}

interface FeedbackTemplatesData {
  feedbackTemplates: TemplateData[]
}

interface FeedbackTemplate {
  id: number
  template: string
}

interface Interview {
  interviewId: number
  candidateEmail: string
  position: string
  mode: string
  interviewDate: string
  status: string
  feedbackTemplates: FeedbackTemplate[]
}

interface CreateFeedbackDto {
  interviewId: number;
  interviewerId: number;
  recommendation?: 'PROCEED' | 'HOLD' | 'REJECT';
  feedbackData: Record<string, any>;
}

const RatingSlider = ({ 
  value, 
  onChange, 
  validation 
}: { 
  value: number
  onChange: (value: number) => void
  validation?: ValidationRules
}) => {
  // Component implementation remains the same
  return (
    <div className="w-48 space-y-2">
      <Slider
        defaultValue={[value]}
        max={10}
        min={1}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
        className="w-full"
      />
      <div className="text-center font-medium text-gray-700">
        {value}/10 {validation?.required && "*"}
      </div>
    </div>
  )
}

const FeedbackField = ({ 
  field, 
  value, 
  onChange 
}: { 
  field: Field
  value: any
  onChange: (value: any) => void 
}) => {
  // Get the appropriate icon component based on the icon name
  const getIconComponent = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'check':
        return <CheckCircle className="w-4 h-4 text-gray-600" />
      case 'robot':
        return <Bot className="w-4 h-4 text-gray-600" />
      // Add more icon cases as needed
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex-1 mr-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2">
                {field.icon && getIconComponent(field.icon)}
                <h3 className="font-medium text-gray-900 text-left">
                  {field.label} {field.validation?.required && "*"}
                </h3>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">{field.placeholder || field.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {field.type === "rating" ? (
        <RatingSlider
          value={value || 5}
          onChange={onChange}
          validation={field.validation}
        />
      ) : field.type === "textarea" ? (
        <div className="w-2/3">
          <Textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="min-h-[100px] bg-white/90"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.validation?.minLength && (
            <p className="text-xs text-gray-500 mt-1">
              Minimum {field.validation.minLength} characters required
            </p>
          )}
        </div>
      ) : field.type === "dropdown" ? (
        <div className="w-2/3">
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-[#2E2883] focus:border-transparent
                     bg-white text-gray-900 text-sm"
          >
            <option value="" disabled>
              {field.placeholder || "Select an option"}
            </option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {field.validation?.required && !value && (
            <p className="text-xs text-gray-500 mt-1">This field is required</p>
          )}
        </div>
      ) :field.type === "text"? (
        <div className="w-2/3">
          <input
            type="text"
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="w-full px-3 py-2 rounded-md border border-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-[#2E2883] focus:border-transparent
                     bg-white text-gray-900 text-sm"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.validation?.minLength && (
            <p className="text-xs text-gray-500 mt-1">
              Minimum {field.validation.minLength} characters required
            </p>
          )}
        </div>
      ) : field.type === "multiselect" ? (
        <div className="w-2/3">
          {field.options && field.options.length > 0 ? (
            <select
              multiple
              value={value || []}
              onChange={(e) => {
          const options = Array.from(e.target.selectedOptions, option => option.value);
          onChange(options);
              }}
              className="w-full px-3 py-2 rounded-md border border-gray-200
                 focus:outline-none focus:ring-2 focus:ring-[#2E2883] focus:border-transparent
                 bg-white text-gray-900 text-sm"
            >
              {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
              ))}
            </select>
          ) : (
            <Textarea
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
              className="min-h-[100px] bg-white/90"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
          {field.validation?.required && (!value || (Array.isArray(value) && !value.length)) && (
            <p className="text-xs text-gray-500 mt-1">This field is required</p>
          )}
        </div>)
  :null}
  </div>
  )
}


const InterviewFeedbackForm = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedbackData, setFeedbackData] = useState<Record<string, any>>({})
  const [parsedTemplates, setParsedTemplates] = useState<ParsedTemplate[]>([])
  const [recommendation, setRecommendation] = useState<'PROCEED' | 'HOLD' | 'REJECT'>('PROCEED');
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: 'success' | 'error'
    message: { title: string; description: string }
  }>>([])
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [feedbackId, setFeedbackId] = useState<number | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const { user } = useAuth();

  // NEED TO REPLACE WITH ACTUAL INTERVIEWERID FROM AUTH SYSTEM
  const interviewerId = user?.userId; 

  const transformFeedbackData = (): CreateFeedbackDto | any => {
    // Transform the feedback data structure to match the DTO
    const transformedFeedbackData: Record<string, any> = {};
    
    Object.entries(feedbackData).forEach(([templateId, fields]) => {
      Object.entries(fields as Record<string, any>).forEach(([fieldName, value]) => {
        // Create a key that combines template and field name to ensure uniqueness
        const key = `${templateId}_${fieldName}`;
        transformedFeedbackData[key] = value;
      });
    });

    if (isUpdateMode) {
      return {
        recommendation: recommendation,
        feedbackData: transformedFeedbackData
      };
    } else {
      return {
        interviewId: interview?.interviewId || 0,
        interviewerId: interviewerId,
        recommendation: recommendation,
        feedbackData: transformedFeedbackData
      };
    }
  };

  const addToast = (type: 'success' | 'error', title: string, description: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message: { title, description } }])
    setTimeout(() => removeToast(id), 3000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleSubmit = async () => {
    const { isValid, errors } = validateForm()
    
    if (!isValid) {
      addToast('error', 'Validation Error', errors.join('\n'))
      return
    }

    try {
      const feedbackDto = transformFeedbackData()
      let url = `${interviewServiceUrl}/api/feedback`;
      let method = 'POST';

      // If we're updating existing feedback, use PUT endpoint with the feedback ID
      if (isUpdateMode && feedbackId) {
        url = `${interviewServiceUrl}/api/feedback/${feedbackId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackDto)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isUpdateMode ? 'update' : 'submit'} feedback: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`Feedback ${isUpdateMode ? 'updated' : 'submitted'} successfully:`, result)
      
      addToast(
        'success',
        `Feedback ${isUpdateMode ? 'Updated' : 'Submitted'}`,
        `Your feedback has been ${isUpdateMode ? 'updated' : 'submitted'} successfully`
      )
      
      // Now update the interview status to COMPLETED_COMPLETED.
      if (interview && interview.interviewId) {
        const statusUrl = `${interviewServiceUrl}/api/interviews/${interview.interviewId}/status?status=COMPLETED_COMPLETED`;
        const statusResponse = await fetch(statusUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!statusResponse.ok) {
          console.error(`Failed to update interview status: ${statusResponse.statusText}`);
          // Optionally, you can add a toast for this error as well
          addToast(
            'error',
            'Status Update Failed',
            'Feedback submitted but failed to update interview status. Please try again.'
          );
        } else {
          const statusResult = await statusResponse.json();
          console.log('Interview status updated successfully:', statusResult);
        }
      }
    } catch (err) {
      console.error(`Error ${isUpdateMode ? 'updating' : 'submitting'} feedback:`, err)
      addToast(
        'error',
        `${isUpdateMode ? 'Update' : 'Submission'} Failed`,
        `Failed to ${isUpdateMode ? 'update' : 'submit'} feedback. Please try again.`
      )
    }
  }

  const RecommendationSelector = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Final Recommendation
      </label>
      <select
        value={recommendation}
        onChange={(e) => setRecommendation(e.target.value as 'PROCEED' | 'HOLD' | 'REJECT')}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="PROCEED">Proceed</option>
        <option value="HOLD">Hold</option>
        <option value="REJECT">Reject</option>
      </select>
    </div>
  );

  // Fetch existing feedback for the interview
  const fetchExistingFeedback = async () => {
    try {
      const response = await fetch(`${interviewServiceUrl}/api/feedback/interview/${interviewId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No feedback exists yet
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const feedbackList = await response.json();
      
      if (feedbackList && feedbackList.length > 0) {
        // Get the first feedback (assuming one feedback per interview)
        const feedback = feedbackList[0];
        setExistingFeedback(feedback);
        setFeedbackId(feedback.feedbackId);
        setIsUpdateMode(true);
        
        // Set recommendation from existing feedback
        if (feedback.recommendation) {
          setRecommendation(feedback.recommendation);
        }
        
        return feedback;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching existing feedback:', err);
      return null;
    }
  };

  // Function to populate form with existing feedback data
  const populateFormWithExistingData = (feedback: any) => {
    if (!feedback || !feedback.feedbackData) return;
    
    const formattedData: Record<string, any> = {};
    
    // Parse feedback data from the existing feedback
    Object.entries(feedback.feedbackData).forEach(([key, value]) => {
      // Extract templateId and fieldName from the combined key
      const [templateId, fieldName] = key.split('_');
      
      if (!formattedData[templateId]) {
        formattedData[templateId] = {};
      }
      
      formattedData[templateId][fieldName] = value;
    });
    
    setFeedbackData(formattedData);
  };

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        // Use the interviewId from URL params
        if (!interviewId) {
          setError('No interview ID provided');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${interviewServiceUrl}/api/interviews/${interviewId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: Interview = await response.json();
        setInterview(data);
        
        console.log("Fetched interview data:", data);
        
        // Handle the case where feedbackTemplates might be null or empty
        if (!data.feedbackTemplates || data.feedbackTemplates.length === 0) {
          console.warn('No feedback templates found for this interview');
          setParsedTemplates([]);
          setLoading(false);
          return;
        }
        
        // Parse the template strings into objects and handle potential JSON parsing errors
        const templates = data.feedbackTemplates
          .filter((ft): ft is FeedbackTemplate => Boolean(ft && ft.template))
          .map((ft: FeedbackTemplate): ParsedTemplate | null => {
            try {
              const parsed: FeedbackTemplatesData = JSON.parse(ft.template);
              const templateData = parsed.feedbackTemplates[0];
              return {
                id: ft.id,
                name: templateData.name,
                fields: templateData.fields
              };
            } catch (err) {
              console.error(`Error parsing template ${ft.id}:`, err);
              return null;
            }
          })
          .filter((template): template is ParsedTemplate => template !== null && template.fields.length > 0);
        
        console.log("Parsed templates:", templates);
        
        setParsedTemplates(templates);
        
        // After templates are loaded, check for existing feedback
        const existingFeedback = await fetchExistingFeedback();
        if (existingFeedback) {
          populateFormWithExistingData(existingFeedback);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError('Failed to fetch interview data');
        setLoading(false);
      }
    };
    
    fetchInterview();
  }, [interviewId]); 

  const handleFieldChange = (templateId: number, fieldName: string, value: any) => {
    setFeedbackData(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [fieldName]: value
      }
    }))
  }

  const validateForm = () => {
    let isValid = true
    let errors: string[] = []
  
    parsedTemplates.forEach((template: ParsedTemplate) => {
      template.fields.forEach((field: Field) => {
        const value = feedbackData[template.id]?.[field.name]
        
        if (field.validation?.required) {
          if (field.type === "dropdown" && (!value || value === "")) {
            isValid = false
            errors.push(`Please select a ${field.label.toLowerCase()}`)
          } else if (!value) {
            isValid = false
            errors.push(`${field.label} is required`)
          }
        }
  
        if (field.validation?.minLength && 
            typeof value === 'string' && 
            value.length < field.validation.minLength) {
          isValid = false
          errors.push(`${field.label} must be at least ${field.validation.minLength} characters`)
        }
      })
    })
  
    return { isValid, errors }
  }

  if (loading) return <div className="text-center p-8">Loading interview data...</div>
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>
  if (!interview) return <div className="text-center p-8">No interview data found</div>
 
  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white">
      <BackgroundBeams />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="relative z-10 flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4 text-[#2E2883]" />
            <a
              href="/job/interviews/interviews-page"
              className="text-[#2E2883] whitespace-nowrap hover:underline text-md"
            >
              View all interviews
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Interview Details */}
            <div className="lg:col-span-1">
              <TracingBeam>
                <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#2E2883]">
                      Interview Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {interview.candidateEmail}
                      </h2>
                      <p className="text-gray-600 text-md mt-1">
                        Position: {interview.position}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-white py-1">
                          {interview.status}
                        </Badge>
                        {isUpdateMode && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 py-1">
                            Editing existing feedback
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#2E2883]" />
                          <span className="text-gray-600">
                            {new Date(interview.interviewDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#2E2883]" />
                          <span className="text-gray-600">
                            {new Date(interview.interviewDate).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {interview.mode === 'ON_SITE' ? (
                            <MapPin className="w-4 h-4 text-[#2E2883]" />
                          ) : (
                            <Video className="w-4 h-4 text-[#2E2883]" />
                          )}
                          <span className="text-gray-600">{interview.mode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Display feedback submission time if in update mode */}
                    {isUpdateMode && existingFeedback && existingFeedback.submittedAt && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Originally submitted:</span> {new Date(existingFeedback.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Add recommendation selector */}
                    <div className="pt-4">
                      <RecommendationSelector />
                    </div>
                  </CardContent>
                </Card>
              </TracingBeam>
            </div>

            {/* Right Column - Feedback Form */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#2E2883] text-2xl">
                      {isUpdateMode ? 'Update Feedback' : 'Feedback Form'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {parsedTemplates.map((template) => (
                    <div key={template.id} className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-700">{template.name}</h3>
                      {template.fields.map((field) => (
                        <FeedbackField
                          key={field.name}
                          field={field}
                          value={feedbackData[template.id]?.[field.name]}
                          onChange={(value) => handleFieldChange(Number(template.id), field.name, value)}
                        />
                      ))}
                    </div>
                  ))}

                  <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" className="text-gray-700 hover:bg-gray-50">
                      Save Draft
                    </Button>
                    <Button 
                      className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] hover:opacity-90 transition-opacity"
                      onClick={handleSubmit}
                    >
                      {isUpdateMode ? 'Update Feedback' : 'Submit Feedback'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default InterviewFeedbackForm;