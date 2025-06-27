"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TextGenerateEffect } from "@/components/ui/aceternity"
import Papa from 'papaparse'

interface Question {
  Question: string;
  'Option A': string;
  'Option B': string;
  'Option C': string;
  'Option D': string;
  Answer: string;
}

const QuestionPreview = ({ question, index }: { question: Question; index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="p-4 border rounded-lg mb-4 bg-white shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="font-medium text-[#2E2883] min-w-[24px]">{index + 1}.</span>
        <span className="font-medium">{question.Question}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
        <div className={`p-2 rounded flex gap-2 ${question.Answer === 'A' ? 'bg-green-50 border-green-200 border' : 'bg-gray-50'}`}>
          <span className="font-medium">A.</span> 
          <span>{question['Option A']?.replace(/^"|"$/g, '')}</span>
        </div>
        <div className={`p-2 rounded flex gap-2 ${question.Answer === 'B' ? 'bg-green-50 border-green-200 border' : 'bg-gray-50'}`}>
          <span className="font-medium">B.</span>
          <span>{question['Option B']?.replace(/^"|"$/g, '')}</span>
        </div>
        <div className={`p-2 rounded flex gap-2 ${question.Answer === 'C' ? 'bg-green-50 border-green-200 border' : 'bg-gray-50'}`}>
          <span className="font-medium">C.</span>
          <span>{question['Option C']?.replace(/^"|"$/g, '')}</span>
        </div>
        <div className={`p-2 rounded flex gap-2 ${question.Answer === 'D' ? 'bg-green-50 border-green-200 border' : 'bg-gray-50'}`}>
          <span className="font-medium">D.</span>
          <span>{question['Option D']?.replace(/^"|"$/g, '')}</span>
        </div>
      </div>
      <div className="pl-8 text-sm text-gray-500 flex items-center gap-2">
        <span className="font-medium">Correct Answer:</span> 
        <span className="text-green-600 font-medium">{question.Answer?.replace(/^"|"$/g, '')}</span>
      </div>
    </div>
  </motion.div>
);

export default function QuestionLibraryPage() {
  const [file, setFile] = useState<File | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
      setParsing(true)
      setError(null)

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        quoteChar: '"',
        complete: (results:any) => {
          console.log('Parsed results:', results);
          if (results.errors.length > 0) {
            setError('Error parsing CSV file: ' + results.errors[0].message)
          } else {
            // Clean the data by removing quotes and extra spaces
            const cleanedData = results.data.map((row: any) => ({
              Question: row.Question?.trim(),
              'Option A': row['Option A']?.trim(),
              'Option B': row['Option B']?.trim(),
              'Option C': row['Option C']?.trim(),
              'Option D': row['Option D']?.trim(),
              Answer: row.Answer?.trim()
            }));

            console.log(questions);
            
            setQuestions(cleanedData as Question[])
          }
          setParsing(false)
        },
        error: (error:any) => {
          console.error('CSV parsing error:', error);
          setError('Failed to parse CSV file: ' + error.message)
          setParsing(false)
        }
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <TextGenerateEffect words="Create Question Library" className="text-2xl" />

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Library Details</CardTitle>
            <CardDescription>Enter the basic information about your question library.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Library Name</Label>
              <Input id="name" placeholder="e.g., Audit Fundamentals" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe what this library covers..." rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Questions</CardTitle>
            <CardDescription>
              Upload your questions in CSV format with headers: Question, Option A, Option B, Option C, Option D, Answer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="hidden" 
                id="csv-upload" 
              />
              <label 
                htmlFor="csv-upload" 
                className="cursor-pointer space-y-4 block"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div className="text-sm text-gray-600">
                  <span className="text-[#2E2883] font-medium">Click to upload</span> or drag and drop
                </div>
                <div className="text-xs text-gray-500">CSV files only</div>
              </label>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {parsing && (
              <div className="text-center text-sm text-gray-600">
                Processing CSV file...
              </div>
            )}

            {questions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{file?.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {questions.length} questions loaded
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-700">Question Preview</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {questions.map((question, index) => (
                      <QuestionPreview 
                        key={index} 
                        question={question} 
                        index={index} 
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-4 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <p>Please review all questions to ensure they are correctly parsed before saving.</p>
                </div>
              </motion.div>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline">Cancel</Button>
              <Button 
                className="bg-[#2E2883] hover:bg-[#2E2883]/90"
                disabled={questions.length === 0}
              >
                Save Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}