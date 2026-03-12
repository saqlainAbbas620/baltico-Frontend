import api from "./axiosInstance";

const multipart = (data) =>
  data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};

export const apiGetBanner           = ()          => api.get("/cms/banner");
export const apiUpdateBanner        = (data)      => api.put("/cms/banner", data, multipart(data));
export const apiGetCategoryImages   = ()          => api.get("/cms/categories");
export const apiUpdateCategoryImage = (cat, data) =>
  api.put(`/cms/categories/${cat}`, data, multipart(data));
