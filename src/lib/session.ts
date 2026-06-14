export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "ssr-session";
  }
  
  let sessionId = localStorage.getItem("relife_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("relife_session_id", sessionId);
  }
  
  return sessionId;
}
