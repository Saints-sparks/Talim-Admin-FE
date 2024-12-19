"use client"
import Header from "@/components/Header";
import Overview from "@/components/OverView";
import TaskTable from "@/components/TaskTable";
import UpcomingClasses from "@/components/UpcomingClasses";
import React from "react";

const DashboardPage: React.FC = () => {
  const greeting = "Good Afternoon, Mr Adam";
  const tent = "Good job, Mr Adam! Your efforts are paying off!";
  return (
    <div className="p-6 space-y-1 bg-[F8F8F8]">
      <Header greeting={greeting} tent={tent} />
    
     
      <TaskTable />
    </div>
  );
};

export default DashboardPage;
