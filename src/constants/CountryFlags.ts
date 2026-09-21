export interface CountryFlag {
  code: string;
  name: string;
  emoji: string;
}

const ISO_CODES =
  'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(
    ' '
  );

export const countryFlagEmoji = (code: string): string =>
  code.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

export const flagEmojiToCountryCode = (emoji: string): string | null => {
  const codePoints = [...emoji].map((char) => char.codePointAt(0) ?? 0);

  if (codePoints.length !== 2 || codePoints.some((cp) => cp < 127462 || cp > 127487)) {
    return null;
  }

  return codePoints.map((cp) => String.fromCharCode(cp - 127397)).join('');
};

export const flagEmojiToCountryName = (emoji: string, locale: string): string | null => {
  const code = flagEmojiToCountryCode(emoji);
  if (!code) return null;

  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
};

export const getCountryFlags = (locale: string): CountryFlag[] => {
  let display: Intl.DisplayNames | null = null;

  try {
    display = new Intl.DisplayNames([locale], { type: 'region' });
  } catch {
    display = null;
  }

  return ISO_CODES.map((code) => ({
    code,
    name: display?.of(code) ?? code,
    emoji: countryFlagEmoji(code),
  })).sort((a, b) => a.name.localeCompare(b.name));
};
