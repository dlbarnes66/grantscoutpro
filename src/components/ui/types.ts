export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export interface TableProps {
  columns: string[];
  rows: (string | number | React.ReactNode)[][];
}

export interface TabItem {
  label: string;
  content: React.ReactNode;
}

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}
