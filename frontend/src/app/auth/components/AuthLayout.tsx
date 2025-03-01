import { Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { Book, Bookmark, Clock } from "lucide-react";

// temporary auth UI
export default function AuthLayout() {
  return (
    <div className="bg-background flex min-h-screen">
      <div className="bg-primary hidden w-1/2 flex-col justify-center p-12 lg:flex">
        <div className="mx-auto max-w-md">
          <h1 className="text-primary-foreground text-4xl font-bold">
            Library App
          </h1>
          <p className="text-muted mt-4 text-xl">
            Your gateway to a world of knowledge and discovery.
          </p>
          <div className="bg-muted mt-8 h-1 w-16"></div>

          <div className="mt-8 space-y-6">
            <FeatureItem
              icon={Book}
              title="Extensive Collection"
              description="Access thousands of books across various genres."
            />
            <FeatureItem
              icon={Clock}
              title="Easy Borrowing"
              description="Simple process to borrow and return books."
            />
            <FeatureItem
              icon={Bookmark}
              title="Track Your Reading"
              description="Keep a history of your reading journey."
            />
          </div>
        </div>
      </div>
      {/* Right side - auth forms */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-primary text-3xl font-bold">Library App</h1>
          <p className="text-muted-foreground mt-2">
            Your gateway to knowledge
          </p>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-center space-x-4">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center",
          "bg-secondary rounded-full",
        )}
      >
        <Icon className="text-secondary-foreground h-6 w-6" />
      </div>
      <div>
        <h3 className="text-primary-foreground font-semibold">{title}</h3>
        <p className="text-muted">{description}</p>
      </div>
    </div>
  );
}
