export const getTokenRole = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64))?.role ?? null;
  } catch {
    return null;
  }
};
