// LibrarySelector.tsx
import React from "react";
import { QuestionLibrary, MCQQuestion } from "../Types/Test";
import { Button } from "@/components/ui/button";

interface LibrarySelectorProps {
  libraries: QuestionLibrary[];
  selectedQuestions: MCQQuestion[];
  onSelectQuestions: (selectedQuestions: MCQQuestion[]) => void;
  onDeselectQuestion: (deselectedQuestion: MCQQuestion) => void;
}

const LibrarySelector: React.FC<LibrarySelectorProps> = ({
  libraries,
  selectedQuestions,
  onSelectQuestions,
  onDeselectQuestion,
}) => {
  // This is a simple example implementation.
  // You might want to add search, filtering, etc.
  return (
    <div className="border p-4 rounded-lg mb-6">
      <h3 className="font-bold text-lg mb-2">Select Questions from Libraries</h3>
      {libraries.map(lib => (
        <div key={lib.id} className="mb-4">
          <h4 className="font-medium">{lib.libraryName}</h4>
          <ul className="ml-4">
            {lib.questions.map(q => {
              const isSelected = selectedQuestions.some(sq => sq.id === q.id);
              return (
                <li key={q.id} className="flex items-center justify-between">
                  <span>{q.question.substring(0, 50)}...</span>
                  {isSelected ? (
                    <Button size="sm" variant="destructive" onClick={() => onDeselectQuestion(q)}>
                      Deselect
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => onSelectQuestions([q])}>
                      Select
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default LibrarySelector;
