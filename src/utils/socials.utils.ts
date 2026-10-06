export type SocialPlatform = 'instagram' | 'twitch' | 'discord' | 'twitter' | 'github';

export const SOCIAL_DOMAINS: Record<SocialPlatform, string[]> = {
  instagram: ['instagram.com'],
  twitch: ['twitch.tv'],
  discord: ['discord.gg', 'discord.com', 'discordapp.com'],
  twitter: ['twitter.com', 'x.com'],
  github: ['github.com'],
};

const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

const isGithubProfileUrl = (url: URL, host: string) => {
  if (!SOCIAL_DOMAINS.github.includes(host)) return false;
  if (url.port || url.username || url.password || url.search || url.hash) return false;

  const [, username, ...rest] = url.pathname.replace(/\/$/, '').split('/');
  return rest.length === 0 && GITHUB_USERNAME.test(username ?? '');
};

const withProtocol = (value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`);

export const isValidSocialUrl = (platform: SocialPlatform, value?: string): boolean => {
  if (!value || !value.trim()) return true;

  try {
    const url = new URL(withProtocol(value.trim()));
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (platform === 'github') return isGithubProfileUrl(url, host);

    return SOCIAL_DOMAINS[platform].some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

export const normalizeSocialUrl = (value?: string): string => {
  const trimmed = value?.trim();
  return trimmed ? withProtocol(trimmed) : '';
};
