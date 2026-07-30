export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface MentionItem {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
}

export interface MemberItem {
  id: string;
  name: string;
  role: "Owner" | "Editor" | "Reviewer" | "Viewer";
}
