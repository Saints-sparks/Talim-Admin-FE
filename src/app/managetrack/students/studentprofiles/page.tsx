"use client";

import Header from "@/components/Header";
import { use } from "react";

const StudentPage: React.FC = () => {
    const greeting = "Student Overview";
    const tent = "View detailed information and progress for each student.";
    return (
        <div className="p-6 space-y-1 bg-[F8F8F8]">
        <Header greeting={greeting} tent={tent} />
 
        </div>
    );
    };
    export default StudentPage;