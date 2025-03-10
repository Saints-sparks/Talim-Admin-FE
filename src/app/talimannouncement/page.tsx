"use client"
import AnnouncementForm from "@/components/announcement/AnnouncementForm";
import AnnouncementList from "@/components/announcement/AnnouncementList";
import DateRangePicker from "@/components/announcement/DatePicker";
import { NotificationResponse, notificationService } from "@/app/services/notification.service";
import React, { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState<NotificationResponse[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnnouncements = async (page: number) => {
    try {
      setIsRefreshing(true);
      const response = await notificationService.getAllNotifications(page);
      setAnnouncements(response.data);
      setTotalPages(response.meta.lastPage);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Failed to fetch announcements');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements(currentPage);
  }, [currentPage]);

  // Function to add a new announcement
  const handlePostAnnouncement = async (newAnnouncement: NotificationResponse) => {
    setIsSubmitting(true);
    try {
      setAnnouncements((prev) => [newAnnouncement, ...prev]); // Add new announcement at the top
      setIsFormOpen(false); // Close the modal after posting
      toast.success('Announcement created successfully');
      // Refresh the announcements list
      await fetchAnnouncements(currentPage);
    } catch (error) {
      console.error('Failed to post announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Loading Modal for initial load */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-6 rounded-lg flex items-center gap-3"
            >
              <Loader2 className="animate-spin" size={24} />
              <span className="text-lg">Loading announcements...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Modal for submitting */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-6 rounded-lg flex items-center gap-3"
            >
              <Loader2 className="animate-spin" size={24} />
              <span className="text-lg">Creating announcement...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Announcement</h1>
        <div className="flex gap-4 items-center">
          <DateRangePicker />
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Announcement
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto py-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl w-[800px] my-auto relative"
            >
              <div className="sticky top-0 p-6 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl z-10">
                <h2 className="text-xl font-semibold text-gray-800">Create New Announcement</h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <AnnouncementForm onPost={handlePostAnnouncement} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <AnnouncementList 
          announcements={announcements} 
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default AnnouncementPage;
