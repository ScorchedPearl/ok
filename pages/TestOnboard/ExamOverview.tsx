"use client";

import React, { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Timer,
  Brain,
  Trophy,
  Clock,
  Info,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { AssessmentContext } from "../../context/AssessmentContext"; // adjust the path as needed

export default function ExamOverview() {
  const { testName, librariesinfo, totalLibrary } = useContext(AssessmentContext);

  // Calculate the total duration from all libraries
  const totalDuration = useMemo(() => {
    if (!librariesinfo || librariesinfo.length === 0) return 0;
    return librariesinfo.reduce((sum, library) => sum + (library.timeRequired || 0), 0);
  }, [librariesinfo]);

  // The number of sections is the number of libraries
  const sectionCount = librariesinfo?.length || 0;

  console.log("testName", testName);
  console.log("totalLibrary", totalLibrary);
  console.log("librariesinfo", librariesinfo);
  console.log("Calculated duration:", totalDuration);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-white">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-[#2E2883]">Screenera</h1>
              <div className="h-6 w-px bg-gray-200" />
              <span className="text-gray-600">{testName}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] rounded-full">
                <span className="text-sm font-medium text-[#2E2883]">
                  Step 1 of 3
                </span>
                <div className="w-24 h-1.5 bg-[#2E2883]/10 rounded-full">
                  <motion.div
                    className="h-full bg-[#2E2883] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "33%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto py-12 space-y-12">
        {/* Welcome Section */}
        <Card className="border-none shadow-sm bg-[#2E2883]">
          <CardContent className="p-8">
            <div className="max-w-3xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FFFFF]/5">
                  <Trophy className="w-5 h-5 text-[#FFFFF]" />
                </div>
                <h2 className="text-2xl font-semibold text-[#FFFFF]">
                  Welcome, {testName || "Candidate"}
                </h2>
              </div>

              <div className="space-y-6 pl-12">
                <div>
                  <h3 className="text-lg font-medium text-[#FFFFF] mb-2">
                    {testName}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Thank you for taking this step in your application process.
                    This comprehensive assessment has been designed to evaluate
                    your technical and professional capabilities.
                  </p>
                </div>

                <div className="flex items-center gap-6 p-4 bg-[#FFFFF]/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#FFFFF]" />
                    <div>
                      <div className="text-sm font-medium text-[#FFFFF]">
                        Duration
                      </div>
                      <div className="text-gray-300">{totalDuration} Minutes</div>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-[#FFFFF]" />
                    <div>
                      <div className="text-sm font-medium text-[#FFFFF]">
                        Sections
                      </div>
                      <div className="text-gray-300">{sectionCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Structure Section - Mapped from libraries */}
        {librariesinfo && librariesinfo.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-[#2E2883] rounded-full" />
              <h2 className="text-xl font-semibold text-[#2E2883]">
                Assessment Structure
              </h2>
            </div>

            <div className="grid gap-4">
              {librariesinfo.map((library, index) => (
                <Card
                  key={library.libraryId}
                  className="border bg-gray-50 border-gray-100 hover:border-[#2E2883]/20 transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-6">
                      {/* Display the sequential number (index + 1) */}
                      <div className="w-12 h-12 rounded-lg bg-[#F8FAFC] flex items-center justify-center">
                        <span className="text-xl font-semibold text-[#2E2883]">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-[#2E2883]">
                              {library.libraryName}
                            </h3>
                            {library.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {library.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-[#F8FAFC]">
                              <Clock className="w-4 h-4 mr-2 text-[#2E2883]" />
                              <span className="text-gray-600">
                                {library.timeRequired} mins
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Guidelines Section */}
        <section className="grid md:grid-cols-2 gap-8">
          <Card className="border-none bg-[#D9E7FF]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-[#2E2883]" />
                <CardTitle className="text-[#2E2883]">
                  Assessment Guidelines
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2E2883] mt-0.5" />
                  <span>
                    Complete the assessment in one session for best results
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2E2883] mt-0.5" />
                  <span>Each section is independently timed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2E2883] mt-0.5" />
                  <span>Basic calculators and notepads are permitted</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-none bg-[#D9E7FF]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-[#2E2883]" />
                <CardTitle className="text-[#2E2883]">
                  Technical requirements for your assessment:
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2E2883] mt-0.5" />
                  <span>
                    Complete the assessment in one session for best results
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2E2883] mt-0.5" />
                  <span>Each section is independently timed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2E2883] mt-0.5" />
                  <span>Basic calculators and notepads are permitted</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-end pt-6">
          <Link to="/assessment/setup">
            <Button
              size="lg"
              className="bg-[#2E2883] hover:bg-[#2E2883]/90 text-white px-8 py-6 text-lg"
            >
              Begin Assessment
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}