import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './loanCalculator';

/**
 * Export loan schedule to Excel
 */
export const exportToExcel = (schedule, loanInfo) => {
  // Prepare data for Excel with formatted numbers
  const data = schedule.slice(1).map(row => ({
    'Tháng': row.month,
    'Lãi suất (%/năm)': row.annualRate.toFixed(2),
    'Gốc đầu kỳ': formatCurrency(row.principalStart),
    'Gốc trả hàng tháng': formatCurrency(row.principalPayment),
    'Lãi trả hàng tháng': formatCurrency(row.interestPayment),
    'Tổng gốc+lãi': formatCurrency(row.totalPayment),
    'Gốc cuối kỳ': formatCurrency(row.principalEnd),
    'Tích lũy gốc đã trả': formatCurrency(row.accumulatedPrincipal),
    'Tích lũy lãi đã trả': formatCurrency(row.accumulatedInterest),
    'Tổng đã trả': formatCurrency(row.totalPaidSoFar),
    'Thu nhập còn lại': formatCurrency(row.monthlyRemaining),
    'Tích lũy tiết kiệm': formatCurrency(row.accumulatedSavings),
    'Phí phạt (%)': row.penaltyRate,
    'Phí phạt (VND)': formatCurrency(row.penaltyAmount),
    'Tổng tất toán': formatCurrency(row.totalSettlementCost),
    'Ân hạn': row.isGracePeriod ? 'Có' : ''
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create summary sheet
  const summaryData = [
    ['THÔNG TIN KHOẢN VAY'],
    [''],
    ['Khoản vay', formatCurrency(loanInfo.loanAmount) + ' VND'],
    ['Kỳ hạn (tháng)', loanInfo.termMonths],
    ['Ân hạn gốc (năm)', loanInfo.gracePeriodYears],
    ['Lãi suất thả nổi (%/năm)', loanInfo.floatingRate],
    ['Thu nhập hàng tháng', formatCurrency(loanInfo.monthlyIncome) + ' VND'],
    [''],
    ['TỔNG KẾT'],
    ['Tổng tiền gốc', formatCurrency(loanInfo.totalPrincipal) + ' VND'],
    ['Tổng tiền lãi', formatCurrency(loanInfo.totalInterest) + ' VND'],
    ['Tổng gốc + lãi', formatCurrency(loanInfo.totalPayment) + ' VND'],
    ['TB trả hàng tháng', formatCurrency(loanInfo.avgMonthlyPayment) + ' VND'],
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Tổng kết');

  // Create schedule sheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },   // Tháng
    { wch: 12 },  // Lãi suất
    { wch: 18 },  // Gốc đầu kỳ
    { wch: 18 },  // Gốc trả
    { wch: 18 },  // Lãi trả
    { wch: 18 },  // Tổng
    { wch: 18 },  // Gốc cuối kỳ
    { wch: 18 },  // Tích lũy gốc
    { wch: 18 },  // Tích lũy lãi
    { wch: 18 },  // Tổng đã trả
    { wch: 18 },  // Thu nhập còn lại
    { wch: 18 },  // Tích lũy tiết kiệm
    { wch: 12 },  // Phí phạt %
    { wch: 18 },  // Phí phạt VND
    { wch: 18 },  // Tổng tất toán
    { wch: 8 },   // Ân hạn
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết trả nợ');

  // Save file
  XLSX.writeFile(wb, `lich-tra-no-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export loan schedule to PDF
 */
export const exportToPDF = (schedule, loanInfo) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns

  // Title
  doc.setFontSize(16);
  doc.text('LICH TRA NO VAY NGAN HANG', 148, 15, { align: 'center' });

  // Loan info
  doc.setFontSize(10);
  const infoY = 25;
  doc.text(`Khoan vay: ${formatCurrency(loanInfo.loanAmount)} VND`, 14, infoY);
  doc.text(`Ky han: ${loanInfo.termMonths} thang`, 14, infoY + 5);
  doc.text(`An han goc: ${loanInfo.gracePeriodYears} nam`, 14, infoY + 10);
  doc.text(`Lai suat tha noi: ${loanInfo.floatingRate}%/nam`, 100, infoY);
  doc.text(`Thu nhap hang thang: ${formatCurrency(loanInfo.monthlyIncome)} VND`, 100, infoY + 5);

  doc.text(`Tong goc + lai: ${formatCurrency(loanInfo.totalPayment)} VND`, 200, infoY);
  doc.text(`TB tra hang thang: ${formatCurrency(loanInfo.avgMonthlyPayment)} VND`, 200, infoY + 5);

  // Table data
  const tableData = schedule.slice(1).map(row => [
    row.month,
    row.annualRate.toFixed(2) + '%',
    formatCurrency(row.principalStart),
    formatCurrency(row.principalPayment),
    formatCurrency(row.interestPayment),
    formatCurrency(row.totalPayment),
    formatCurrency(row.principalEnd),
    formatCurrency(row.accumulatedPrincipal),
    formatCurrency(row.accumulatedInterest),
    formatCurrency(row.totalPaidSoFar),
    row.penaltyRate + '%',
    formatCurrency(row.totalSettlementCost),
  ]);

  // Table headers
  const headers = [
    'Thang',
    'Lai suat',
    'Goc dau ky',
    'Goc tra',
    'Lai tra',
    'Tong',
    'Goc cuoi ky',
    'TL Goc',
    'TL Lai',
    'Tong da tra',
    'Phi phat',
    'Tat toan',
  ];

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 42,
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      halign: 'right',
    },
    headStyles: {
      fillColor: [67, 97, 238],
      halign: 'center',
      fontSize: 7,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 15 },
      2: { cellWidth: 25 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 25 },
      7: { cellWidth: 25 },
      8: { cellWidth: 25 },
      9: { cellWidth: 25 },
      10: { halign: 'center', cellWidth: 15 },
      11: { cellWidth: 28 },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    margin: { left: 7, right: 7 },
  });

  // Save file
  doc.save(`lich-tra-no-${new Date().toISOString().split('T')[0]}.pdf`);
};
