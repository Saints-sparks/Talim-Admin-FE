import React from 'react';

interface Student {
  name: string;
  class: string;
  image: string;
}

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => (
  <div className="p-4 border border-gray-200 rounded shadow-sm bg-white">
    <img
      src={student.image}
      alt={student.name}
      className="w-16 h-16 rounded-full mx-auto mb-2"
    />
    <h3 className="text-center text-lg font-semibold">{student.name}</h3>
    <p className="text-center text-gray-500">{student.class}</p>
    <div className="flex justify-around mt-4">
      <button className="px-4 py-1 bg-blue-600 text-white rounded">Email</button>
      <button className="px-4 py-1 bg-gray-200 text-gray-700 rounded">Chat</button>
    </div>
  </div>
);

export default StudentCard;
