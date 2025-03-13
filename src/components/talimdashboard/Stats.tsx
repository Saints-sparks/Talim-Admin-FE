import { SchoolIcon } from "lucide-react";

interface StatsProps {
  totalSchools: number;
  totalSchoolsIncrease: number;
  activeNow: number;
  activeIncrease: number;
}

const Stats = ({ totalSchools, totalSchoolsIncrease, activeNow, activeIncrease }: StatsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Total Schools */}
      <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium text-gray-800">Total Schools</h3>
          <SchoolIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-blue-600">{totalSchools}</div>
            <p className="text-xs text-blue-600/80">+{totalSchoolsIncrease} from last month</p>
          </div>
        </div>
      </div>

      {/* Active Schools */}
      <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium text-gray-800">Active Schools</h3>
          <SchoolIcon className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-green-600">{activeNow}</div>
            <p className="text-xs text-green-600/80">+{activeIncrease} from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
