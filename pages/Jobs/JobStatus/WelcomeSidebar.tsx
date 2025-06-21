import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WelcomeSidebar() {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
      <CardHeader className="border-b border-[#E2E8F0] pb-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-[#6366F1] bg-opacity-10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <CardTitle className="text-[#1E293B] text-xl font-bold">Welcome</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="group">
          <h3 className="text-gray-800 font-medium mb-3">Welcome Message</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to your candidate homepage! This is where you can find updates on submitted applications, any tasks
            you may need to complete during the application process, and suggestions for other job openings.
          </p>
        </div>

        <div className="group p-4 bg-blue-50 rounded-lg">
          <h3 className="text-gray-800 font-medium mb-3">Need to update your email address?</h3>
          <p className="text-sm text-gray-600">
            Click on your profile name in the upper right hand corner
          </p>
        </div>

        <div className="group">
          <h3 className="text-gray-800 font-medium mb-3">About Us</h3>
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gray-100 rounded-lg p-2">
              <img 
                src="/api/placeholder/40/40" 
                alt="Company Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            We're a leading technology company inspiring the future of business with innovative solutions. Join us in
            making a difference.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Support available</span>
            </div>
            <span className="text-sm text-gray-800 font-medium">24/7</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}