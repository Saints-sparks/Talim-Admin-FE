import { NotificationResponse } from "@/app/services/notification.service";
import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AnnouncementListProps {
  announcements: NotificationResponse[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isRefreshing: boolean;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({ 
  announcements, 
  totalPages, 
  currentPage, 
  onPageChange,
  isRefreshing
}) => {
  return (
    <div className="space-y-4">
      {announcements.map((announcement, index) => (
        <motion.div
          key={announcement._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: index * 0.1,
            ease: "easeOut"
          }}
          whileHover={{ 
            scale: 1.01,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all"
        >
          <div className="flex items-start justify-between gap-6">
            {/* Left side content */}
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-2">
                <h3 className="font-semibold text-gray-900 flex-1">{announcement.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{announcement.message}</p>
              
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="flex gap-2">
                  {announcement.attachments.map((attachment, i) => (
                    <motion.a
                      key={i}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 transition-colors"
                    >
                      📎 Attachment {i + 1}
                    </motion.a>
                  ))}
                </div>
              )}
            </div>

            {/* Right side content */}
            <div className="flex flex-col items-end gap-3 min-w-[200px]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className={`px-3 py-1 rounded-full text-sm ${
                  announcement.priority === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : announcement.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority
                </span>
              </motion.div>

              <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <span>Recipients:</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {announcement.recipientRoles.map((role) => (
                      <span key={role} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <span>Target:</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                    {announcement.targetSchools?.length || 0} schools
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 text-xs text-gray-400"
                >
                  <span>Posted:</span>
                  <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-center items-center py-4"
        >
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            <span>Refreshing announcements...</span>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;
