/**
 * Domain types for messages (tickets).
 *
 * The previous codebase had four near-duplicate `Message` interfaces (Board,
 * MessageModal, NewMessage component, ShareModal) plus inline `any`s for
 * `creator` and `status`. This is the canonical shape. Optional fields reflect
 * what each consumer actually uses today.
 */

import type { Department, UserSummary } from "./user";
import type { User } from "./user";

export type Priority = "Niedrig" | "Mittel" | "Hoch";

export interface Attachment {
  id: number;
  path: string;
  url?: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export interface Comment {
  id: number;
  message_id: number;
  user: UserSummary;
  content: string;
  created_at: string;
}

export interface Activity {
  id: number;
  user: UserSummary;
  assignee: UserSummary;
  action: string;
  created_at: string;
}

export interface MessageCreator {
  id: number;
  name: string;
  department: { name: string } | null;
}

export interface MessageAssignee extends UserSummary {
  department: { id: number; name: string; color: string };
}

export interface MessageStatusRef {
  id?: number;
  name: string;
  color: string;
}

export interface Message {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  attachments: Attachment[];
  chat_messages: Comment[];
  activities: Activity[];
  creator: MessageCreator;
  status: MessageStatusRef;
  status_id: number;
  assignees: MessageAssignee[];
  assignee: { id: number; name: string } | null;
  is_archived: boolean;
  is_announcement: boolean;
  department?: Department;
}

/**
 * Permission helpers for messages.
 *
 * Rules:
 *   - Edit: only the sender (creator) and the receiver (assignee).
 *   - Interact (comment, share): sender, receiver, and subscribers (assignees).
 *   - Assign-to-me: sender/receiver/subscriber may claim the ticket if there
 *     is no receiver yet; the current receiver may always unassign themselves.
 */
export const canEditMessage = (
  msg: Message | null,
  user: User | null
): boolean => {
  if (!user || !msg) return false;
  if (msg.creator?.id === user.id) return true;
  if (msg.assignee?.id === user.id) return true;
  return false;
};

export const canInteractWithMessage = (
  msg: Message | null,
  user: User | null
): boolean => {
  if (!user || !msg) return false;
  if (canEditMessage(msg, user)) return true;
  return msg.assignees?.some(a => a.id === user.id) ?? false;
};

export const canAssignToMe = (
  msg: Message | null,
  user: User | null
): boolean => {
  if (!user || !msg) return false;
  // The current receiver can always toggle themselves off.
  if (msg.assignee?.id === user.id) return true;
  // When the slot is open, any actor who can interact with the message
  // (sender / receiver / subscriber) may claim it.
  if (msg.assignee == null) return canInteractWithMessage(msg, user);
  return false;
};