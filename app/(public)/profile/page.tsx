import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BecomeInstructorButton } from "@/components/profile/become-instructor-button";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { EditableField } from "@/components/profile/editable-field";
import { ProfileStats } from "@/components/profile/profile-stats";
import { LogoutButton } from "@/components/profile/logout-button";
import {
  updateBio,
  updateLocation,
  updateWhatsappNumber,
  updateName,
} from "./profile-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin } from "lucide-react";
import { ProfileBanner } from "@/components/profile/profile-banner";
import { ProfileCoursesGrid } from "@/components/profile/profile-courses-grid";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      bio: true,
      location: true,
      whatsappNumber: true,
      courses: {
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
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Cover band */}
      <ProfileBanner imageUrl={user.image} />

      {/* Header: avatar overlaps the cover */}
      <div className="px-4 sm:px-6">
        <div className="-mt-14 flex items-end justify-between sm:-mt-16">
          <div className="rounded-full ring-4 ring-background mb-5">
            <AvatarUploader name={user.name} currentImage={user.image} />
          </div>
          <div className="pt-20 flex items-center gap-4 text-destructive">
            <LogoutButton />
          </div>
        </div>

        {/* Name + role tag */}
        <div className="mt-1 flex items-center gap-2">
          <EditableField
            value={user.name}
            placeholder="Add your name"
            onSave={updateName}
            className="text-xl font-semibold tracking-tight"
          />
          {user.role === "INSTRUCTOR" && (
            <Badge variant="secondary" className="mb-0.5">
              Instructor
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{user.email}</p>

        {/* Bio */}
        <div className="mt-4 max-w-lg">
          <EditableField
            value={user.bio}
            placeholder="Add a bio..."
            multiline
            onSave={updateBio}
            className="text-sm leading-relaxed"
          />
        </div>

        {/* Contact row */}
         <div className="mt-4 flex flex-col gap-2">
          <EditableField
            value={user.whatsappNumber}
            placeholder="Add WhatsApp"
            icon={<MessageCircle className="size-3.5 text-muted-foreground" />}
            onSave={updateWhatsappNumber}
            className="text-sm text-muted-foreground"
          />
          <EditableField
            value={user.location}
            placeholder="Add location"
            icon={<MapPin className="size-3.5 text-muted-foreground" />}
            onSave={updateLocation}
            className="text-sm text-muted-foreground"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center mt-6">
          <ProfileStats
            likeCount={user._count.likesReceived}
            courseCount={user.role === "INSTRUCTOR" ? user._count.courses : undefined}
          />
        </div>

        {/* Instructor CTA */}
        <div className="mt-6 rounded-xl border bg-card p-5">
          {user.role === "INSTRUCTOR" ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">You&apos;re an instructor</p>
                <p className="text-sm text-muted-foreground">
                  Manage your courses from the instructor dashboard.
                </p>
              </div>
              <Button asChild>
                <Link href="/instructor">Go to instructor page</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 md:flex-row flex-col">
              <div>
                <p className="font-medium md:w-full">Become an instructor</p>
                <p className="text-sm text-muted-foreground">
                  Create and sell your own courses on the platform.
                </p>
              </div>
              <BecomeInstructorButton />
            </div>
          )}
        </div>

        {/* Courses grid */}
        {user.role === "INSTRUCTOR" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-10">
              Courses
            </h2>
            <ProfileCoursesGrid courses={user.courses} />
          </div>
        )}
      </div>
    </div>
  );
}