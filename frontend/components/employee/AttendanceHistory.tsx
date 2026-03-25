'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Attendance } from '@/types';

interface AttendanceHistoryProps {
  employeeId: string;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ employeeId }) => {
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 5;

  const fetchHistory = async (currentSkip: number, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const data = await api.getAttendanceByEmployee(employeeId, currentSkip, LIMIT);
      
      if (isInitial) {
        setHistory(data);
      } else {
        setHistory(prev => [...prev, ...data]);
      }

      setHasMore(data.length === LIMIT);
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
      setError('Failed to load attendance records. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setSkip(0);
    fetchHistory(0, true);
  }, [employeeId]);

  const handleLoadMore = () => {
    const nextSkip = skip + LIMIT;
    setSkip(nextSkip);
    fetchHistory(nextSkip);
  };

  if (error) {
    return (
      <div className="py-8 text-center space-y-4">
        <p className="text-red-500 font-medium italic">{error}</p>
        <button 
          onClick={() => fetchHistory(0, true)}
          className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl border border-gray-100" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 font-medium italic">
        No attendance records found for this employee.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {history.map((record) => (
          <div 
            key={record.id} 
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-800 tracking-tight">
                {new Date(record.attendance_date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Attendance Record
              </span>
            </div>
            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
              record.status === 'Present' 
                ? 'bg-green-50 text-green-600 border-green-100' 
                : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {record.status}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loadingMore ? (
              <>Loading...</>
            ) : (
              <>
                Load More History
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
