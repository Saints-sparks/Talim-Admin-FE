export interface AdminProfile {
    adminId: number;
    name: string;
    role: string;
    avatar: string;
    email: string;
  }
  
  export const adminProfiles: AdminProfile[] = [
    {
      adminId: 1,
      name: "Olivia Eromosele",
      role: "Talim Administrator",
      avatar: "/img/admin-avatar.png",
      email: "olivia.eromos@talim.com"
    },
  ];
  