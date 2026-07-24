import Badge from "@/components/common/Badge";
import { MEMBER_STATUS } from "@/config/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const variant =
    status === MEMBER_STATUS.ACTIVE
      ? "success"
      : status === MEMBER_STATUS.PENDING
        ? "info"
        : status === MEMBER_STATUS.LEAVE
          ? "warning"
          : status === MEMBER_STATUS.REMOVED
            ? "danger"
            : "neutral";

  return (
    <Badge
      variant={variant}
      className={className}
    >
      {status}
    </Badge>
  );
}