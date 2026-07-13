"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface featureProps {
    title: string;
    description: string;
    icon: string;
}

const features: featureProps []= [
    {
        title: "Comprehensive Courses",
        description:"Access a Wide range of carefully courses designed by industry experts.",
        icon:"i"
    },
    {
        title: "Comprehensive Courses",
        description:"Access a Wide range of carefully courses designed by industry experts.",
        icon:"i"
    },
    {
        title: "Comprehensive Courses",
        description:"Access a Wide range of carefully courses designed by industry experts.",
        icon:"i"
    },
    {
        title: "Comprehensive Courses",
        description:"Access a Wide range of carefully courses designed by industry experts.",
        icon:"i"
    },
]


export default function Home() {

  const router = useRouter();
  const { data: session, } = authClient.useSession() 
    
  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // redirect to login page
          toast.success("Logged out successfully");
        },
      },
    });
  }

  return (
    <>
    <section className="relative py-20">
        <div className="flex flex-col items-center text-center space-y-8">

            <Badge className="text-xl p-4" variant="outline">
                The future of online education
            </Badge>
        
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Elevate your Learning Experience
            </h1>

            <p className="max-w-175 text-muted-foreground">
                Discover a new way to learn with our modern,
                interactive learning managment system.
                Access high-quality courses anytime,
                anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">

                <Link 
                    href="/courses" 
                    className={buttonVariants({
                        size:"lg",
                        className: "h-14 px-10 text-xl",

                })}
                >
                Explore courses
                </Link>

            </div>
        </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature ,index) => (
             <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="text-4xl">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
             </Card>
        ))}
    </section>
    </>
  );
}
