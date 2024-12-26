export interface UserProfile {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    role: string
    avatar?: string
  }
  
  export interface Activity {
    id: string
    date: string
    time?: string
    location: string
  }
  
  