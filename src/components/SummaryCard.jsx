import { formatCurrency } from '../utils/loanCalculator';
import './SummaryCard.css';

const SummaryCard = ({ summary, loanAmount, monthlyIncome }) => {
  const {
    totalPrincipal,
    totalInterest,
    totalPayment,
    avgMonthlyPayment,
    avgMonthlyPaymentPromotional,
    avgMonthlyPaymentFloating,
    promotionalMonths,
    floatingMonths
  } = summary;

  const incomeRatio = monthlyIncome > 0 ? (avgMonthlyPayment / monthlyIncome * 100) : 0;
  const incomeRatioPromotional = monthlyIncome > 0 ? (avgMonthlyPaymentPromotional / monthlyIncome * 100) : 0;
  const incomeRatioFloating = monthlyIncome > 0 ? (avgMonthlyPaymentFloating / monthlyIncome * 100) : 0;

  return (
    <div className="summary-card">
      <h2>Tổng kết khoản vay</h2>

      <div className="summary-grid">
        <div className="summary-item">
          <span className="label">Tổng tiền gốc</span>
          <span className="value primary">{formatCurrency(totalPrincipal)} VND</span>
        </div>

        <div className="summary-item">
          <span className="label">Tổng tiền lãi</span>
          <span className="value danger">{formatCurrency(totalInterest)} VND</span>
        </div>

        <div className="summary-item highlight">
          <span className="label">Tổng gốc + lãi</span>
          <span className="value">{formatCurrency(totalPayment)} VND</span>
        </div>

        <div className="summary-item">
          <span className="label">TB trả hàng tháng (toàn kỳ)</span>
          <span className="value info">{formatCurrency(avgMonthlyPayment)} VND</span>
          {monthlyIncome > 0 && (
            <span className={`ratio ${incomeRatio > 70 ? 'warning' : ''}`}>
              {incomeRatio.toFixed(1)}% thu nhập
            </span>
          )}
        </div>
      </div>

      <div className="summary-section">
        <h3>Trong thời gian ưu đãi ({promotionalMonths} tháng)</h3>
        <div className="summary-row">
          <div className="summary-item compact">
            <span className="label">TB trả hàng tháng</span>
            <span className="value success">{formatCurrency(avgMonthlyPaymentPromotional)} VND</span>
            {monthlyIncome > 0 && (
              <span className={`ratio ${incomeRatioPromotional > 70 ? 'warning' : ''}`}>
                {incomeRatioPromotional.toFixed(1)}% thu nhập
              </span>
            )}
          </div>
          <div className="summary-item compact">
            <span className="label">Còn lại sau trả nợ</span>
            <span className={`value ${monthlyIncome - avgMonthlyPaymentPromotional >= 0 ? 'success' : 'danger'}`}>
              {formatCurrency(monthlyIncome - avgMonthlyPaymentPromotional)} VND
            </span>
          </div>
        </div>
      </div>

      {floatingMonths > 0 && (
        <div className="summary-section">
          <h3>Sau thời gian ưu đãi ({floatingMonths} tháng)</h3>
          <div className="summary-row">
            <div className="summary-item compact">
              <span className="label">TB trả hàng tháng</span>
              <span className="value warning">{formatCurrency(avgMonthlyPaymentFloating)} VND</span>
              {monthlyIncome > 0 && (
                <span className={`ratio ${incomeRatioFloating > 70 ? 'warning' : ''}`}>
                  {incomeRatioFloating.toFixed(1)}% thu nhập
                </span>
              )}
            </div>
            <div className="summary-item compact">
              <span className="label">Còn lại sau trả nợ</span>
              <span className={`value ${monthlyIncome - avgMonthlyPaymentFloating >= 0 ? 'success' : 'danger'}`}>
                {formatCurrency(monthlyIncome - avgMonthlyPaymentFloating)} VND
              </span>
            </div>
          </div>
        </div>
      )}

      {monthlyIncome > 0 && incomeRatio > 70 && (
        <div className="warning-box">
          <strong>Cảnh báo:</strong> Tỷ lệ trả nợ/thu nhập vượt quá 70%.
          Các ngân hàng thường yêu cầu tỷ lệ này dưới 50-70%.
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
