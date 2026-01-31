'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface BreadcrumbOverride {
  [path: string]: string;
}

interface BreadcrumbContextValue {
  overrides: BreadcrumbOverride;
  setBreadcrumb: (path: string, title: string) => void;
  clearBreadcrumb: (path: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(
  undefined,
);

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [overrides, setOverrides] = useState<BreadcrumbOverride>({});

  const setBreadcrumb = useCallback((path: string, title: string) => {
    setOverrides((prev) => ({
      ...prev,
      [path]: title,
    }));
  }, []);

  const clearBreadcrumb = useCallback((path: string) => {
    setOverrides((prev) => {
      const newOverrides = { ...prev };
      delete newOverrides[path];
      return newOverrides;
    });
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{ overrides, setBreadcrumb, clearBreadcrumb }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb(path: string, title: string) {
  const context = useContext(BreadcrumbContext);

  if (!context) {
    throw new Error('useBreadcrumb must be used within BreadcrumbProvider');
  }

  const { setBreadcrumb, clearBreadcrumb } = context;

  React.useEffect(() => {
    setBreadcrumb(path, title);

    return () => {
      clearBreadcrumb(path);
    };
  }, [path, title, setBreadcrumb, clearBreadcrumb]);
}

export function useBreadcrumbContext() {
  const context = useContext(BreadcrumbContext);

  if (!context) {
    throw new Error(
      'useBreadcrumbContext must be used within BreadcrumbProvider',
    );
  }

  return context;
}
