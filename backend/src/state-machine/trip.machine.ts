export enum TripStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  DRIVER_ARRIVING = "DRIVER_ARRIVING",
  DRIVER_ARRIVED = "DRIVER_ARRIVED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

type TransitionMap = Record<TripStatus, TripStatus[]>;

const transitions: TransitionMap = {
  PENDING: [
    TripStatus.ASSIGNED,
    TripStatus.CANCELLED,
    TripStatus.EXPIRED,
  ],
  ASSIGNED: [
    TripStatus.DRIVER_ARRIVING,
    TripStatus.CANCELLED,
  ],
  DRIVER_ARRIVING: [
    TripStatus.DRIVER_ARRIVED,
    TripStatus.CANCELLED,
  ],
  DRIVER_ARRIVED: [
    TripStatus.IN_PROGRESS,
    TripStatus.CANCELLED,
  ],
  IN_PROGRESS: [
    TripStatus.COMPLETED,
  ],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export function canTransition(from: TripStatus, to: TripStatus) {
  return transitions[from]?.includes(to) ?? false;
}