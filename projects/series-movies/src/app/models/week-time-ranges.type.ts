import { TimeRange } from "../../../../../shared/models/time-range.type";

export type WeekTimeRanges = {
  monday?: TimeRange[] | null;
  tuesday?: TimeRange[] | null;
  wednesday?: TimeRange[] | null;
  thursday?: TimeRange[] | null;
  friday?: TimeRange[] | null;
  saturday?: TimeRange[] | null;
  sunday?: TimeRange[] | null;
};
