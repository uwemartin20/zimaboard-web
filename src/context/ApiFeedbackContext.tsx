import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { notificationBus } from "../api/notificationBus";

type ApiMessageType = "success" | "error" | "loading";

interface ApiMessage {
  text: string;
  type: ApiMessageType;
}

interface ApiFeedbackContextValue {
  message: ApiMessage | null;
  clear: () => void;
}

const ApiFeedbackContext = createContext<ApiFeedbackContextValue | null>(null);

export function ApiFeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ApiMessage | null>(null);
  const timerRef = useRef<number | null>(null);

  const clear = () => {
    setMessage(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    notificationBus.register(
      text => {
        setMessage({ text, type: "success" });
      },
      text => {
        setMessage({ text, type: "error" });
      },
      text => {
        if (text) {
          setMessage({ text, type: "loading" });
        } else {
          setMessage(null);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (!message) return;

    timerRef.current = window.setTimeout(() => {
      clear();
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [message]);

  return (
    <ApiFeedbackContext.Provider value={{ message, clear }}>
      {children}

      {/* UI */}
      {message && (
        <div
          className={`
            fixed bottom-6 right-6 z-50
            px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-3
            ${message.type === "success" ? "bg-green-600" : message.type === "error" ? "bg-red-600" : "bg-blue-600"}
          `}
        >
            {message.type === "loading" && (
                <span
                    className="inline-block w-5 h-5 border-4 border-white border-t-transparent border-r-transparent rounded-full animate-spin"
                    role="status"
                />
            )}
          {message.text}
        </div>
      )}
    </ApiFeedbackContext.Provider>
  );
}

export function useApiFeedback() {
  const ctx = useContext(ApiFeedbackContext);
  if (!ctx) {
    throw new Error("useApiFeedback must be used within ApiFeedbackProvider");
  }
  return ctx;
}
