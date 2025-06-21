
import { useState, useEffect } from 'react';
import { Search, Share2, UserPlus } from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Interview {
  interviewId: number;
  position: string;
  candidateEmail: string;
  department: string;
  location?: string;
  mode: 'VIRTUAL' | 'ONSITE';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  interviewDate: string;
  roundNumber: number;
  interviewers: Array<{
    interviewer: {
      name: string;
    };
  }>;
}

const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || 'http://localhost:8007/api/interviews';

const InterviewsDashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRound, setSelectedRound] = useState<string>('all');

  useEffect(() => {
    fetch('${interviewServiceUrl}/api/interviews')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch interviews');
        return res.json();
      })
      .then((data: Interview[]) => {
        setInterviews(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-[#1e1b4b]">Interviews</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-[#1e1b4b] text-[#1e1b4b] rounded-lg flex items-center gap-2 hover:bg-[#1e1b4b] hover:text-white transition-colors">
            <Share2 className="h-4 w-4" />
            SHARE INTERVIEW LINK
          </button>
          <button className="px-4 py-2 bg-[#1e1b4b] text-white rounded-lg flex items-center gap-2 hover:bg-[#2d2a5a] transition-colors">
            <UserPlus className="h-4 w-4" />
            SCHEDULE INTERVIEW
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 bg-[#f3f4f6] text-[#1e1b4b] font-medium rounded-lg">
            Scheduled Interviews
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-[#f3f4f6] rounded-lg">
            Past Interviews
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search interviews"
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b]/20 focus:border-[#1e1b4b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="w-full bg-white border rounded-lg">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="VIRTUAL">Virtual</SelectItem>
              <SelectItem value="ONSITE">On-site</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full bg-white border rounded-lg">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="REMOTE">Remote</SelectItem>
              <SelectItem value="ONSITE">On-site</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRound} onValueChange={setSelectedRound}>
            <SelectTrigger className="w-full bg-white border rounded-lg">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="ENGINEERING">Engineering</SelectItem>
              <SelectItem value="PRODUCT">Product</SelectItem>
              <SelectItem value="DESIGN">Design</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRound} onValueChange={setSelectedRound}>
            <SelectTrigger className="w-full bg-white border rounded-lg">
              <SelectValue placeholder="Work type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FULL_TIME">Full-Time</SelectItem>
              <SelectItem value="PART_TIME">Part-Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-[#f8fafc]">
                <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">Position</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">Department</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">Location</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">Mode</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">Work Type</th>
                <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">Owner</th>
                <th className="text-right py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {interviews.map((interview) => (
                <tr 
                  key={interview.interviewId} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-[#1e1b4b]">
                      {interview.position}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{interview.department}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{interview.location || 'Remote'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{interview.mode}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">Full-Time</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-sm">
                        {interview.interviewers[0]?.interviewer.name.charAt(0) || '?'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {interview.interviewers[0]?.interviewer.name || 'Unassigned'}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="px-4 py-1.5 bg-[#1e1b4b] text-white text-sm rounded-lg hover:bg-[#2d2a5a] transition-colors">
                      REFER CANDIDATE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewsDashboard;