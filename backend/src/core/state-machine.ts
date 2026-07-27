export type TripStatus =
  | "PENDING"
  | "MATCHING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED";

export const canTransition = (from: TripStatus, to: TripStatus) => {
  const map: Record<TripStatus, TripStatus[]> = {
    PENDING: ["MATCHING"],
    MATCHING: ["ASSIGNED"],
    ASSIGNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
    COMPLETED: [],
  };

  return map[from]?.includes(to);
};