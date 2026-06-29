import { CalendarClock, Coins } from "lucide-react";
import type { Scholarship } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatInr } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  government: "Government",
  state: "State",
  private: "Private",
  college: "College",
};

export function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  return (
    <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="flex h-full flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{typeLabels[scholarship.type] ?? scholarship.type}</Badge>
          {scholarship.meritBased && <Badge variant="success">Merit</Badge>}
        </div>
        <h3 className="font-semibold leading-snug">{scholarship.title}</h3>
        {scholarship.provider && (
          <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
        )}
        <div className="mt-auto space-y-2 text-sm">
          <p className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
            <Coins className="h-4 w-4" />
            {formatInr(scholarship.amountInr)}
          </p>
          {scholarship.deadline && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              Deadline {formatDate(scholarship.deadline)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
