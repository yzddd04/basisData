import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RefreshContextType {
  refreshBooks: () => void;
  refreshMembers: () => void;
  refreshStaff: () => void;
  refreshTrash: () => void;
  bookRefreshKey: number;
  memberRefreshKey: number;
  staffRefreshKey: number;
  trashRefreshKey: number;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookRefreshKey, setBookRefreshKey] = useState(0);
  const [memberRefreshKey, setMemberRefreshKey] = useState(0);
  const [staffRefreshKey, setStaffRefreshKey] = useState(0);
  const [trashRefreshKey, setTrashRefreshKey] = useState(0);

  const refreshBooks = () => setBookRefreshKey(prev => prev + 1);
  const refreshMembers = () => setMemberRefreshKey(prev => prev + 1);
  const refreshStaff = () => setStaffRefreshKey(prev => prev + 1);
  const refreshTrash = () => setTrashRefreshKey(prev => prev + 1);

  return (
    <RefreshContext.Provider
      value={{
        refreshBooks,
        refreshMembers,
        refreshStaff,
        refreshTrash,
        bookRefreshKey,
        memberRefreshKey,
        staffRefreshKey,
        trashRefreshKey,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}; 