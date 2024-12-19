import Image from "next/image";

interface StudentCardProps {
  name: string;
  classLevel: string;
  imageUrl: string;
}

const StudentCard: React.FC<StudentCardProps> = ({
  name,
  classLevel,
  imageUrl,
}) => {
  return (
    <div className="border rounded-md p-4 shadow-sm flex flex-col items-center bg-white">
      <Image
        src={imageUrl}
        alt={name}
        width={64}
        height={64}
        className="rounded-full object-cover mb-4"
      />
      <h3 className="text-lg font-medium">{name}</h3>
      <p className="text-gray-500 text-sm">{classLevel}</p>
      <div className="mt-4 flex gap-2">
        <button className="bg-blue-500 text-white px-4 py-1 rounded-md">
          Call
        </button>
        <button className="bg-gray-200 text-black px-4 py-1 rounded-md">
          Chat
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
