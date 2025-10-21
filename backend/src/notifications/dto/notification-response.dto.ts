export class NotificationResponseDto {
  id: string;
  userId?: string;
  doctorId?: string;
  adminId?: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;

  // Relations
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}