import api from "./axiosInstance";

export const apiCreateOrder       = (data)        => api.post("/orders",               data);
export const apiGetAllOrders      = ()             => api.get("/orders");
export const apiGetMyOrders       = ()             => api.get("/orders/my");
export const apiUpdateOrderStatus = (id, status)  => api.put(`/orders/${id}/status`,  { status });
