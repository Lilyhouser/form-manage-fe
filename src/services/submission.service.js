import api from "./api";

export const getMySubmissions = async () => {
  const response = await api.get("/submissions/");
  return response.data;
};
