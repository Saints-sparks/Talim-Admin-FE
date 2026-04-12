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
      className="flex flex-col p-5 rounded-xl border border-[#F1F1F1] bg-white hover:border-[#D7E6F6] hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onClick(school._id)}
    >
      {/* Header: Prefix & Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#EAF2FB] flex items-center justify-center group-hover:bg-[#D7E6F6] transition-colors">
          <span className="text-[#003366] font-bold text-sm">{school.schoolPrefix}</span>
        </div>
        <Badge
          className={
            school.active
              ? "bg-emerald-50 text-emerald-700 border-0 text-xs font-medium"
              : "bg-red-50 text-red-700 border-0 text-xs font-medium"
          }
        >
          {school.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* School Details */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-[#030E18] truncate">{school.name}</h3>
          <p className="text-sm text-[#6F6F6F] truncate">{school.email}</p>
        </div>

        <div className="pt-3 border-t border-[#F1F1F1]">
          <div className="flex items-center gap-1 text-sm text-[#6F6F6F]">
            <span className="font-medium">{school.location.state}</span>
            <span>·</span>
            <span>{school.location.country}</span>
          </div>
          {school.primaryContacts[0] && (
            <p className="text-xs text-[#6F6F6F] mt-1 truncate">
              {school.primaryContacts[0].name}
              <span className="text-[#878787]"> · </span>
              <span>{school.primaryContacts[0].role}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
