"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

const DateRangePicker = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  return (
    <div className="flex items-center gap-2 border border-gray-400 p-2 rounded-md cursor-pointer w-[180px]">
      <Calendar size={16} className="text-gray-500 flex-shrink-0" />
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => setDateRange(update as [Date | null, Date | null])}
        placeholderText="Date Range"
        className="outline-none text-sm bg-transparent w-full"
      />
    </div>
  );
};

export default DateRangePicker;
