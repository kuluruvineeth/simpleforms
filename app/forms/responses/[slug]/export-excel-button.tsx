"use client";

import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/exportToExcel";

type FormattedResponse = {
  [key: string]: string;
};

export function ExportToExcelButton({
  processedData,
}: {
  processedData: (string | number)[][];
}) {
  return (
    <Button onClick={() => exportToExcel(processedData, "myData")}>
      Export to Excel
    </Button>
  );
}
