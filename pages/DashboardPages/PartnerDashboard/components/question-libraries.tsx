import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuestionLibrariesProps {
  libraries: Library[];
}

  interface Library {
    libraryId: number;
    libraryName: string;
    questionCount: number;
    questions?: { length: number }[];
  }

export default function QuestionLibraries({ libraries }: QuestionLibrariesProps) {
  if (!libraries || libraries.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 text-sm">
          No libraries present. Create a new library to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
       {libraries.map((library) => (
        <Link
          to={`/partner-dashboard/library/${library.libraryId}`}
          key={library.libraryId}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="cursor-pointer hover:shadow-md transition-shadow duration-300">
              <motion.div
                whileHover={{
                  scale: 1.006,
                  boxShadow: "0px 6px 14px rgba(46, 40, 131, 0.15)",
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="border rounded-xl p-2 bg-gradient-to-br from-[#f4f5ff] to-white hover:bg-gradient-to-br hover:from-[#eef0ff] hover:to-white hover:border-blue-300 transition-all"
              >
                <CardContent className="p-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#2E2883] p-2 rounded-full">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#2E2883]">
                        {library.libraryName}
                      </h3>
                      <p className="text-md text-gray-600">
                        {library.questions?.length} questions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            </Card>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}