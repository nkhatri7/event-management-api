export interface Event {
  id: number;
  userId: number;
  venueId: number;
  day: number;
  month: number;
  year: number;
  startTime: number;
  endTime: number;
  guests: number;
  isCancelled: boolean;
}
