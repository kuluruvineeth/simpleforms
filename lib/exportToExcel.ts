import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export function exportToExcel(
  processedData: (string | number)[][],
  fileName: string = "data"
): void {
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(processedData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  const excelBuffer: any = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const blob: Blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(blob, `${fileName}.xlsx`);
}
