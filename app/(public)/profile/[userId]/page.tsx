import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ProfileBanner } from "@/components/profile/profile-banner";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileCoursesGrid } from "@/components/profile/profile-courses-grid";
import { LikeButton } from "@/components/profile/like-button";
import { toggleProfileLike } from "./like-actions";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin } from "lucide-react";
import Image from "next/image";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // Viewing your own profile via this route just sends you to the private one
  if (session?.user?.id === userId) {
    redirect("/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      bio: true,
      location: true,
      whatsappNumber: true,
      courses: {
        where: { status: "Published" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          smallDescription: true,
          duration: true,
          price: true,
          status: true,
          fileKey: true,
        },
      },
      _count: {
        select: {
          likesReceived: true,
          courses: true,
        },
      },
      likesReceived: session?.user
        ? {
            where: { likerId: session.user.id },
            select: { id: true },
          }
        : undefined,
    },
  });

  if (!user) {
    notFound();
  }

  const alreadyLiked = session?.user ? user.likesReceived.length > 0 : false;

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <ProfileBanner imageUrl={user.image} />

      <div className="px-4 sm:px-6">
        <div className="-mt-14 flex items-end justify-between sm:-mt-16">
          <div className="rounded-full ring-4 ring-background mb-5 relative size-24 overflow-hidden bg-muted flex items-center justify-center">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill className="object-cover" />
            ) : (
              <span className="text-2xl font-medium">
                {user.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
          {session?.user && (
            <div className="pt-20">
              <LikeButton
                likedUserId={user.id}
                initiallyLiked={alreadyLiked}
                onToggle={toggleProfileLike}
              />
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
          {user.role === "INSTRUCTOR" && (
            <Badge variant="secondary" className="mb-0.5">
              Instructor
            </Badge>
          )}
        </div>

        {user.bio && (
          <p className="mt-4 max-w-lg text-sm leading-relaxed">{user.bio}</p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {user.whatsappNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="size-3.5" />
              {user.whatsappNumber}
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {user.location}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center mt-6">
          <ProfileStats
            likeCount={user._count.likesReceived}
            courseCount={user.role === "INSTRUCTOR" ? user._count.courses : undefined}
          />
        </div>

        {user.role === "INSTRUCTOR" && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Courses</h2>
            <ProfileCoursesGrid courses={user.courses} />
          </div>
        )}
      </div>
    </div>
  );
}