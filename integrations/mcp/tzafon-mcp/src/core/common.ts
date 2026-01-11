export interface TzafonToolResult {
  status: "success" | "error";
  message: string | null;
  data: any | null;
}
