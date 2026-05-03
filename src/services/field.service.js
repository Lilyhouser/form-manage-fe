import api from "./api";

export const addFieldsToForm = async (formId, fields) => {
  const response = await api.post(`/forms/${formId}/fields/`, fields);
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
