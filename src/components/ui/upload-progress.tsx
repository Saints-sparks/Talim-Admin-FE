import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  status: 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export function UploadProgress({ progress, status, errorMessage }: UploadProgressProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4 max-w-md w-full mx-4"
      >
        {status === 'uploading' && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-sky-700 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-medium text-gray-700"
            >
              Uploading... {progress}%
            </motion.div>
          </>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="flex flex-col items-center"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
            <p className="text-lg font-medium text-gray-700">Upload Complete!</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="flex flex-col items-center text-center"
          >
            <XCircle className="w-16 h-16 text-red-500 mb-2" />
            <p className="text-lg font-medium text-gray-700">Upload Failed</p>
            {errorMessage && (
              <p className="text-sm text-gray-500 mt-2">{errorMessage}</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 