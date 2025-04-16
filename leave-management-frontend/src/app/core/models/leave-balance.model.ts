export interface LeaveBalance {
  id?: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalAllocated: number;
  used: number;
  pending: number;
  available: number;
  carryForwarded: number;
  adjustment?: number;
  history?: LeaveBalanceHistory[];
}

export interface LeaveBalanceHistory {
  date: Date;
  action: string;
  value: number;
  referenceId?: string;
  description?: string;
}
