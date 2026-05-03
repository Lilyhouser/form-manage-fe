import api from "./api";

export const getAllForms = async () => {
  const response = await api.get("/forms/");
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

export const addFieldsToForm = async (formId, fields) => {
  const response = await api.post(`/forms/${formId}/fields/`, fields);
  return response.data;
};

export const updateForm = async (id, data) => {
  const response = await api.put(`/forms/${id}`, data);
  return response.data;
};

export const updateField = async (formId, fieldId, data) => {
  const response = await api.put(`/forms/${formId}/fields/${fieldId}`, data);
  return response.data;
};

export const deleteField = async (formId, fieldId) => {
  const response = await api.delete(`/forms/${formId}/fields/${fieldId}`);
  return response.data;
};

export const deleteForm = async (id) => {
  const response = await api.delete(`/forms/${id}`);
  return response.data;
};


