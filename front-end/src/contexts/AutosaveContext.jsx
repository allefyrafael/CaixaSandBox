import React, { createContext, useContext, useState } from 'react';

const AutosaveContext = createContext(null);

export const AutosaveProvider = ({ children }) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  return (
    <AutosaveContext.Provider
      value={{
        saving,
        setSaving,
        lastSaved,
        setLastSaved,
        saveError,
        setSaveError,
        isDirty,
        setIsDirty,
      }}
    >
      {children}
    </AutosaveContext.Provider>
  );
};

export const useAutosave = () => {
  const context = useContext(AutosaveContext);
  // Retorna null se não estiver dentro do provider (ao invés de lançar erro)
  return context;
};

