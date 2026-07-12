/* eslint-disable @next/next/no-img-element */
import { mediaUrl } from "./api";
import type { PublicMedia } from "./types";

export function ProjectCover({ media, title }: { media: PublicMedia[]; title: string }) {
  const cover = media.find((item) => item.mediaRole === "COVER");
  if (!cover) return <div className="mb-5 flex aspect-[16/7] items-center justify-center rounded-xl bg-canvas text-sm text-muted" role="img" aria-label={`${title} 대표 이미지 준비 중`}>대표 이미지 준비 중</div>;
  return <img alt={cover.altText} className="mb-5 aspect-[16/7] w-full rounded-xl bg-canvas object-cover" height={cover.height} src={mediaUrl(cover.url)} width={cover.width} />;
}

export function MediaGallery({ media }: { media: PublicMedia[] }) {
  if (!media.length) return null;
  return <div className="grid gap-5 sm:grid-cols-2">{media.map((item) => <figure className="rounded-2xl border border-line bg-surface p-3" key={`${item.mediaRole}-${item.displayOrder}-${item.url}`}><img alt={item.altText} className="w-full rounded-xl object-contain" height={item.height} src={mediaUrl(item.url)} width={item.width} />{item.caption && <figcaption className="px-2 pt-3 text-sm leading-6 text-muted">{item.caption}</figcaption>}</figure>)}</div>;
}
