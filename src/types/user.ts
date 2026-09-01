/**
 * Domain types for users, departments, statuses.
 * Single source of truth for the shape consumed across components.
 *
 * Where fields are optional in some call sites but always present in others,
 * we keep them required and let consumers tolerate `undefined` if they really
 * need to (the alternative — marking everything optional — makes every consumer
 * defensive and re-introduces duplication).
 */

export interface DepartmentRef {
  id: number;
  name: string;
}

export interface Department extends DepartmentRef {
  color: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email?: string;
}

export interface MessageStatus {
  id: number;
  name: string;
  color: string;
}

export interface UserDepartment {
  id: number;
  name: string;
  color: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  department_id?: number | null;
  department: UserDepartment;
  is_admin: boolean;
}