import { createContext, useContext, useState } from "react";

interface UnreadContextType {
  count: number;
  increment: () => void;
  reset: () => void;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export const UnreadProvider = ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const reset = () => setCount(0);

  return (
    <UnreadContext.Provider value={{ count, increment, reset }}>
      {children}
    </UnreadContext.Provider>
  );
};

export const useUnread = () => {
  const ctx = useContext(UnreadContext);
  if (!ctx) throw new Error("useUnread must be used within UnreadProvider");
  return ctx;
};
