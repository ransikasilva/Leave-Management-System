export interface LeaveType {
  id?: string;
  name: string;
  description?: string;
  defaultDays: number;
  paidLeave: boolean;
  requiresApproval: boolean;
  active: boolean;
  allowHalfDay: boolean;
  carryForward?: boolean;
  maxCarryForwardDays?: number;
}
