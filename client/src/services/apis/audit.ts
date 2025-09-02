import API from "./api";
import { AuditLog } from "../types/Types";

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await API.get("/audit-logs");
  return response.data;
};
