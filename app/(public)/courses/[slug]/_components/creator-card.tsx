import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "@/components/profile/like-button";
import { toggleProfileLike } from "@/app/(public)/profile/[userId]/like-actions";

interface CreatorCardProps {
  user: { id: string; name: string; email: string; image: string | null };
  alreadyLiked: boolean;
  showLikeButton: boolean;
}

export function CreatorCard({ user, alreadyLiked, showLikeButton }: CreatorCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
      <Link
        href={`/profile/${user.id}`}
        className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
      >
        <div className="relative size-10 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
          {user.image ? (
            <Image src={user.image} alt={user.name} fill className="object-cover" />
          ) : (
            <span className="text-sm font-medium">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </Link>

      {showLikeButton && (
        <LikeButton
          likedUserId={user.id}
          initiallyLiked={alreadyLiked}
          onToggle={toggleProfileLike}
        />
      )}
    </div>
  );
}