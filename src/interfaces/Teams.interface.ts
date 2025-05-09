interface IPrimary {
  default: string;
  dark: string;
}

interface IBackground {
  session: string;
  shortBreak: string;
  longBreak: string;
}

interface ITeamColors {
  primary: IPrimary;
  secondary: string;
  background: IBackground;
  light: string;
  dark: string;
}

export interface ITeam {
  name: string;
  id: string;
  logoURL: string;
  spriteURL: string;
  carURL: string;
  colors: ITeamColors;
}