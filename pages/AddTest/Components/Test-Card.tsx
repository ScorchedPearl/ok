"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ListChecks, BookmarkPlus, BookmarkCheck, Eye } from "lucide-react"
import type { Test } from "../Types/Test"
import { Link } from "react-router-dom"

interface TestCardProps {
  test: Test
  onDragStart: (e: React.DragEvent, test: Test) => void
  onSaveToggle: (testId: string) => void
  onAdd: (testId: string) => void
  isSaved: boolean
}

export function TestCard({ test, onSaveToggle, onAdd, isSaved }: TestCardProps) {
  return (
    <Card
      
      
      className="cursor-move border border-gray-200 hover:border-gray-300 bg-white transition-all duration-200 hover:shadow-lg"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-800">{test.title}</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAdd(test.id)}
              className="h-8 w-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <ListChecks className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSaveToggle(test.id)}
              className="h-8 w-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              {isSaved ? <BookmarkCheck className="h-5 w-5 text-emerald-600" /> : <BookmarkPlus className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {test.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className={`text-xs font-medium px-2 py-1 rounded ${tag.color}`}>
              {tag.name}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{test.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {test.duration}
          </div>
          <div className="flex items-center gap-1">
            <ListChecks className="w-4 h-4" />
            {test.questions} questions
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100">
        <Badge
          variant="outline"
          className={`text-xs font-semibold px-2 py-1 rounded ${
            test.difficulty === "Beginner"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : test.difficulty === "Advanced"
                ? "text-amber-700 bg-amber-50 border-amber-200"
                : "text-rose-700 bg-rose-50 border-rose-200"
          }`}
        >
          {test.difficulty}
        </Badge>
        <Link to={`/test-preview/${test.id}`}>
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

