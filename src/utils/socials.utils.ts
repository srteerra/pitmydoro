export type SocialPlatform = 'instagram' | 'twitch' | 'discord' | 'twitter';

export const SOCIAL_DOMAINS: Record<SocialPlatform, string[]> = {
  instagram: ['instagram.com'],
  twitch: ['twitch.tv'],
  discord: ['discord.gg', 'discord.com', 'discordapp.com'],
  twitter: ['twitter.com', 'x.com'],
};

const withProtocol = (value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`);

export const isValidSocialUrl = (platform: SocialPlatform, value?: string): boolean => {
  if (!value || !value.trim()) return true;

  try {
    const url = new URL(withProtocol(value.trim()));
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
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
