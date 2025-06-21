import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Diamond, Rocket, Stars, ArrowRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AssessmentContext } from "../../context/AssessmentContext";
// Import SweetAlert2
import Swal from "sweetalert2";
// Optionally, import SweetAlert2 CSS (if not globally imported)
// import 'sweetalert2/dist/sweetalert2.min.css';

const steps = [
  { number: 1, title: "Register your details", description: "Email and password" },
  { number: 2, title: "Set up your device", description: "Test audio and video" },
  { number: 3, title: "Start the assessment", description: "Show your skills" },
];

const benefits = [
  { icon: Stars, title: "Discover your strengths", description: "Uncover your potential and skills" },
  { icon: Diamond, title: "Stand out", description: "Showcase your skills to employers" },
  { icon: Rocket, title: "Career acceleration", description: "Get hired faster with skills-based hiring" },
];

const companies = [
  { name: "PepsiCo", logo: "/src/assets/image.png" },
  { name: "PayPal", logo: "/src/assets/phonepe.png" },
  { name: "Equifax", logo: "/src/assets/image.png" },
];

export default function AssessmentPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "", // Added password field
  });
  const { startTest } = useContext(AssessmentContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read the token from the URL query parameters (e.g. ?token=your-token)
  const token = searchParams.get("token") || "";
  console.log("token", token);
  console.log("formData.email", formData.email);

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.error("Token not found in URL.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Token not found in URL.",
      });
      return;
    }
    
    // Validation for empty fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill in all required fields to continue.",
      });
      return;
    }
    
    // Call startTest with token, email, and password; if verification fails, verified will be false.
    const verified = await startTest(token, formData.email, formData.password);
    console.log("verified", verified);
    
    if (verified) {
      navigate("/assessment/overview");
    } else {
      console.error("Test verification failed. Not navigating to the next page.");
      Swal.fire({
        icon: "error",
        title: "Authentication Failed",
        text: "The email or password you entered is incorrect. Please check the credentials in your invitation email.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-9xl bg-primary mx-auto px-2 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <Card className="p-8 border-0 shadow-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-white mb-4">
                Online Assessment at Screenera
              </h1>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Thank you for your interest in the Custom testtt position at Screenera.
                We're excited to invite you to demonstrate your skills through a Screenera assessment.
                This is your opportunity to shine and showcase your abilities beyond what's on your resume.
              </p>
              <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-6">Steps to get started</h2>
                <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                  <div className="grid gap-8">
                    {steps.map((step) => (
                      <motion.div
                        key={step.number}
                        className="flex items-start gap-4"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#2E2883] text-white flex items-center justify-center flex-shrink-0 font-bold">
                          {step.number}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#2E2883]">{step.title}</h3>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-8">
                  Why take a skills assessment?
                </h2>
                <div className="grid gap-8">
                  {benefits.map((benefit) => (
                    <motion.div
                      key={benefit.title}
                      className="flex items-start gap-4 group"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:border-[#2E2883] transition-colors">
                        <benefit.icon className="w-6 h-6 text-[#2E2883]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{benefit.title}</h3>
                        <p className="text-gray-200">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </Card>

          {/* Right Column */}
          <Card className="p-8 bg-white border border-gray-100 shadow-lg rounded-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2E2883]">Screenera</h2>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#2E2883] mb-2">Go to assessment</h3>
                <p className="text-gray-600">
                  Enter your personal details and the password from your invitation email to start the assessment.
                </p>
              </div>
              <form className="space-y-6" onSubmit={handleStartTest}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#2E2883]">
                      First Name*
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="border-gray-200 focus:border-[#2E2883] focus:ring-[#2E2883] text-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#2E2883]">
                      Last Name*
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="border-gray-200 focus:border-[#2E2883] focus:ring-[#2E2883] text-primary"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2E2883]">
                    Email*
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border-gray-200 focus:border-[#2E2883] focus:ring-[#2E2883] text-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#2E2883]">
                    Password*
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2E2883]/50" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10 border-gray-200 focus:border-[#2E2883] focus:ring-[#2E2883] text-primary"
                      placeholder="Enter the password from your invitation email"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    The password was sent to you in your assessment invitation email
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      className="mt-1 border-gray-200 text-[#2E2883] focus:ring-[#2E2883]"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm leading-none text-gray-600">
                      I have read and accepted the{" "}
                      <a href="#" className="text-[#2E2883] hover:underline font-medium">
                        privacy policy
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-[#2E2883] hover:underline font-medium">
                        candidate terms
                      </a>
                      *
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="marketing"
                      className="mt-1 border-gray-200 text-[#2E2883] focus:ring-[#2E2883]"
                    />
                    <Label htmlFor="marketing" className="text-sm leading-none text-gray-600">
                      I agree to receive product, marketing, and job communications from Screenera
                    </Label>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2E2883] hover:bg-[#2E2883]/90 text-white transition-colors mt-4"
                >
                  Let's go
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
              {/* Navigation is handled programmatically after backend verification. */}
            </motion.div>
          </Card>
        </div>
      </div>
      <div className="text-xl font-bold text-primary py-4 text-center">Powered by Screenera</div>
    </div>
  );
}