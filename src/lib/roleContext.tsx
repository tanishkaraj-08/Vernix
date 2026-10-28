import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Bureau, SystemUser } from '../types';
import { DEMO_USERS } from '../data/officers';

interface RoleContextType {
  currentUser: SystemUser;
  currentRole: UserRole;
  currentBureauFilter: Bureau | 'ALL';
  setRole: (role: UserRole) => void;
  setUser: (user: SystemUser) => void;
  setBureauFilter: (bureau: Bureau | 'ALL') => void;
  canUpdateStatus: boolean;
  canDismissOverlap: boolean;
  canCreateCoordination: boolean;
  canManageSettings: boolean;
  canRegisterComplaint: boolean;
  isAuditor: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'verinex_aicte_user_v1';
const BUREAU_FILTER_KEY = 'verinex_aicte_bureau_filter_v1';

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SystemUser>(() => {
    try {
      const saved = localStorage.getItem(ROLE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_USERS[0]; // Admin by default
  });

  const [currentBureauFilter, setCurrentBureauFilter] = useState<Bureau | 'ALL'>(() => {
    try {
      const saved = localStorage.getItem(BUREAU_FILTER_KEY);
      if (saved) return saved as Bureau | 'ALL';
    } catch {}
    return 'ALL';
  });

  const handleSetRole = (role: UserRole) => {
    const matchingUser = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(matchingUser);
    localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(matchingUser));
  };

  const handleSetUser = (user: SystemUser) => {
    setCurrentUser(user);
    localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(user));
  };

  const handleSetBureauFilter = (bureau: Bureau | 'ALL') => {
    setCurrentBureauFilter(bureau);
    localStorage.setItem(BUREAU_FILTER_KEY, bureau);
  };

  const currentRole = currentUser.role;

  // Permissions logic
  const isAuditor = currentRole === 'AUDITOR';
  const canUpdateStatus = currentRole === 'ADMIN' || currentRole === 'BUREAU_HEAD' || currentRole === 'CASE_OFFICER';
  const canDismissOverlap = currentRole === 'ADMIN' || currentRole === 'BUREAU_HEAD';
  const canCreateCoordination = currentRole === 'ADMIN' || currentRole === 'BUREAU_HEAD' || currentRole === 'CASE_OFFICER';
  const canManageSettings = currentRole === 'ADMIN';
  const canRegisterComplaint = currentRole !== 'AUDITOR';

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        currentRole,
        currentBureauFilter,
        setRole: handleSetRole,
        setUser: handleSetUser,
        setBureauFilter: handleSetBureauFilter,
        canUpdateStatus,
        canDismissOverlap,
        canCreateCoordination,
        canManageSettings,
        canRegisterComplaint,
        isAuditor,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

