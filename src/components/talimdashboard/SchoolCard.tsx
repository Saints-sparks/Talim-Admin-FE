import { Badge } from "../ui/badge";

interface School {
  _id: string;
  schoolPrefix: string;
  name: string;
  email: string;
  active: boolean;
  location: {
    state: string;
    country: string;
  };
  primaryContacts: { name: string; role: string }[];
}

interface SchoolCardProps {
  school: School;
  onClick: (id: string) => void;
}

const SchoolCard = ({ school, onClick }: SchoolCardProps) => {
  return (
    <div
      key={school._id}
      className="flex flex-col p-4 sm:p-6 rounded-lg border bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => onClick(school._id)}
    >
      {/* Header: Prefix & Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          <span className="text-indigo-600 font-bold">{school.schoolPrefix}</span>
        </div>
        <Badge
          variant={school.active ? "default" : "destructive"}
          className={
            school.active
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {school.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* School Details */}
      <div className="space-y-3">
        {/* Name & Email (Handles Text Overflow) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 truncate">{school.name}</h3>
          <p className="text-sm sm:text-base text-gray-500 truncate">{school.email}</p>
        </div>

        {/* Location & Contact */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="font-medium">{school.location.state}</span>
            <span>•</span>
            <span>{school.location.country}</span>
          </div>
          {school.primaryContacts[0] && (
            <p className="text-sm text-gray-600 mt-1 truncate">
              {school.primaryContacts[0].name}
              <span className="text-gray-400"> • </span>
              <span className="text-gray-500">{school.primaryContacts[0].role}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
