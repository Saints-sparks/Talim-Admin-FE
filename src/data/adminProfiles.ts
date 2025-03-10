export interface Activity {
  date: string;
  location: string;
  time: string;
}

export interface AdminProfile {
  adminId: number;
  name: string;
  role: string;
  avatar: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateRegistered: string;
  activities: Activity[];
}

export const adminProfiles: AdminProfile[] = [
  {
    adminId: 1,
    firstName: "Olivia",
    lastName: "Eromosele",
    name: "Olivia Eromosele",
    role: "Talim Administrator",
    avatar: "/img/admin-avatar.png",
    phone: "09022794720",
    dateRegistered: "June 01, 2024",
    email: "olivia.eromos@talim.com",
    activities: [
      {
        date: "June 09, 2024",
        location: "Edo State, Benin City",
        time: "12:45 PM",
      },
      {
        date: "June 04, 2024",
        location: "Edo State, Benin City",
        time: "1:45 PM",
      },
    ],
  },
];