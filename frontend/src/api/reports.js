// frontend/src/api/reports.js
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/reports";

export const fetchOverviewReport = async () => {
  const response = await axios.get(`${API_URL}/overview`);
  return response.data;
};

export const fetchClientReport = async (clientId) => {
  const response = await axios.get(
    `${API_URL}/by-client?cliente_id=${clientId}`
  );
  return response.data;
};

export const fetchStatusReport = async () => {
  const response = await axios.get(`${API_URL}/by-status`);
  return response.data;
};
