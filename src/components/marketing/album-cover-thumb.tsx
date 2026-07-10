import Image from "next/image"
import { cn } from "@/lib/utils"

type AlbumCoverThumbProps = {
  src: string | null
  alt?: string
  sizePx: number
  sizes: string
  rotate?: number
  className?: string
}

export function AlbumCoverThumb({ src, alt, sizePx, sizes, rotate, className }: AlbumCoverThumbProps) {
  return (
    <div
      className={cn("relative border-2 border-black bg-ink-800 shrink-0", className)}
      style={{ width: sizePx, height: sizePx, rotate: rotate ? `${rotate}deg` : undefined }}
    >
      {src && <Image src={src} alt={alt ?? ""} fill sizes={sizes} className="object-cover" />}
    </div>
  )
}
