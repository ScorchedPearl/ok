"use client";

import React, { memo, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronRight, ChevronLeft, Check, X } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BackgroundBeams } from "@/components/ui/background-beams";

// Dynamic config
import formConfig from "./medical.json";

// Lazy-load icons from lucide-react
const DynamicIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const IconComponent = React.lazy(() =>
    import("lucide-react").then((module) => ({
      default: module[iconName] as React.ComponentType<any>,
    }))
  );
  return (
    <Suspense fallback={<span className={className} />}>
      <IconComponent className={className} />
    </Suspense>
  );
};

// Zod schema
const formSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters."),
    lastName: z.string().min(2, "Last name must be at least 2 characters."),
    email: z.string().email("Must be a valid email address."),
    phone: z.string().min(10, "Phone number must be at least 10 digits."),
    address: z.string().min(1, "Address is required."),
  })
  .and(z.record(z.string(), z.any()));

// Animation variants
const stepAnimation = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

// Step content wrapper
const StepContent = memo(({ stepConfig, formControl }: { stepConfig: any; formControl: any }) => (
  <motion.div
    key={`step-${stepConfig.id}`}
    variants={stepAnimation}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    {stepConfig.fields.map((field: any) => (
      <DynamicField key={field.name} field={field} formControl={formControl} />
    ))}
  </motion.div>
));

// Dynamic field renderer
const DynamicField = memo(({ field, formControl }: { field: any; formControl: any }) => {
  const Icon = field.icon ? (
    <DynamicIcon iconName={field.icon} className="w-4 h-4 inline mr-2" />
  ) : null;

  switch (field.type) {
    case "text":
    case "email":
    case "url":
      return (
        <FormField
          control={formControl}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-gray-700 font-medium">
                {Icon}
                {field.label}
              </FormLabel>
              <FormControl>
                <Input
                  {...formField}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formField.value ?? ""}
                  className="bg-white text-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600"
                />
              </FormControl>
              {field.description && (
                <FormDescription>{field.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "select":
      return (
        <FormField
          control={formControl}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-gray-700 font-medium">
                {Icon}
                {field.label}
              </FormLabel>
              <Select
                onValueChange={formField.onChange}
                value={formField.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger className="bg-white text-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {field.options.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "file":
      return (
        <FormField
          control={formControl}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-gray-700 font-medium">
                {Icon}
                {field.label}
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept={field.accept ? field.accept.join(",") : undefined}
                  className="bg-white rounded-md shadow-sm"
                  onChange={(e) => formField.onChange(e.target.files?.[0])}
                />
              </FormControl>
              {field.description && (
                <FormDescription>{field.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    default:
      return null;
  }
});

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = formConfig.steps.length;
  const [progress, setProgress] = useState<number>((1 / totalSteps) * 100);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const watchedValues = form.watch();

  // Check if step is completed
  const isStepCompleted = (stepId: number): boolean => {
    const stepData = formConfig.steps.find((step) => step.id === stepId);
    if (!stepData) return false;
    return stepData.fields.every((field) => {
      const val = watchedValues[field.name];
      return typeof val === "string" ? val.trim() !== "" : !!val;
    });
  };

  // Handle step changes
  const handleStepChange = async (newStep: number) => {
    const currentStepFields =
      formConfig.steps.find((step) => step.id === currentStep)?.fields.map((f) => f.name) || [];
    if (newStep > currentStep) {
      const valid = await form.trigger(currentStepFields as any);
      if (!valid) return;
    }
    setCurrentStep(newStep);
    setProgress((newStep / totalSteps) * 100);
  };

  // Next or submit
  const handleNext = async () => {
    if (currentStep < totalSteps) {
      handleStepChange(currentStep + 1);
    } else {
      const currentStepFields =
        formConfig.steps.find((step) => step.id === currentStep)?.fields.map((f) => f.name) || [];
      const valid = await form.trigger(currentStepFields as any);
      if (!valid) return;
      form.handleSubmit((values) => {
        console.log("Final Submission", values);
        alert("Form Submitted Successfully!");
      })();
    }
  };

  const currentStepConfig = formConfig.steps.find((step) => step.id === currentStep);

  return (
    <div className="relative min-h-screen bg-gray-50 px-20">
      {/* Background Beams behind everything */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <BackgroundBeams />
      </div>

      {/* Banner Section */}
      <div className="bg-[#2E2883] px-10 pt-4 pb-4 my-6 rounded-xl text-white relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-xl md:text-2xl font-bold mb-3">
              {formConfig.banner.jobTitle}
            </h1>
            <p className="text-sm md:text-md opacity-90 mb-4">
              {formConfig.banner.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {formConfig.banner.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/4"
          >
            <Card className="shadow-md border-none">
              <CardHeader className="p-6 bg-gray-100 rounded-t-md">
                <CardTitle className="text-indigo-700 font-semibold text-lg">
                  Application Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  {formConfig.steps.map((step) => (
                    <li
                      key={step.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none"
                    >
                      <button
                        onClick={() => handleStepChange(step.id)}
                        className="flex-1 text-left hover:text-indigo-600 font-medium transition-colors"
                      >
                        {step.title}
                      </button>
                      <div>
                        {isStepCompleted(step.id) ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-3/4"
          >
            <Card className="shadow-md border-none">
              <CardHeader className="p-6 bg-gray-100 rounded-t-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl text-indigo-700 font-semibold">
                      {currentStepConfig?.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Please fill in the required information below.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>
                      Step {currentStep} of {totalSteps}
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="mt-4 h-2 rounded-full" />
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <AnimatePresence mode="wait">
                      {currentStepConfig && (
                        <StepContent
                          stepConfig={currentStepConfig}
                          formControl={form.control}
                        />
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between pt-6 border-t border-gray-100">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleStepChange(currentStep - 1)}
                          className="flex items-center gap-2 text-gray-700 hover:text-indigo-700"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          Previous
                        </Button>
                      )}
                      <Button
                        type="button"
                        onClick={handleNext}
                        className={`ml-auto bg-indigo-600 hover:bg-indigo-700 text-white transition-colors ${
                          currentStep === totalSteps ? "w-full md:w-auto" : ""
                        }`}
                      >
                        {currentStep === totalSteps ? (
                          "Submit Application"
                        ) : (
                          <>
                            Next Step
                            <ChevronRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
