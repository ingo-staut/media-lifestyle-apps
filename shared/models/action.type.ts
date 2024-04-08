export type Action = {
  text: string;
  textReplace?: string;
  tooltip?: string;
  tooltipReplace?: string;
  icon: string;
  image?: string;
  id: string;
  hide?: boolean;
  hideIfCollapsed?: boolean;
  hideIfExpanded?: boolean;
  notStopPropagation?: boolean;
  groupKey?: string;
  onlyIcon?: boolean;
  func?: () => void;
};
