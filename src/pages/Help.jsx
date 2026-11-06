
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import "./Help.css";

/* ==========================================
   SUPPORT SERVER API URL
========================================== */

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "[::1]";

const SUPPORT_API_URL = isLocalhost
  ? "http://localhost:5006"
  : "https://your-production-support-server.onrender.com";

/* ==========================================
   SUPABASE STORAGE BUCKET
========================================== */

const SUPPORT_STORAGE_BUCKET =
  process.env.REACT_APP_SUPPORT_BUCKET || "BGMI";

const Help = () => {
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* ==========================================
     PAGE BACKGROUND
  ========================================== */

  const pageBackground = {
    backgroundImage: `url("${process.env.PUBLIC_URL}/assets/mymatches-bg.webp")`,
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    backgroundColor: "#080208",
  };

  /* ==========================================
     LOAD USER
  ========================================== */

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("bgmi_user") ||
        sessionStorage.getItem("bgmi_user");

      if (!savedUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser?.profile_id && !parsedUser?.id) {
        setError(
          "Your account information is incomplete. Please login again."
        );
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({
        ...parsedUser,
        supportProfileId: parsedUser.profile_id || parsedUser.id,
      });
    } catch (err) {
      console.error("User information error:", err);
      setError("Unable to read your account. Please login again.");
      setLoading(false);
    }
  }, []);

  /* ==========================================
     SCROLL TO BOTTOM
  ========================================== */

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ==========================================
     CREATE OR GET SUPPORT CHAT
  ========================================== */

  useEffect(() => {
    if (!user?.supportProfileId) return;

    let cancelled = false;

    const getOrCreateChat = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${SUPPORT_API_URL}/api/support/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profile_id: user.supportProfileId,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Support chat load nahi ho paya."
          );
        }

        if (!cancelled) {
          setChat(result.chat);
        }
      } catch (err) {
        console.error("Support chat API error:", err);

        if (!cancelled) {
          setError(
            err.message || "Support chat connect nahi ho paya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getOrCreateChat();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /* ==========================================
     FETCH CHAT MESSAGES
  ========================================== */

  useEffect(() => {
    if (!chat?.id) return;

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setError("");

        const response = await fetch(
          `${SUPPORT_API_URL}/api/support/messages/${chat.id}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Messages load nahi ho paye."
          );
        }

        if (!cancelled) {
          setMessages(result.messages || []);
        }
      } catch (err) {
        console.error("Message loading error:", err);

        if (!cancelled) {
          setError(err.message || "Messages load nahi ho paye.");
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [chat]);

  /* ==========================================
     REALTIME MESSAGES
  ========================================== */

  useEffect(() => {
    if (!chat?.id) return;

    const channel = supabase
      .channel(`support-chat-${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          const newMessage = payload.new;

          setMessages((previous) => {
            const alreadyExists = previous.some(
              (item) => item.id === newMessage.id
            );

            if (alreadyExists) return previous;

            return [...previous, newMessage].sort(
              (a, b) =>
                new Date(a.created_at) -
                new Date(b.created_at)
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat]);

  /* ==========================================
     MARK ADMIN MESSAGES AS READ
  ========================================== */

  useEffect(() => {
    if (!chat?.id || !user?.supportProfileId) return;

    const markMessagesRead = async () => {
      try {
        const { error: messageReadError } = await supabase
          .from("support_messages")
          .update({ is_read: true })
          .eq("chat_id", chat.id)
          .eq("sender_type", "admin")
          .eq("is_read", false);

        if (messageReadError) throw messageReadError;

        const { error: chatReadError } = await supabase
          .from("support_chats")
          .update({ user_unread_count: 0 })
          .eq("id", chat.id);

        if (chatReadError) throw chatReadError;
      } catch (err) {
        console.error("Read status update error:", err);
      }
    };

    markMessagesRead();
  }, [chat, user, messages]);

  /* ==========================================
     TIME FORMAT
  ========================================== */

  const formatTime = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ==========================================
     SEND TEXT MESSAGE
  ========================================== */

  const sendMessage = async (event) => {
    event.preventDefault();

    const text = message.trim();

    if (
      !text ||
      sending ||
      !chat?.id ||
      !user?.supportProfileId
    ) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `${SUPPORT_API_URL}/api/support/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chat.id,
            sender_id: user.supportProfileId,
            sender_type: "user",
            message: text,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Message send nahi ho paya."
        );
      }

      setMessages((previous) => {
        const alreadyExists = previous.some(
          (item) => item.id === result.message.id
        );

        return alreadyExists
          ? previous
          : [...previous, result.message];
      });

      setMessage("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Send message error:", err);
      setError(err.message || "Message send nahi ho paya.");
    } finally {
      setSending(false);
    }
  };

  /* ==========================================
     IMAGE UPLOAD
  ========================================== */

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !chat?.id || !user?.supportProfileId) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Sirf image file upload kar sakte hain.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size 5MB se kam honi chahiye.");
      event.target.value = "";
      return;
    }

    setSending(true);
    setError("");

    try {
      console.log(
        "📁 SUPPORT STORAGE BUCKET:",
        SUPPORT_STORAGE_BUCKET
      );

      const fileExt =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName =
        `${user.supportProfileId}/${Date.now()}.${fileExt}`;

      /* UPLOAD IMAGE TO BGMI BUCKET */

      const { error: uploadError } = await supabase.storage
        .from(SUPPORT_STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      console.log("✅ IMAGE UPLOADED:", fileName);

      /* GENERATE PUBLIC IMAGE URL */

      const { data: publicUrlData } = supabase.storage
        .from(SUPPORT_STORAGE_BUCKET)
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData?.publicUrl;

      if (!imageUrl) {
        throw new Error("Image URL generate nahi ho paya.");
      }

      /* SEND IMAGE MESSAGE TO SUPPORT SERVER */

      const response = await fetch(
        `${SUPPORT_API_URL}/api/support/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chat.id,
            sender_id: user.supportProfileId,
            sender_type: "user",
            image_url: imageUrl,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Image send nahi ho payi."
        );
      }

      setMessages((previous) => {
        const alreadyExists = previous.some(
          (item) => item.id === result.message.id
        );

        return alreadyExists
          ? previous
          : [...previous, result.message];
      });

      console.log("✅ IMAGE MESSAGE SENT");
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err.message || "Image upload nahi ho payi.");
    } finally {
      setSending(false);
      event.target.value = "";
    }
  };

  /* ==========================================
     LOADING SCREEN
  ========================================== */

  if (loading) {
    return (
      <main className="support-page" style={pageBackground}>
        <div className="support-container">
          <section className="support-chat-card">
            <div className="support-loading">
              <div className="support-loading-spinner"></div>
              <p>Loading support chat...</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* ==========================================
     LOGIN REQUIRED
  ========================================== */

  if (!user) {
    return (
      <main className="support-page" style={pageBackground}>
        <div className="support-container">
          <section className="support-chat-card">
            <div className="support-login-required">
              <div className="support-welcome-icon">🔐</div>
              <h3>Login Required</h3>
              <p>
                Support chat use karne ke liye pehle apne
                account mein login karein.
              </p>

              {error && (
                <p className="support-error">{error}</p>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* ==========================================
     MAIN SUPPORT CHAT
  ========================================== */

  return (
    <main className="support-page" style={pageBackground}>
      <div className="support-container">
        <section className="support-chat-card">

          {/* CHAT HEADER */}

          <div className="support-chat-header">
            <div className="support-admin-info">
              <div className="support-admin-avatar">
                <span>BG</span>
              </div>

              <div className="support-admin-details">
                <h3>BGMI Support Team</h3>
                <p>
                  <span className="support-status-dot"></span>
                  Support chat
                </p>
              </div>
            </div>

            <div className="support-private-label">
              <span>🔒</span>
              PRIVATE CHAT
            </div>
          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="support-error">
              <span>⚠️</span>
              {error}

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          )}

          {/* CHAT BODY */}

          <div className="support-chat-body">
            <div className="support-date-divider">
              <span>TODAY</span>
            </div>

            {messages.length === 0 && (
              <div className="support-welcome">
                <div className="support-welcome-icon">🎮</div>
                <h3>Welcome to Player Support</h3>
                <p>
                  Your personal conversation with the BGMI
                  admin team. Send your message below and
                  our team will assist you.
                </p>
              </div>
            )}

            <div className="support-message-list">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`support-message-row ${
                    item.sender_type === "user"
                      ? "support-message-right"
                      : "support-message-left"
                  }`}
                >
                  {item.sender_type === "admin" && (
                    <div className="support-message-avatar">
                      BG
                    </div>
                  )}

                  <div className="support-message-content">
                    <div className="support-message-name">
                      {item.sender_type === "admin"
                        ? "BGMI Support"
                        : "You"}
                    </div>

                    <div className="support-message-bubble">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt="Support attachment"
                          className="support-message-image"
                        />
                      ) : (
                        item.message
                      )}
                    </div>

                    <div className="support-message-time">
                      {formatTime(item.created_at)}

                      {item.sender_type === "user" && (
                        <span className="support-message-tick">
                          {item.is_read ? " ✓✓" : " ✓"}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.sender_type === "user" && (
                    <div className="support-user-avatar">
                      {user.email?.[0]?.toUpperCase() ||
                        user.username?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* MESSAGE INPUT */}

          <form
            className="support-input-area"
            onSubmit={sendMessage}
          >
            <label
              className="support-attach-button"
              title="Send image"
            >
              📎

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={sending || !chat}
                hidden
              />
            </label>

            <div className="support-input-box">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Type your message here..."
                maxLength={1000}
                autoComplete="off"
                disabled={sending || !chat}
              />

              <span className="support-character-count">
                {message.length}/1000
              </span>
            </div>

            <button
              type="submit"
              className="support-send-button"
              disabled={
                !message.trim() || sending || !chat
              }
            >
              <span>➤</span>
              {sending ? "SENDING" : "SEND"}
            </button>
          </form>

          {/* FOOTER */}

          <div className="support-chat-footer">
            <span>🔒</span>
            Your conversation is private and visible only
            to you and Admin.
          </div>

        </section>
      </div>
    </main>
  );
};

export default Help;
