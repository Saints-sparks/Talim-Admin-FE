export interface SchoolStats {
    totalSchools: number
    activeNow: number
    totalSchoolsIncrease: number
    activeIncrease: number
  }
  
  export interface School {
    id: string
    name: string
    address: string
    principal: {
      name: string
      avatar?: string
    }
    teacherCount: number
    studentCount: number
  }
  
  