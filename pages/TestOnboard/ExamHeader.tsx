"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertCircle } from "lucide-react";
import { AssessmentContext } from "@/context/AssessmentContext";
import { Toaster } from "react-hot-toast";

// Example total test duration (in seconds).
const TOTAL_TEST_TIME = 1680;

export default function ExamHeader() {
  const { testName, currentStat, endTest } = useContext(AssessmentContext);

  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TEST_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentStat === "IN_PROGRESS") {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current!);
      }
    };
  }, [currentStat, endTest]);

  useEffect(() => {
    if (currentStat !== "IN_PROGRESS") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [currentStat]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    ((TOTAL_TEST_TIME - timeRemaining) / TOTAL_TEST_TIME) * 100;

  const handleEndTestNow = () => {
    endTest();
  };

  return (
    <>
      <Toaster />

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Test Name */}
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-[#2E2883]">Screenera</h1>
              <div className="h-6 w-px bg-gray-200" />
              <span className="text-gray-600">{testName}</span>
            </div>

            {/* Right side: Timer + End Test */}
            {currentStat === "IN_PROGRESS" && (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  {/* Proctoring + Time Remaining Row */}
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-4">
                      {/* Proctoring Status */}
                      <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                        <span>Proctoring is live</span>
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75 animate-ping"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                      </div>

                      {/* Time Remaining Label */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#2E2883]" />
                        <span className="text-sm font-medium text-gray-600">
                          Time Remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timer + Alert */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-semibold ${
                        timeRemaining < 10 ? "text-red-600" : "text-[#2E2883]"
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </span>
                    {timeRemaining < 10 && (
                      <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-[#D9E7FF] rounded-full h-4 w-[200px] mt-2">
                    <div className="relative h-full w-full">
                      <motion.div
                        className="absolute inset-0 bg-[#2E2883] rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                {/* End Test Button */}
                <button
                  onClick={handleEndTestNow}
                  className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium"
                >
                  End Test
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
