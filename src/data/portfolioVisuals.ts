import rawVisuals from './portfolioVisuals.json';

export type PortfolioVisualId =
  | 'delivery-review-sanitized'
  | 'sales-lead-sanitized';

export type PortfolioVisual = {
  readonly id: PortfolioVisualId;
  readonly kind: 'real-sanitized' | 'structural-redraw';
  readonly src: `/portfolio/${string}.${'svg' | 'png' | 'webp'}`;
  readonly sha256: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption: string;
};

export const portfolioVisuals = rawVisuals as unknown as readonly PortfolioVisual[];

export function getPortfolioVisual(id: PortfolioVisualId): PortfolioVisual {
  const visual = portfolioVisuals.find((item) => item.id === id);
  if (!visual) throw new Error(`Missing reviewed portfolio visual: ${id}`);
  return visual;
}
