export interface Job {
    id: string
    title: string
    department: string
    location: string
    employmentType: "full-time" | "part-time" | "contract"
    description: string
    recruiterId: string
    createdAt: string
    updatedAt: string
  }
  
  