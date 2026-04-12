import { SchoolIcon } from "lucide-react";

interface StatsProps {
  totalSchools: number;
  totalSchoolsIncrease: number;
  activeNow: number;
  activeIncrease: number;
}

const Stats = ({ totalSchools, totalSchoolsIncrease, activeNow, activeIncrease }: StatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Total Schools */}
      <div className="rounded-xl border border-[#F1F1F1] bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-[#6F6F6F]">Total Schools</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF2FB]">
            <SchoolIcon className="h-4 w-4 text-[#003366]" />
          </div>
        </div>
        <div className="text-3xl font-bold text-[#030E18]">{totalSchools}</div>
        <p className="mt-1 text-xs text-[#6F6F6F]">
          <span className="text-emerald-600 font-medium">+{totalSchoolsIncrease}</span> from last month
        </p>
      </div>

      {/* Active Schools */}
      <div className="rounded-xl border border-[#F1F1F1] bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-[#6F6F6F]">Active Schools</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
            <SchoolIcon className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-[#030E18]">{activeNow}</div>
        <p className="mt-1 text-xs text-[#6F6F6F]">
          <span className="text-emerald-600 font-medium">+{activeIncrease}</span> from last month
        </p>
      </div>
    </div>
  );
};

export default Stats;
