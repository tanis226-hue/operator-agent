export type LeadSource = "Website" | "Referral" | "Ads" | "Partner";
export type Owner = "Alex" | "Jordan" | "Casey" | "Taylor";
export type Stage =
  | "New Lead"
  | "Contacted"
  | "Qualified"
  | "Meeting Scheduled"
  | "Lost";
export type ConversionOutcome = "booked_meeting" | "stalled" | "lost";
export type Industry =
  | "Legal"
  | "Healthcare"
  | "Construction"
  | "Professional Services";
export type Region = "Northeast" | "South" | "Midwest" | "West";
export type Priority = "Low" | "Medium" | "High";

export type LeadRecord = {
  lead_id: string;
  lead_source: LeadSource;
  owner: Owner;
  created_date: string;
  first_response_hours: number;
  current_stage: Stage;
  days_in_stage: number;
  missed_followup_flag: boolean;
  missing_info_flag: boolean;
  handoff_count: number;
  conversion_outcome: ConversionOutcome;
  estimated_deal_value: number;
  is_stalled: boolean;
  // optional columns
  industry?: Industry;
  region?: Region;
  priority?: Priority;
};

export type DataLoadResult = {
  records: LeadRecord[];
  rowCount: number;
  warnings: string[];
};
