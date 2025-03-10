export interface School {
    id: string
    shortName: string
    name: string
    email: string
    priority: "High" | "Medium" | "Low"
    dateCreated: string
    location?: string
    status: "Active" | "Inactive"
    lastResponse?: string
  }
  
  export interface TicketStats {
    total: number
    resolved: number
    unresolved: number
  }
  
  export interface Ticket {
    id: string
    ticketId: string
    subject: string
    status: "Active" | "Inactive"
    priority: "High" | "Medium" | "Low"
    dateSubmitted: string
    label?: string
    requestDate?: string
    school: {
      id: string
      shortName: string
      name: string
      email: string
    }
  }
  
  export interface Attachment {
    id: string
    fileName: string
    fileSize: string
    sizeInBytes: number
    dateUploaded: string
    type: "pdf" | "jpg" | "mp4" | "fig" | "docx" | "framex" | "png"
  }
  
  