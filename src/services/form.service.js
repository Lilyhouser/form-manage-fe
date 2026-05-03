import api from "./api";

export const getAllForms = async () => {
  const response = await api.get("/forms/");
  return response.data;
};

export const getActiveForms = async () => {
  const response = await api.get("/forms/active");
  return response.data;
};

export const getFormById = async (id) => {
  const response = await api.get(`/forms/${id}`);
  return response.data;
};

export const createForm = async (data) => {
  const response = await api.post("/forms/", data);
  return response.data;
};

export const updateForm = async (id, data) => {
  const response = await api.put(`/forms/${id}`, data);
  return response.data;
};

export const deleteForm = async (id) => {
  const response = await api.delete(`/forms/${id}`);
  return response.data;
};

export const submitForm = async (id, data) => {
  const response = await api.post(`/forms/${id}/submit`, data);
  return response.data;
};
