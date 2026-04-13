"use client";

import AnnouncementForm from "@/components/announcement/AnnouncementForm";
import AnnouncementList from "@/components/announcement/AnnouncementList";
import DateRangePicker from "@/components/announcement/DatePicker";
import { NotificationResponse, notificationService } from "@/app/services/notification.service";
import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { LoadingModal } from "@/components/ui/loading-modal";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

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

  const handlePostAnnouncement = async (newAnnouncement: NotificationResponse) => {
    setIsSubmitting(true);
    try {
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
      setIsFormOpen(false);
      toast.success('Announcement created successfully');
      await fetchAnnouncements(currentPage);
    } catch (error) {
      console.error('Failed to post announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <LoadingModal isOpen={isLoading} message="Loading announcements..." />
      <LoadingModal isOpen={isSubmitting} message="Creating announcement..." />

      <PageHeader
        title="Announcements"
        subtitle="Create and manage platform-wide announcements"
        action={
          <div className="flex items-center gap-3">
            <DateRangePicker />
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {/* Create Announcement Modal */}
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

        {!isLoading && (
          <AnnouncementList
            announcements={announcements}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isRefreshing={isRefreshing}
          />
        )}
      </div>
    </div>
  );
};

export default AnnouncementPage;
