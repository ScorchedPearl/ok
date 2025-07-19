import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { 
  FileText, 
  Edit3, 
  PenTool, 
  Check, 
  X, 
  Download,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Lock,
  Calendar,
  User,
  Building
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOffer, useSignOffer, usePdfDownload } from "@/utils/offerhooks";
import { formatDate } from "@/utils/api";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { toast } from "react-hot-toast";

const SignatureCollectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signatureType, setSignatureType] = useState<'TYPED' | 'DRAWN'>('TYPED');
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToElectronic, setAgreedToElectronic] = useState(false);
  const [step, setStep] = useState<'review' | 'sign' | 'complete'>('review');

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">Authentication Required</h2>
                <p className="text-gray-500 mb-4">Please log in to sign the offer.</p>
                <Button onClick={() => navigate("/login")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userId = user.userId?.toString() || "";
  const userRole = user.role as string || "CANDIDATE";

  // API hooks
  const { data: offer, loading, error, offerContent } = useOffer(
    userId, 
    userRole, 
    id ? parseInt(id) : null
  );
  const { signOffer, loading: signing } = useSignOffer();
  const { downloadOfferPdf, loading: downloading } = usePdfDownload();

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Convert canvas to base64
    const dataURL = canvas.toDataURL();
    setDrawnSignature(dataURL);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSignature("");
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const handleDownloadPdf = async () => {
    if (!offer) return;
    await downloadOfferPdf(userId, userRole, offer.id);
  };

  const validateSignature = (): boolean => {
    if (signatureType === 'TYPED' && !typedSignature.trim()) {
      toast.error("Please enter your typed signature");
      return false;
    }
    
    if (signatureType === 'DRAWN' && !drawnSignature) {
      toast.error("Please draw your signature");
      return false;
    }
    
    if (!agreedToTerms) {
      toast.error("Please agree to the offer terms and conditions");
      return false;
    }
    
    if (!agreedToElectronic) {
      toast.error("Please consent to electronic signature");
      return false;
    }
    
    return true;
  };

  const handleSubmitSignature = async () => {
    if (!offer || !validateSignature()) return;

    const signatureData = signatureType === 'TYPED' ? typedSignature : drawnSignature;
    const consentText = `I, ${user.fullName || 'Candidate'}, hereby consent to the use of electronic signatures for this offer letter. I understand that this electronic signature has the same legal effect as a handwritten signature. Signed on ${new Date().toLocaleString()}.`;

    const result = await signOffer(offer.id, {
      offerSignatureType: signatureType,
      signatureData,
      consentText,
      agreedToElectronicSignature: true
    });

    if (result) {
      setStep('complete');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mr-3 text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Loading offer...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mr-3 text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-red-600">Error loading offer</h1>
          </div>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error || "Offer not found"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (offer.status !== 'READY_FOR_SIGN') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mr-3 text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Offer Signature</h1>
          </div>
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              This offer is not ready for signature. Current status: {offer.status.replace(/_/g, ' ')}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${step === 'review' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-indigo-600 text-white' : step === 'sign' || step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
            {step === 'sign' || step === 'complete' ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <span className="ml-2 font-medium">Review Offer</span>
        </div>
        
        <div className={`w-12 h-px ${step === 'sign' || step === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`} />
        
        <div className={`flex items-center ${step === 'sign' ? 'text-indigo-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'sign' ? 'bg-indigo-600 text-white' : step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
            {step === 'complete' ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <span className="ml-2 font-medium">Sign Offer</span>
        </div>
        
        <div className={`w-12 h-px ${step === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`} />
        
        <div className={`flex items-center ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
            {step === 'complete' ? <Check className="h-4 w-4" /> : '3'}
          </div>
          <span className="ml-2 font-medium">Complete</span>
        </div>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Offer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Position</p>
                <p className="font-medium text-gray-900">{offerContent?.position || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Salary</p>
                <p className="font-medium text-gray-900">{offerContent?.salary || 'Not specified'}</p>
              </div>
            </div>
            
            {offerContent?.startDate && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Start Date</p>
                  <p className="font-medium text-gray-900">{offerContent.startDate}</p>
                </div>
              </div>
            )}
            
            {offerContent?.location && (
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="font-medium text-gray-900">{offerContent.location}</p>
                </div>
              </div>
            )}
          </div>
          
          {offerContent?.content && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{offerContent.content}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download PDF
        </Button>
        
        <Button
          onClick={() => setStep('sign')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Proceed to Sign
          <Check className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const SignStep = () => (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-indigo-600" />
            Electronic Signature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={signatureType} onValueChange={(value) => setSignatureType(value as 'TYPED' | 'DRAWN')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="TYPED" className="flex items-center">
                <Edit3 className="h-4 w-4 mr-2" />
                Type Signature
              </TabsTrigger>
              <TabsTrigger value="DRAWN" className="flex items-center">
                <PenTool className="h-4 w-4 mr-2" />
                Draw Signature
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="TYPED" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type your full name as your signature
                </label>
                <Input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Enter your full name"
                  className="text-2xl font-script"
                  style={{ fontFamily: 'cursive' }}
                />
              </div>
              
              {typedSignature && (
                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="text-3xl font-script" style={{ fontFamily: 'cursive' }}>
                    {typedSignature}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="DRAWN" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Draw your signature in the area below
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full h-48 bg-white border border-gray-200 rounded cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCanvas}
                      className="text-gray-600 border-gray-300 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                I have read, understood, and agree to the terms and conditions of this offer letter. 
                I understand that this constitutes a binding agreement between myself and the company.
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="electronic"
                checked={agreedToElectronic}
                onCheckedChange={(checked) => setAgreedToElectronic(checked as boolean)}
              />
              <label htmlFor="electronic" className="text-sm text-gray-700 leading-relaxed">
                I consent to the use of electronic signatures and understand that my electronic signature 
                has the same legal validity as a handwritten signature under the Information Technology Act, 2000.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep('review')}
          className="text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Review
        </Button>
        
        <Button
          onClick={handleSubmitSignature}
          disabled={signing || !validateSignature()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {signing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Lock className="h-4 w-4 mr-2" />
          )}
          {signing ? 'Signing...' : 'Sign Offer'}
        </Button>
      </div>
    </div>
  );

  const CompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-10 w-10 text-green-600" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Successfully Signed!</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Your electronic signature has been recorded and the offer is now complete. 
          You will receive a copy of the signed offer via email shortly.
        </p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
        <h3 className="font-medium text-green-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-green-800 space-y-1 text-left">
          <li>• HR will be notified of your acceptance</li>
          <li>• You'll receive onboarding information soon</li>
          <li>• A signed copy will be emailed to you</li>
          <li>• Welcome to the team!</li>
        </ul>
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          Go to Dashboard
        </Button>
        
        <Button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download Signed Copy
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          {step !== 'complete' && (
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")} 
              className="mr-3 text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {step === 'complete' ? 'Signature Complete' : 'Sign Offer Letter'}
            </h1>
            <p className="text-gray-600 mt-1">
              Offer #{offer.id} • Created {formatDate(offer.createdAt)}
            </p>
          </div>
        </div>

        <StepIndicator />

        {step === 'review' && <ReviewStep />}
        {step === 'sign' && <SignStep />}
        {step === 'complete' && <CompleteStep />}
      </div>
    </div>
  );
};

export default SignatureCollectionPage;