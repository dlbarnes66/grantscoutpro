"use client";

import Link from "next/link";
import Card, { CardHeader, CardFooter } from "@/components/ui/Card";   // ⭐ FIXED
import Badge from "@/components/ui/Badge";                              // ⭐ FIXED
import Button from "@/components/ui/Button";                            // ⭐ FIXED
import { BookmarkIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

interface GrantCardProps {
  id: string;
  title: string;
  agency: string;
  deadline: string;
  amount: string;
  bookmarked?: boolean;
  onBookmark?: () => void;
}

export default function GrantCard({
  id,
  title,
  agency,
  deadline,
  amount,
  bookmarked,
  onBookmark
}: GrantCardProps) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>

          <button
            onClick={onBookmark}
            className="text-slate-400 hover:text-white transition"
          >
            <BookmarkIcon
              className={`h-5 w-5 ${bookmarked ? "text-yellow-400" : ""}`}
            />
          </button>
        </div>
      </CardHeader>

      <div className="space-y-2 text-sm text-slate-300">
        <div>
          <span className="font-medium">Agency:</span>{" "}
          <Badge>{agency}</Badge>
        </div>
        <div>
          <span className="font-medium">Deadline:</span> {deadline}
        </div>
        <div>
          <span className="font-medium">Amount:</span> {amount}
        </div>
      </div>

      <CardFooter>
        <Link href={`/grants/${id}`}>
          <Button variant="primary" className="w-full">
            <Squares2X2Icon className="h-4 w-4 inline-block mr-2" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
