// Big photo, name, email, member since, badge, Edit profile and Account settings buttons
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { Camera, PenLine, Settings, Shield, ShieldCheck } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ProfileUser = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    isVerified: boolean;
    accountStatus: string;
    createdAt: Date;
};

export default function ProfileSummaryCard({ user }: { user: ProfileUser }) {
    return (
        <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
            <div className="relative">
                <Avatar name={user.name} src={user.image} size="xl" />
                <Link
                    href="/profile/me/edit"
                    className="absolute -right-1 -bottom-1 grid h-8 w-8 place-items-center rounded-full bg-olive text-white shadow-md transition-colors hover:bg-olive-hover"
                >
                    <Camera size={16} aria-hidden="true" />
                    <span className="sr-only">Change profile picture</span>
                </Link>
            </div>


            <div className="flex flex-col items-center gap-1">
                <h2 className="text-xl font-semibold" aria-label={`Name: ${user.name}`}>
                    {user.name}
                </h2>
                <p className="text-gray-600" aria-label={`Email: ${user.email}`}>
                    {user.email}
                </p>
                {user.isVerified ? (
                    <Badge tone="green">
                        <span className="flex items-center gap-1">
                            <ShieldCheck size={16} aria-hidden="true" />
                            Identity Verified
                        </span>
                    </Badge>
                ) : (
                    <Badge tone="amber">
                        <span className="flex items-center gap-1">
                            <Shield size={16} aria-hidden="true" />
                            Not verified
                        </span>
                    </Badge>
                )}
                <div className="mt-4 flex w-full flex-col gap-2">
                    <Link href="/profile/me/edit" className={buttonClass()}>
                        <PenLine size={16} aria-hidden="true" />
                        Edit profile
                    </Link>
                    <Link
                        href="/profile/me/settings"
                        className={buttonClass({ variant: "secondary" })}
                    >
                        <Settings size={16} aria-hidden="true" />
                        Account settings
                    </Link>
                </div>
            </div>
        </div>
    );
}
