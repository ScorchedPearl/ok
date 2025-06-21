import  { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TestDetails {
  testName: string;
  testId: string;
  jobId: string;
  totalCandidates: number;
}

export default function AssessmentResults() {
  const { id } = useParams(); // Get testId from URL
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
  const [filterCriteria, setFilterCriteria] = useState({
    percentage: '',
    timeTaken: '',
    score: ''
  });

  useEffect(() => {
    // Fetch test details and results using the id
    const fetchTestDetails = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/tests/${id}`);
        const data = await response.json();
        setTestDetails(data);
      } catch (error) {
        console.error('Error fetching test details:', error);
      }
    };

    fetchTestDetails();
  }, [id]);

  const mockResults = [
    {
      candidateId: 1,
      name: "John Doe",
      percentage: 85,
      correctAnswers: 17,
      totalQuestions: 20,
      timeTaken: "45 mins",
      startTime: "2025-02-17T14:30:00",
    },
    // Add more mock results...
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilterCriteria(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <div className="p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-[#342D7E] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Shortlist Candidates</h1>
              <div className="text-gray-500 space-x-2">
                <span>Test ID: {testDetails?.testId}</span>
                <span>•</span>
                <span>Job ID: {testDetails?.jobId}</span>
              </div>
            </div>
          </div>
          
          <Button 
            className="bg-[#342D7E] hover:bg-[#282369] text-white px-6"
            disabled={selectedCandidates.length === 0}
          >
            Shortlist Selected ({selectedCandidates.length})
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-6">
            <Select
              value={filterCriteria.percentage}
              onValueChange={(value) => handleFilterChange('percentage', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by percentage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="70">Above 70%</SelectItem>
                <SelectItem value="80">Above 80%</SelectItem>
                <SelectItem value="90">Above 90%</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterCriteria.timeTaken}
              onValueChange={(value) => handleFilterChange('timeTaken', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by time taken" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Under 30 mins</SelectItem>
                <SelectItem value="45">Under 45 mins</SelectItem>
                <SelectItem value="60">Under 60 mins</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterCriteria.score}
              onValueChange={(value) => handleFilterChange('score', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Performers (&lt;90%)</SelectItem>
                <SelectItem value="medium">Medium Performers (70-90%)</SelectItem>
                <SelectItem value="low">Low Performers (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-[40px] px-6 py-3">
                    <Checkbox 
                      checked={selectedCandidates.length === mockResults.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCandidates(mockResults.map(r => r.candidateId));
                        } else {
                          setSelectedCandidates([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Candidate Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Score</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time Taken</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Start Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockResults.map((result) => (
                  <tr 
                    key={result.candidateId}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Checkbox 
                        checked={selectedCandidates.includes(result.candidateId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCandidates([...selectedCandidates, result.candidateId]);
                          } else {
                            setSelectedCandidates(selectedCandidates.filter(id => id !== result.candidateId));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{result.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.correctAnswers}/{result.totalQuestions} ({result.percentage}%)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{result.timeTaken}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(result.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Button 
                        variant="ghost" 
                        className="text-[#342D7E] hover:text-white"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing 1 to {itemsPerPage} of {testDetails?.totalCandidates || 0} results
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(parseInt(value))}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue>{itemsPerPage} per page</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className={currentPage === page ? "bg-[#342D7E]" : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}