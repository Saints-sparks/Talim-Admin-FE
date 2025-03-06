"use client";

import React from "react";
import { statsData } from "@/data/statsData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@heroicons/react/24/solid";

const getColor = (trend: string) => {
  if (trend === "up") return "text-green-600";
  if (trend === "down") return "text-red-600";
  return "text-gray-500";
};

const Stats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
          {/* Left Side - Text Data */}
          <div className="flex flex-col">
            <h3 className="text-lg font-medium text-gray-600 py-[5px]">{stat.title}</h3>
            <span className="text-3xl text-black font-semibold py-[5px]">{stat.count}</span>
            <span className={`flex items-center text-sm font-medium py-[5px] ${getColor(stat.trend)}`}>
              {stat.trend === "up" && <ArrowUpIcon className="h-5 w-5 mr-1" />}
              {stat.trend === "down" && <ArrowDownIcon className="h-5 w-5 mr-1" />}
              {stat.trend === "neutral" && <MinusIcon className="h-5 w-5 mr-1" />}
              {Math.abs(stat.change)}% vs last month
            </span>
          </div>

          {/* Right Side - Line Graph */}
          <div className="w-32 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stat.dataPoints.map((value, i) => ({ index: i, value }))}>
                <XAxis dataKey="index" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={stat.trend === "up" ? "green" : "red"} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
