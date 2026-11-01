export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  email: string;
}

export interface EventPreferences {
  event_days?: number;
  budget_flexibility?: string;
  spending_priorities?: string[];
  theme?: string;
  decor_style?: string;
  color_palette?: string;
  food_preference?: string;
  indoor_outdoor?: string;
  cultural_preferences?: string;
  special_activities?: string;
  accessibility?: string;
  dietary_restrictions?: string;
  notes?: string;
  additional_notes?: string;
}

export interface EventItem {
  id: number;
  user_id: number;
  event_name: string;
  event_type: string;
  event_date: string;
  location: string;
  guest_count: number;
  total_budget: number;
  currency: string;
  preferences: EventPreferences;
  status: string; // 'Draft' | 'Planning' | 'Confirmed' | 'Completed'
  progress: number;
  ai_plan?: FullEventPlan;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: number;
  event_id: number;
  category: string;
  allocated_amount: number;
  estimated_amount: number;
  actual_amount: number;
  percentage: number;
  notes?: string;
  savings_tip?: string;
}

export interface BudgetOverview {
  total_budget: number;
  total_allocated: number;
  total_estimated: number;
  total_actual: number;
  remaining_balance: number;
  is_over_budget: boolean;
  categories: BudgetItem[];
}

export interface ExpenseItem {
  id: number;
  event_id: number;
  budget_id?: number | null;
  category: string;
  amount: number;
  description?: string;
  expense_date: string;
  created_at: string;
}

export interface TaskItem {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  category: string;
  start_date?: string | null;
  due_date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  completed_at?: string | null;
  created_at: string;
}

export interface VendorItem {
  id: number;
  event_id: number;
  name: string;
  category: string;
  contact_details?: {
    phone?: string;
    email?: string;
    website?: string;
    contact_person?: string;
  };
  estimated_quote: number;
  actual_quote: number;
  booking_status: 'NOT_CONTACTED' | 'CONTACTED' | 'QUOTED' | 'BOOKED' | 'DECLINED';
  payment_status: 'UNPAID' | 'ADVANCE_PAID' | 'FULLY_PAID';
  selection_criteria?: string;
  booking_deadline?: string | null;
  notes?: string;
}

export interface EventOverviewAI {
  concept: string;
  theme: string;
  description: string;
  recommended_format: string;
}

export interface BudgetItemAI {
  category: string;
  estimated_cost: number;
  percentage: number;
  explanation: string;
  cost_saving_suggestions: string;
}

export interface TimelineTaskAI {
  task: string;
  description: string;
  start_date: string;
  due_date: string;
  priority: string;
  completion_status: string;
}

export interface VendorRequirementAI {
  category: string;
  selection_criteria: string;
  estimated_price_range: string;
  booking_deadline: string;
  contact_status: string;
  booking_status: string;
}

export interface PersonalizedIdeasAI {
  themes: string[];
  decorations: string[];
  activities: string[];
  entertainment: string[];
  food_arrangements: string[];
  guest_experiences: string[];
  unique_highlights: string[];
}

export interface RiskItemAI {
  risk_factor: string;
  severity: string;
  impact_description: string;
  mitigation_strategy: string;
}

export interface FullEventPlan {
  overview: EventOverviewAI;
  budget_breakdown: BudgetItemAI[];
  timeline: TimelineTaskAI[];
  vendor_checklist: VendorRequirementAI[];
  personalized_ideas: PersonalizedIdeasAI;
  risk_management: RiskItemAI[];
}

export interface ProposedEventChange {
  change_type: string;
  description: string;
  payload: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  proposed_changes?: ProposedEventChange[];
  created_at?: string;
}
