import { useEffect, useState } from "react";
import api from "../api/client";
import SummaryCard from "../components/SummaryCard";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  title: string;
  status: { name: string; color: string };
  priority: string;
    creator: { name: string; department: { name: string, color: string } };
}

export default function Dashboard() {
  const [assigned, setAssigned] = useState<Message[]>([]);
  const [created, setCreated] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Message[]>([]);

  const [assignedCount, setAssignedCount] = useState<number>(0);
  const [createdCount, setCreatedCount] = useState<number>(0);
  const [announcementsCount, setAnnouncementsCount] = useState<number>(0);
  const navigate = useNavigate();
//   const user = getUser();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setAssigned(res.data.assigned.latest);
        setCreated(res.data.created.latest);
        setAnnouncements(res.data.announcements.latest);

        setAssignedCount(res.data.assigned.total);
        setCreatedCount(res.data.created.total);
        setAnnouncementsCount(res.data.announcements.total);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
        title="Meine Nachrichten"
        messages={assigned}
        count={assignedCount}
        onClick={() => navigate("/assigned")}
        />

        <SummaryCard
        title="Zugewiesene Nachrichten"
        messages={created}
        count={createdCount}
        onClick={() => navigate("/created")}
        />

        <SummaryCard
        title="Pin Wand"
        messages={announcements}
        count={announcementsCount}
        onClick={() => navigate("/announcement")}
        />
    </div>
  );
}
