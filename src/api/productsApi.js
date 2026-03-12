import api from "./axiosInstance";

const multipart = (data) =>
  data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};

export const apiGetProducts   = (params)   => api.get("/products", { params });
export const apiGetAllProducts = (params)  => api.get("/products", { params: { new: true, ...params } });
export const apiGetProduct    = (id)       => api.get(`/products/${id}`);
export const apiCreateProduct = (data)     => api.post("/products",       data, multipart(data));
export const apiUpdateProduct = (id, data) => api.put(`/products/${id}`,  data, multipart(data));
export const apiDeleteProduct = (id)       => api.delete(`/products/${id}`);
export const apiUploadImage   = (formData) =>
  api.post("/products/upload-image", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const apiDeleteImage   = (publicId) =>
  api.delete("/products/delete-image", { data: { publicId } });
