import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightbulbIcon, Flag, DollarSign } from "lucide-react";

export default function Notifications() {
  return (
    <Card className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto border-0 bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gray-50 px-4 sm:px-6 py-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-800">Notifications</CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {/* Notification Items */}
          <NotificationItem
            icon={<LightbulbIcon className="w-5 h-5 text-amber-500" />}
            title="Candidate 1 started Test"
            date="28 January 2021"
            bgColor="bg-amber-50"
          />
          <NotificationItem
            icon={<Flag className="w-5 h-5 text-blue-500" />}
            title="Candidate 2 Flagged in Test"
            date="25 January 2021"
            bgColor="bg-blue-50"
          />
          <NotificationItem
            icon={<DollarSign className="w-5 h-5 text-green-500" />}
            title="Assessment Updated by Partner 1"
            date="21 January 2021"
            bgColor="bg-green-50"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationItem({ icon, title, date, bgColor }) {
  return (
    <div
      className={`flex items-center gap-4 ${bgColor} p-3 rounded-md transition-all duration-200 hover:shadow-md`}
    >
      {/* Icon */}
      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
        {icon}
      </div>

      {/* Title and Date */}
      <div className="flex-1 flex items-center justify-between min-w-0">
        <h2 className="text-sm sm:text-base font-medium text-gray-800 truncate">{title}</h2>
        <p className="text-xs sm:text-sm text-gray-500 ml-4 flex-shrink-0">{date}</p>
      </div>
    </div>
  );
}
