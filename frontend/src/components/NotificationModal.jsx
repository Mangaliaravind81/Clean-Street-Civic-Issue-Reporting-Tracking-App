import React from "react";
import { X, Bell, CheckCheck, Trash2 } from "lucide-react";

const NotificationModal = ({ notifications, onClose, onMarkRead, onMarkAllRead, onDelete }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex justify-end">
            <button 
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Bell size={48} className="mb-4 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification._id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  notification.is_read 
                    ? "bg-white border-gray-100" 
                    : "bg-green-50/50 border-green-100 shadow-sm"
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notification.is_read ? "bg-transparent" : "bg-green-500"}`} />
                  <div className="flex-1">
                    <p className={`text-sm ${notification.is_read ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                      {!notification.is_read && (
                        <button 
                          onClick={() => onMarkRead(notification._id)}
                          className="text-green-600 font-semibold hover:underline cursor-pointer"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            Clean Street Notification Center
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
