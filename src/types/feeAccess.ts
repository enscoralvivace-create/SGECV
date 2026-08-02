export interface FeeAccessState {
  isLoadingAccess: boolean;
  accessError: string;
  canManageFees: boolean;
  canViewAllFees: boolean;
  canViewOwnFees: boolean;
  accessMemberId: number | null;
}
