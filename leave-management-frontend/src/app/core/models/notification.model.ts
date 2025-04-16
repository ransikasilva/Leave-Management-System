export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt?: Date;
  referenceId?: string;
  referenceType?: string;
}
