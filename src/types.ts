export interface HPSItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  ppnPercent: number; // e.g. 11 for 11% PPN
  pphType: "none" | "pph22" | "pph23"; // PPh 22 is 1.5%, PPh 23 is 2% for services
}

export type ProcurementCategory = "goods" | "construction" | "services" | "consultancy";

export type ProcurementMethod = "direct_proc" | "e_purchasing" | "tender" | "direct_appointment";

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  completed: boolean;
  notes: string;
  regulatorySource: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DocumentDraft {
  id: string;
  title: string;
  docType: "spek_teknis" | "kak" | "klausul_kontrak" | "kriteria_evaluasi";
  content: string;
  createdAt: string;
  packageName: string;
  budget: number;
  procType: ProcurementCategory;
}

export interface SavedTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
}
