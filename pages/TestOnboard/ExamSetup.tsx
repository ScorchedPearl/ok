"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  AlertCircle,
  ChevronRight,
  Settings,
  RefreshCw,
  Lock,
  Monitor,
  ShieldCheck,
  Info,
  CheckCircle2,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AssessmentContext } from "@/context/AssessmentContext";
import FaceDetectionService from "@/services/FaceDetectionService";
import { toast } from "react-hot-toast";

interface TroubleshootingItem {
  icon: any;
  title: string;
  description: string;
}

const troubleshootingSteps: TroubleshootingItem[] = [
  {
    icon: Lock,
    title: "Browser Permissions",
    description:
      "Ensure you have granted permission for your browser to access your camera.",
  },
  {
    icon: Monitor,
    title: "Browser Compatibility",
    description:
      "Use a supported browser like Chrome, Firefox, or Edge for optimal compatibility.",
  },
  {
    icon: Settings,
    title: "Device Selection",
    description:
      "If multiple cameras are available, verify the correct device is selected.",
  },
  {
    icon: Info,
    title: "Private Mode",
    description:
      "Try launching the assessment in incognito mode or a private window.",
  },
  {
    icon: CheckCircle2,
    title: "System Updates",
    description: "Ensure your camera drivers and web browser are up to date.",
  },
];

export default function CameraSetup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isEnrollingFace, setIsEnrollingFace] = useState(false);
  const [isFaceEnrolled, setIsFaceEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { testName } = useContext(AssessmentContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize camera devices and face detection models on component mount
    initializeCameras();
    initializeFaceDetection();

    // Cleanup function to stop camera stream when component unmounts
    return () => {
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      startCameraStream();
    }
  }, [selectedDevice]);

  const initializeFaceDetection = async () => {
    try {
      setIsLoading(true);
      // Load face detection models
      await FaceDetectionService.loadModels();
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to initialize face detection:", err);
      setIsLoading(false);
      setError("Failed to initialize face detection. Please refresh the page.");
    }
  };

  const initializeCameras = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stopCameraStream(stream);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      } else {
        setError("No camera devices found");
      }
    } catch (err) {
      setError("Failed to access camera devices. Please check permissions.");
      console.error("Camera initialization error:", err);
    }
  };

  const startCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDevice },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError("");
      }
    } catch (err) {
      setError("Failed to start camera stream");
      setIsCameraActive(false);
      console.error("Camera stream error:", err);
    }
  };

  const stopCameraStream = (stream?: MediaStream) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    } else if (videoRef.current?.srcObject) {
      const currentStream = videoRef.current.srcObject as MediaStream;
      currentStream.getTracks().forEach((track) => track.stop());
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("camera-stop-requested"));
  };

  const refreshCameras = async () => {
    stopCameraStream();
    await initializeCameras();
  };

  const enrollFace = async () => {
    if (!videoRef.current || !isCameraActive) {
      toast.error("Camera must be active to enroll your face");
      return;
    }

    setIsEnrollingFace(true);
    setIsLoading(true);

    try {
      // Wait a moment to ensure the video is fully loaded
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = await FaceDetectionService.enrollFace(videoRef.current);

      if (result.success) {
        setIsFaceEnrolled(true);
        toast.success("Face enrolled successfully!");

        // Take a snapshot for visual confirmation
        if (canvasRef.current && videoRef.current) {
          const context = canvasRef.current.getContext("2d");
          if (context) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
          }
        }
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Face enrollment error:", err);
      toast.error("Failed to enroll face. Please try again.");
    } finally {
      setIsEnrollingFace(false);
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!isFaceEnrolled) {
      toast.error("Please enroll your face before continuing");
      return;
    }

    navigate("/assessment/intro");
  };

  return (
    <div className="min-h-screen bg-white">
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
                  Step 2 of 3
                </span>
                <div className="w-24 h-1.5 bg-[#2E2883]/10 rounded-full">
                  <motion.div
                    className="h-full bg-[#2E2883] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "66%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="container max-w-6xl mx-auto py-12 px-4">
        {/* Header Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-[#2E2883] mb-4">
              Camera Setup & Face Enrollment
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              To ensure assessment integrity and maintain a fair environment for
              all participants, we require camera access and face verification
              during the assessment. Please verify your camera is working
              correctly and enroll your face for identity verification.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Camera Preview Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#e8e7fc] border-none shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-[#2E2883]" />
                      <span className="text-[#2E2883] font-medium">
                        Camera Selection
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-[#2E2883] hover:bg-[#2E2883]/10"
                      onClick={refreshCameras}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  <Select
                    value={selectedDevice}
                    onValueChange={(value) => {
                      stopCameraStream();
                      setSelectedDevice(value);
                      setIsFaceEnrolled(false); // Reset face enrollment when camera changes
                    }}
                  >
                    <SelectTrigger className="bg-white text-primary border-[#2E2883]/20">
                      <SelectValue placeholder="Select a camera device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem
                          key={device.deviceId}
                          value={device.deviceId}
                          className="cursor-pointer"
                        >
                          {device.label ||
                            `Camera ${devices.indexOf(device) + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl overflow-hidden bg-white shadow-inner mb-4 aspect-video relative">
                  {error ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-50 p-8">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600">{error}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto mb-2"></div>
                            <p>
                              {isEnrollingFace
                                ? "Enrolling face..."
                                : "Loading face detection..."}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {isFaceEnrolled ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Face enrolled successfully
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full mb-4 bg-[#2E2883] hover:bg-[#2E2883]/90"
                    onClick={enrollFace}
                    disabled={!isCameraActive || isLoading}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Enroll Your Face
                  </Button>
                )}

                <div className="bg-[#2E2883]/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#2E2883]/70 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      {isCameraActive
                        ? "Camera is active"
                        : "Camera is inactive"}
                    </p>
                    {selectedDevice && (
                      <span className="text-xs text-[#2E2883]/50">
                        ID: {selectedDevice.slice(0, 8)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hidden canvas for taking snapshot */}
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Troubleshooting Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className=" bg-[#D9E7FF] border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-[#2E2883]" />
                  <h2 className="text-xl font-semibold text-[#2E2883]">
                    Troubleshooting Guide
                  </h2>
                </div>

                <div className="space-y-6">
                  {troubleshootingSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#2E2883]/10 flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-5 h-5 text-[#2E2883]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#2E2883] mb-1">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div
          className="flex justify-end mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            size="lg"
            className="bg-[#2E2883] hover:bg-[#2E2883]/90 text-white px-8 py-6 text-lg"
            disabled={!isCameraActive || !isFaceEnrolled}
            onClick={handleContinue}
          >
            Continue
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
