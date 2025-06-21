import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Library {
  libraryId: number;
  libraryName: string;
  description: string;
  createdAt: string;
  createdBy: string;
  tenantUserId: number;
  timeRequired: number;
  tags: string[];
  questions: any[];
}

const AddQuestions: React.FC = () => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const [library, setLibrary] = useState<Library | null>(null);

  useEffect(() => {
    async function fetchLibraryDetails() {
      try {
        const response = await fetch(`/api/libraries/${libraryId}`);
        if (response.ok) {
          const data = await response.json();
          setLibrary(data);
        } else {
          console.error("Error fetching library details");
        }
      } catch (error) {
        console.error("Error fetching library details", error);
      }
    }

    fetchLibraryDetails();
  }, [libraryId]);

  if (!library) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg p-8 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#4338CA]">{library.libraryName}</h2>
          <Button variant="secondary" className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            View Questions
          </Button>
        </div>
        <p className="text-gray-600 mb-4">{library.description}</p>
        <div className="mb-4">
          <h4 className="font-semibold text-lg text-[#4338CA]">Details</h4>
          <p>Created At: {new Date(library.createdAt).toLocaleString()}</p>
          <p>Time Required: {library.timeRequired} minutes</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {library.tags.map((tag, index) => (
              <span key={index} className="bg-[#4338CA] text-white text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-lg text-[#4338CA]">Questions</h4>
          {library.questions.length === 0 ? (
            <p>No questions available in this library.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {library.questions.map((question, index) => (
                <Card key={index}>
                  <CardContent>
                    <p>{question.questionText}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddQuestions;