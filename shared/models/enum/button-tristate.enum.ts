export enum ButtonTristate {
  NONE = "NONE",
  TRUE = "TRUE",
  FALSE = "FALSE",
}

export function getStateFromParams(param: string): ButtonTristate {
  switch (param) {
    case "true":
      return ButtonTristate.TRUE;
    case "false":
      return ButtonTristate.FALSE;
    default:
      return ButtonTristate.NONE;
  }
}

export function getButtonTristateByIndex(typeIndex: 0 | 1 | 2): ButtonTristate {
  return Object.values(ButtonTristate)[typeIndex];
}

export function getButtonTristateIndexByType(type: ButtonTristate): number {
  return Object.values(ButtonTristate).indexOf(type);
}

export function getNextButtonTristateByType(type: ButtonTristate): ButtonTristate {
  switch (type) {
    case ButtonTristate.NONE:
      return ButtonTristate.TRUE;
    case ButtonTristate.TRUE:
      return ButtonTristate.FALSE;
    case ButtonTristate.FALSE:
      return ButtonTristate.NONE;
    default:
      return ButtonTristate.NONE;
  }
}

export function getNextButtonTwoStateByType(type: ButtonTristate): ButtonTristate {
  switch (type) {
    case ButtonTristate.TRUE:
      return ButtonTristate.FALSE;
    case ButtonTristate.FALSE:
      return ButtonTristate.TRUE;
    default:
      return ButtonTristate.TRUE;
  }
}
