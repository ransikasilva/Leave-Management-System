export interface LeaveRequest {
  id?: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  duration?: number;
  reason?: string;
  status?: string;
  approverId?: string;
  approvedTime?: Date;
  approverComments?: string;
  createdAt?: Date;
  updatedAt?: Date;
  halfDay?: boolean;
  halfDayType?: string;
  urgent?: boolean;
  cancelled?: boolean;
  cancelledTime?: Date;
  cancellationReason?: string;
  contactDetails?: string;
}
