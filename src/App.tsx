import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { NotificationProvider } from "./context/NotificationContext";
import "react-toastify/dist/ReactToastify.css";
import { ApiFeedbackProvider } from "./context/ApiFeedbackContext";

export default function App() {
  return (
    <BrowserRouter>
      <ApiFeedbackProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </ApiFeedbackProvider>
    </BrowserRouter>
  );
}