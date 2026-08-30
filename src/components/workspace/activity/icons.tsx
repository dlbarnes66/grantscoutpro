import {
  UserPlusIcon,
  UserMinusIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

export function getActivityIcon(type: string) {
  switch (type) {
    case "member_invited":
      return UserPlusIcon;
    case "member_removed":
      return UserMinusIcon;
    case "file_uploaded":
      return DocumentIcon;
    case "semantic_search":
      return MagnifyingGlassIcon;
    case "rag_chat":
      return ChatBubbleLeftRightIcon;
    default:
      return BellAlertIcon;
  }
}
