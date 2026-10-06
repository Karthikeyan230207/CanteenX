import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const STUDENT_APP_ORIGIN =
  import.meta.env.VITE_STUDENT_APP_ORIGIN || "https://canteenxadmin.vercel.app";

function AdminAuthReceiver() {
  const navigate = useNavigate();
  const { completeLogin } = useAdminAuth();

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.origin !== STUDENT_APP_ORIGIN ||
        event.source !== window.opener ||
        event.data?.type !== "ADMIN_AUTH_SESSION"
      ) {
        return;
      }

      const { token, admin } = event.data;
      if (!token || admin?.role !== "admin") return;

      completeLogin(token, admin);
      event.source.postMessage({ type: "ADMIN_AUTH_ACCEPTED" }, STUDENT_APP_ORIGIN);
      navigate("/reports", { replace: true });
    };

    window.addEventListener("message", handleMessage);

    if (window.opener) {
      window.opener.postMessage({ type: "ADMIN_AUTH_READY" }, STUDENT_APP_ORIGIN);
    } else {
      navigate("/login", { replace: true });
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [completeLogin, navigate]);

  return (
    <main className="admin-auth-receiver" role="status">
      Connecting to the admin portal...
    </main>
  );
}

export default AdminAuthReceiver;