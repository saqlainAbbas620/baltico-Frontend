import api from "./axiosInstance";

export const apiLogin      = (email, password)       => api.post("/auth/login",    { email, password });
export const apiRegister   = (name, email, password) => api.post("/auth/register", { name, email, password });
export const apiProfile    = (data)                  => api.put("/auth/profile",   data);
export const apiGoogleAuth = (credential)            => api.post("/auth/google",   { credential });
export const apiRefresh    = ()                      => api.post("/auth/refresh");
export const apiLogout     = ()                      => api.post("/auth/logout");
export const apiResendVerification = (email)         => api.post("/auth/resend-verification", { email });
export const apiGetAllUsers        = ()              => api.get("/auth/admin/users");
