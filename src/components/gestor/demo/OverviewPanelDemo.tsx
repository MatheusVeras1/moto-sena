"use client";

import { useMemo, useState } from "react";
import OverviewDashboard from "@/components/gestor/OverviewDashboard";
import { getOverviewDemo } from "@/data/analytics-demo";

type RangeValue = 7 | 30 | 90;

export default function OverviewPanelDemo() {
  const [range, setRange] = useState<RangeValue>(30);
  const [month, setMonth] = useState("");
  const overview = useMemo(
    () => getOverviewDemo({ range, month: month || null }),
    [month, range]
  );

  return (
    <OverviewDashboard
      overview={overview}
      demo
      onSelectRange={(nextRange) => {
        setMonth("");
        setRange(nextRange);
      }}
      onSelectMonth={(nextMonth) => {
        if (nextMonth) setMonth(nextMonth);
      }}
    />
  );
}
