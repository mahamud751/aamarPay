export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export enum UserRole {
  superAdmin = "superAdmin",
  admin = "admin",
  user = "user",
  manager = "manager",
  vendor = "vendor",
  rider = "rider",
  schoolManager = "schoolManager",
  b2bManager = "b2bManager",
}

export enum UserStatus {
  active = "active",
  blocked = "blocked",
  deactive = "deactive",
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  referralCode?: string | null;
  gender?: Gender;
  password?: string | null;
  address?: string | null;
  role: UserRole;
  branchId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: UserStatus;
  photos?: { title: string; src: string }[];
  lastVisited?: string[];
  provider?: string | null;
  providerId?: string | null;
  permissions?: Permission[];
}

export enum Category {
  Conference = "Conference",
  Workshop = "Workshop",
  Social = "Social",
  Other = "Other",
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: Category;
  isUserCreated: boolean;
  rsvpCount: number;
  userId?: string;
  user?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  location: string;
  category: Category;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  category?: Category;
}

export interface EventResponse {
  message: string;
  event: Event;
}

export interface EventsResponse {
  data: Event[];
  total: number;
}

export interface Notification {
  id: string;
  userEmail: string;
  message: string;
  status: "read" | "unread";
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  userEmail: string;
  message?: string;
  status?: "read" | "unread";
}

export interface UpdateNotificationStatusDto {
  status: "read" | "unread";
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
}

export interface Permission {
  id: string;
  name: string;
  users?: { id: string; email: string }[];
}

export interface CreatePermissionDto {
  name: string;
  users?: string[];
}

export interface UpdatePermissionDto {
  name?: string;
}

export interface PermissionsResponse {
  data: Permission[];
  total: number;
}

export interface AuditLog {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}
