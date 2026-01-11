import { useState } from 'react';
import { formatCurrency } from '../utils/loanCalculator';
import './LoanScheduleTable.css';

const LoanScheduleTable = ({ schedule, monthlyIncome }) => {
  const [showEarlyRepayment, setShowEarlyRepayment] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  if (!schedule || schedule.length === 0) {
    return <div className="schedule-table">Chưa có dữ liệu</div>;
  }

  // Pagination
  const totalPages = Math.ceil((schedule.length - 1) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1; // Skip month 0
  const endIndex = Math.min(startIndex + itemsPerPage, schedule.length);
  const currentData = schedule.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="schedule-table">
      <div className="table-header">
        <h2>Chi tiết trả nợ theo tháng</h2>
        <div className="table-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showIncome}
              onChange={(e) => setShowIncome(e.target.checked)}
            />
            Thu nhập
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showEarlyRepayment}
              onChange={(e) => setShowEarlyRepayment(e.target.checked)}
            />
            Trả nợ trước hạn
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
          >
            <option value="12">12 tháng/trang</option>
            <option value="24">24 tháng/trang</option>
            <option value="36">36 tháng/trang</option>
            <option value="60">60 tháng/trang</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th rowSpan="2">Tháng</th>
              <th rowSpan="2">Lãi suất<br />(%/năm)</th>
              <th rowSpan="2">Gốc đầu kỳ</th>
              <th rowSpan="2">Gốc trả<br />hàng tháng</th>
              <th rowSpan="2">Lãi trả<br />hàng tháng</th>
              <th rowSpan="2">Tổng gốc+lãi</th>
              <th rowSpan="2">Gốc cuối kỳ</th>
              <th colSpan="3">Tích lũy đã trả</th>
              {showIncome && (
                <th colSpan="2">Thu nhập</th>
              )}
              {showEarlyRepayment && (
                <th colSpan="3">Trả nợ trước hạn</th>
              )}
            </tr>
            <tr>
              <th>Gốc</th>
              <th>Lãi</th>
              <th>Tổng</th>
              {showIncome && (
                <>
                  <th>Còn lại<br />sau trả</th>
                  <th>Tích lũy<br />tiết kiệm</th>
                </>
              )}
              {showEarlyRepayment && (
                <>
                  <th>Phí phạt<br />(%)</th>
                  <th>Phí phạt<br />(VND)</th>
                  <th>Tổng tất toán</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr
                key={row.month}
                className={`${row.monthlyRemaining < 0 ? 'negative' : ''} ${row.isGracePeriod ? 'grace-period' : ''}`}
              >
                <td className="center">
                  {row.month}
                  {row.isGracePeriod && <span className="grace-badge">Ân hạn</span>}
                </td>
                <td className="center">{row.annualRate.toFixed(2)}%</td>
                <td className="right">{formatCurrency(row.principalStart)}</td>
                <td className="right">{formatCurrency(row.principalPayment)}</td>
                <td className="right highlight-interest">{formatCurrency(row.interestPayment)}</td>
                <td className="right highlight-total">{formatCurrency(row.totalPayment)}</td>
                <td className="right">{formatCurrency(row.principalEnd)}</td>
                <td className="right accumulated-principal">{formatCurrency(row.accumulatedPrincipal)}</td>
                <td className="right accumulated-interest">{formatCurrency(row.accumulatedInterest)}</td>
                <td className="right accumulated-total">{formatCurrency(row.totalPaidSoFar)}</td>
                {showIncome && (
                  <>
                    <td className={`right ${row.monthlyRemaining < 0 ? 'negative-value' : 'positive-value'}`}>
                      {formatCurrency(row.monthlyRemaining)}
                    </td>
                    <td className={`right ${row.accumulatedSavings < 0 ? 'negative-value' : 'positive-value'}`}>
                      {formatCurrency(row.accumulatedSavings)}
                    </td>
                  </>
                )}
                {showEarlyRepayment && (
                  <>
                    <td className="center">{row.penaltyRate}%</td>
                    <td className="right highlight-penalty">{formatCurrency(row.penaltyAmount)}</td>
                    <td className="right highlight-settlement">{formatCurrency(row.totalSettlementCost)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
          >
            ««
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
            <span className="page-detail">
              (Tháng {startIndex} - {endIndex - 1} / {schedule.length - 1})
            </span>
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            »»
          </button>
        </div>
      )}
    </div>
  );
};

export default LoanScheduleTable;
