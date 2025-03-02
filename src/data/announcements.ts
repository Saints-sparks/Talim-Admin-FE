export interface Announcement {
    id: number;
    adminId: number;
    date: string;
    school?: string;
    title: string;
    content: string;
  }

  export const announcements: Announcement[] = [
    {
      id: 1,
      adminId: 1,
      school: "Greenwood High School",
      date: "Feb 28, 06:00 AM",
      title: "Welcome to Talim",
      content: "We are excited to welcome you all to the new Talim platform. Stay tuned for updates We are excited to welcome you all to the new Talim platform. Stay tuned for updates!. We are excited to welcome you all to the new Talim platform. Stay tuned for updates!!",
    },
    {
      id: 2,
      adminId: 1,
      school: "Horizon Academy",
      date: "Feb 27, 02:30 PM",
      title: "Holiday Announcement",
      content: "The school will be closed for the upcoming holiday. Enjoy your break!",
    },
    {
      id: 3,
      adminId: 1,
      school: undefined, // General announcement (No school name)
      date: "Feb 26, 10:15 AM",
      title: "System Maintenance",
      content: "We will be performing scheduled maintenance on the system this weekend. Thank you for your patience.",
    },
  ];
  