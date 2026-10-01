interface Pinnable {
  order: number;
  pinned?: boolean;
}

export const sortPinnedFirst = <T extends Pinnable>(items: T[]) =>
  [...items].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || a.order - b.order);
