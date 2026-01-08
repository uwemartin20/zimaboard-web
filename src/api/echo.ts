import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const pusherAppKey = import.meta.env.VITE_PUSHER_APP_KEY;

const echo = new Echo({
  broadcaster: "pusher",
  key: pusherAppKey,
  cluster: "eu",
  encrypted: true,
  forceTLS: true,
  authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  },
});

export default echo;
