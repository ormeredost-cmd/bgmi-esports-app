import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import "./NotificationBell.css";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // ==========================================
  // LOGGED-IN USER
  // ==========================================
  let storedUser = null;
  try {
    storedUser = JSON.parse(
      localStorage.getItem("bgmi_user") || "null"
    );
  } catch (error) {
    console.error("User localStorage parsing error:", error);
  }

  const profileId =
    storedUser?.profile_id ||
    storedUser?.user?.profile_id;

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================
  const fetchNotifications = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Notification fetch error:", error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(
        (data || []).filter((n) => !n.is_read).length
      );
    } catch (error) {
      console.error("Notification fetch exception:", error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // ==========================================
  // PERMANENT REALTIME LISTENER (Runs globally once mounted)
  // ==========================================
  useEffect(() => {
    if (!profileId) return;

    // Pehli baar purani notifications load karo
    fetchNotifications();

    // Realtime connection setup
    const channel = supabase
      .channel(`global-notifications-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const newNotif = payload.new;

          setNotifications((previous) => {
            if (previous.some((n) => n.id === newNotif.id)) {
              return previous;
            }
            return [newNotif, ...previous].slice(0, 10);
          });

          setUnreadCount((previous) => previous + 1);

          // 🌟 Yeh raha live toast jo menu band hone par bhi screen par dikhega!
          setActiveToast(newNotif);

          // 7 second baad toast khud hat jayega
          setTimeout(() => {
            setActiveToast((current) => (current?.id === newNotif.id ? null : current));
          }, 7000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchNotifications]);

  // ==========================================
  // TOUCH / SWIPE HANDLERS FOR TOAST
  // ==========================================
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current - touchEndX.current > 40 ||
      touchEndX.current - touchStartX.current > 40
    ) {
      setActiveToast(null);
    }
  };

  // ==========================================
  // MARK AS READ
  // ==========================================
  const markAsRead = async () => {
    if (!profileId || unreadCount === 0) return;

    try {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
      if (unreadIds.length === 0) return;

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("profile_id", profileId)
        .in("id", unreadIds);

      setNotifications((previous) =>
        previous.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  const handleToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      await markAsRead();
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!profileId) return null;

  return (
    <>
      {/* 🌟 GLOBAL GAMING TOAST POPUP (Yeh ab menu band hone par bhi upar dikhega) */}
      {activeToast && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 99999,
            width: "330px",
            background: "#121212",
            border: "1px solid #ff4d4d",
            borderRadius: "10px",
            boxShadow: "0px 10px 30px rgba(255, 77, 77, 0.5)",
            padding: "15px",
            color: "#fff",
            cursor: "grab",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#ff4d4d" }}>
              🔔 {activeToast.title}
            </span>
            <button
              onClick={() => setActiveToast(null)}
              style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ fontSize: "12px", color: "#ccc", marginBottom: "10px" }}>
            {activeToast.message}
          </div>

          {activeToast.room_id && (
            <div style={{ background: "#1a1a1a", border: "1px solid #333", padding: "8px", borderRadius: "6px", fontFamily: "monospace", fontSize: "13px", color: "#4cd137" }}>
              <b>Room ID:</b> {activeToast.room_id} <br />
              <b>Password:</b> {activeToast.room_password || "Not available"}
            </div>
          )}

          <div style={{ fontSize: "10px", color: "#777", textAlign: "right", marginTop: "8px" }}>
            👉 Swipe karke hatayein
          </div>
        </div>
      )}

      {/* NOTIFICATION BELL & DROPDOWN */}
      <div className="notification-container">
        <button
          type="button"
          className="notification-bell-button"
          onClick={handleToggle}
          aria-label="Open notifications"
          aria-expanded={isOpen}
        >
          <span className="notification-bell-icon">🔔</span>
          <span className="notification-bell-label">Notifications</span>
          {unreadCount > 0 && (
            <span className="notification-unread-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <div>
                <h3>Notifications</h3>
                <span>{notifications.length} recent notifications</span>
              </div>
              <button
                type="button"
                className="notification-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="notification-empty">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <span className="notification-empty-icon">🔔</span>
                  <strong>No notifications yet</strong>
                  <p>Tournament updates will appear here.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-card ${
                      !n.is_read ? "notification-unread" : ""
                    }`}
                  >
                    <div className="notification-card-top">
                      <span className="notification-status-dot" />
                      <span className="notification-date">
                        {formatDate(n.created_at)}
                      </span>
                    </div>

                    <h4>{n.title}</h4>
                    <p className="notification-message">{n.message}</p>

                    {n.room_id && (
                      <div className="notification-room-details">
                        <div className="notification-room-row">
                          <span>Room ID</span>
                          <strong>{n.room_id}</strong>
                        </div>
                        <div className="notification-room-row">
                          <span>Password</span>
                          <strong>{n.room_password || "Not available"}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="notification-footer">
              <span>BGMI ESPORTS</span>
              <span>Stay Updated</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;