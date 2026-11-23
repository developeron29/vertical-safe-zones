export type Platform = 'tiktok' | 'reels' | 'shorts' | 'all';
export interface Box { x: number; y: number; width: number; height: number }
export interface Covered extends Box { name: string }
export interface Size { width?: number; height?: number }
export interface Zone {
  id: Platform;
  label: string;
  margins: { top: number; bottom: number; left: number; right: number };
  covered: Covered[];
}
export const FRAME: { readonly width: 1080; readonly height: 1920 };
export const LAST_CHECKED: string;
export const PLATFORMS: readonly Platform[];
export function getZone(platform?: Platform): Zone;
export function safeArea(platform?: Platform, size?: Size): Box;
export function coveredAreas(platform?: Platform, size?: Size): Covered[];
export function isSafe(box: Box, platform?: Platform, size?: Size): boolean;
export function toSVG(platform?: Platform, options?: Size & { style?: 'guide' | 'outline'; labels?: boolean }): string;
declare const _default: { FRAME: typeof FRAME; LAST_CHECKED: string; PLATFORMS: typeof PLATFORMS; getZone: typeof getZone; safeArea: typeof safeArea; coveredAreas: typeof coveredAreas; isSafe: typeof isSafe; toSVG: typeof toSVG };
export default _default;
