
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { User } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ChevronLeft, Calendar, Clock, Send } from "lucide-react";
import { Candidate } from "../types/ScheduleCallTypes";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CallDetailsProps {
  candidate: Candidate | null;
  questions: Array<{ id: string; text: string }>;
  onSubmit: (dateTime: { date: Date; time: string }) => void;
  onBack: () => void;
  isSubmitting: boolean;
  jobId: string | undefined;
}

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, { message: "Please select a time" }),
  notes: z.string().optional(),
  durationMinutes: z.number().min(15).default(30),
});

export default function CallDetails({
  candidate,
  questions,
  onSubmit,
  onBack,
  isSubmitting,
  jobId,
}: CallDetailsProps) {
  const { user,token } = useAuth();
  const createdBy = user?.fullName || user?.email || "system";
  const tenantId = user?.tenant?.tenantId;

  // console.log("Tenant ID:", tenantId);
  // console.log("User:", user);
  console.log("Candidate:", candidate);
  // console.log("Job ID:", jobId);
  // console.log("Questions:", questions);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      time: format(new Date(), "hh:mm a"), // Default to current time
      notes: "",
      durationMinutes: 30,
    },
  });

  // Watch form values for real-time updates
  const watchedDate = form.watch("date");
  const watchedTime = form.watch("time");
  const watchedDuration = form.watch("durationMinutes");

  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";


  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Parse time from the input field
      const timeParts = values.time.match(/(\d+):(\d+)\s*(am|pm|AM|PM)/i);
      
      if (!timeParts) {
        toast.error("Invalid time format");
        return;
      }
      
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const isPM = timeParts[3].toLowerCase() === 'pm';
      
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
      
      // Create a new Date object with the combined date and time
      const scheduledDate = new Date(values.date);
      scheduledDate.setHours(hours, minutes, 0, 0);

      // Create request payload with the new structure
      const callRequestDto = {
        remark: values.notes,
        tenantId: tenantId,
        scheduledAt: scheduledDate.toISOString(), // ISO format for backend
        durationMinutes: values.durationMinutes,
        status: "PENDING",
        jobId: jobId,
        candidateId: candidate?.id,
        createdBy: createdBy,
        mobileNumber: candidate?.phoneNumber, // Add mobile number from candidate
        questions: questions.map(q => ({ 
          questionId: q.id,
          questionText: q.text 
        })), 
      };

      console.log("Call Request DTO:", callRequestDto);

      // Call the API
      const response = await fetch(`${interviewServiceUrl}/api/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": tenantId?.toString() || "",
          "Authorization": token ? `Bearer ${token.access_token}` : ''
        },
        body: JSON.stringify(callRequestDto),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule call");
      }

      toast.success("Call scheduled successfully");

      // Call the original onSubmit to handle navigation
      onSubmit({ date: values.date, time: values.time });
    } catch (error) {
      console.error("Error scheduling call:", error);
      toast.error("Failed to schedule call");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Call Details Section */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  Call Details
                </h3>

                {/* Date Picker */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Date</FormLabel>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-indigo-600" />
                        <DatePicker
                          selected={field.value}
                          onChange={(date: Date | null) => field.onChange(date || new Date())}
                          dateFormat="MMMM d, yyyy"
                          minDate={new Date()}
                          className="w-full pl-10 py-2 bg-white border-2 border-gray-300 rounded-md text-gray-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                {/* Time Picker - replaced with flexible time input */}
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Time</FormLabel>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-indigo-600" />
                        <DatePicker
                          selected={(() => {
                            try {
                              // Try to parse the current time string into a Date object
                              const date = new Date();
                              const timeParts = field.value.match(/(\d+):(\d+)\s*(am|pm|AM|PM)/i);
                              if (timeParts) {
                                let hours = parseInt(timeParts[1]);
                                const minutes = parseInt(timeParts[2]);
                                const isPM = timeParts[3].toLowerCase() === 'pm';
                                
                                if (isPM && hours !== 12) {
                                  hours += 12;
                                } else if (!isPM && hours === 12) {
                                  hours = 0;
                                }
                                
                                date.setHours(hours, minutes, 0, 0);
                                return date;
                              }
                              return date;
                            } catch (e) {
                              return new Date();
                            }
                          })()}
                          onChange={(date: Date | null) => {
                            if (date) {
                              // Format time as "hh:mm AM/PM"
                              field.onChange(format(date, "hh:mm aa"));
                            }
                          }}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full pl-10 py-2 bg-white border-2 border-gray-300 rounded-md text-gray-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                {/* Duration Picker */}
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Duration</FormLabel>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-indigo-600" />
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="pl-10 bg-white border-2 border-gray-300 text-gray-800 font-medium hover:border-indigo-300 focus:border-indigo-500">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[15, 30, 45, 60, 90, 120].map((duration) => (
                              <SelectItem key={duration} value={duration.toString()}>
                                {duration} minutes
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes for this call..."
                          className="resize-none bg-white border-2 border-gray-300 text-gray-800 focus:border-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="bg-white hover:bg-gray-100 text-gray-800 border-gray-300 border-2"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right side: Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Call Summary</h3>
            <Card className="bg-gray-50 shadow-sm border-gray-200">
              <div className="p-4">
                {/* Scheduler Info */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Scheduler</h4>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">{createdBy}</p>
                        {tenantId && <p className="text-xs text-gray-500">Tenant ID: {tenantId}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Candidate</h4>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                    <p className="font-medium text-gray-800">{candidate?.fullName || "N/A"}</p>
                    <p className="text-sm text-gray-600">{candidate?.email || "N/A"}</p>
                    {candidate?.phoneNumber && (
                      <p className="text-sm text-gray-600">{candidate.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Questions */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">Selected Questions</h4>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      {questions.length}
                    </Badge>
                  </div>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm max-h-[150px] overflow-y-auto">
                    {questions.length > 0 ? (
                      <ol className="list-decimal pl-5 space-y-2">
                        {questions.map((question) => (
                          <li key={question.id} className="text-sm text-gray-800">
                            {question.text}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">No questions selected</p>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Date & Time</h4>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center text-sm mb-2">
                      <Calendar className="mr-2 h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium text-gray-800">
                        {watchedDate ? format(watchedDate, "MMMM d, yyyy") : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm mb-2">
                      <Clock className="mr-2 h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium text-gray-800">{watchedTime || "Not set"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium text-gray-800">
                        Duration: {watchedDuration} minutes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Job ID */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Job ID</h4>
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                    <p className="font-medium text-gray-800">{jobId || "N/A"}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Schedule Call Button */}
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center border-2 border-indigo-800"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Call"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}