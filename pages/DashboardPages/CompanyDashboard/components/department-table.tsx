import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Users, 
  MoreHorizontal,
  Briefcase
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Department interface
interface Department {
  id: string;
  name: string;
  tenantId: number;
  jobCount?: number;
}

interface DepartmentsTableProps {
  departments: Department[];
  onEdit?: (departmentName: string) => void;
  onDelete?: (departmentName: string) => void;
}

export default function DepartmentsTable({ departments, onEdit, onDelete }: DepartmentsTableProps) {
  // Function to generate a random hex color based on department name
  const getDepartmentColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-yellow-100 text-yellow-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];
    
    // Use the sum of character codes to determine color index
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const handleEdit = (departmentName: string) => {
    if (onEdit) onEdit(departmentName);
  };

  const handleDelete = (departmentName: string) => {
    if (onDelete) onDelete(departmentName);
  };

  return (
    <div className="rounded-md border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[350px] py-3 font-semibold text-gray-800">Department</TableHead>
            <TableHead className="py-3 font-semibold text-gray-800 text-center">No. of Jobs</TableHead>
            <TableHead className="py-3 text-right font-semibold text-gray-800">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-lg font-medium">No departments found</p>
                  <p className="text-gray-400 mt-1">Create your first department to get started</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            departments.map((department) => {
              const departmentColorClass = getDepartmentColor(department.name);
              
              return (
                <TableRow key={department.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${departmentColorClass.split(' ')[0]}`}>
                        <Users className={`h-5 w-5 ${departmentColorClass.split(' ')[1]}`} />
                      </div>
                      <div>
                        <div className="font-semibold">{department.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center">
                      <Badge variant="outline" className={`px-3 py-1 flex items-center gap-1.5 ${departmentColorClass}`}>
                        <Briefcase className="h-3.5 w-3.5" />
                        {department.jobCount || 0}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                        onClick={() => handleEdit(department.name)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white shadow-lg border border-gray-200 rounded-md w-56">
                          
                          
                          <DropdownMenuItem 
                            className="text-red-600 hover:bg-red-50 cursor-pointer flex items-center"
                            onClick={() => handleDelete(department.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}