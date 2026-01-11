import { useState } from 'react';
import { formatCurrency, parseCurrency } from '../utils/loanCalculator';
import './InputForm.css';

const InputForm = ({
  loanAmount,
  setLoanAmount,
  termYears,
  setTermYears,
  gracePeriodYears,
  setGracePeriodYears,
  promotionalRates,
  setPromotionalRates,
  floatingRate,
  setFloatingRate,
  monthlyIncome,
  setMonthlyIncome,
  penaltyRates,
  setPenaltyRates
}) => {
  const [loanAmountDisplay, setLoanAmountDisplay] = useState(formatCurrency(loanAmount));
  const [incomeDisplay, setIncomeDisplay] = useState(formatCurrency(monthlyIncome));

  const handleLoanAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const numValue = parseInt(value, 10) || 0;
    setLoanAmount(numValue);
    setLoanAmountDisplay(formatCurrency(numValue));
  };

  const handleIncomeChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const numValue = parseInt(value, 10) || 0;
    setMonthlyIncome(numValue);
    setIncomeDisplay(formatCurrency(numValue));
  };

  const addPromotionalRate = () => {
    const lastRate = promotionalRates[promotionalRates.length - 1];
    const newFromYear = lastRate ? lastRate.toYear + 1 : 1;
    setPromotionalRates([
      ...promotionalRates,
      { fromYear: newFromYear, toYear: newFromYear, rate: 5.0, id: Date.now() }
    ]);
  };

  const updatePromotionalRate = (id, field, value) => {
    setPromotionalRates(promotionalRates.map(rate =>
      rate.id === id ? { ...rate, [field]: parseFloat(value) || 0 } : rate
    ));
  };

  const removePromotionalRate = (id) => {
    setPromotionalRates(promotionalRates.filter(rate => rate.id !== id));
  };

  const addPenaltyRate = () => {
    setPromotionalRates([...promotionalRates]);
    setPenaltyRates([
      ...penaltyRates,
      { beforeYear: 3, penaltyRate: 1, id: Date.now() }
    ]);
  };

  const updatePenaltyRate = (id, field, value) => {
    setPenaltyRates(penaltyRates.map(penalty =>
      penalty.id === id ? { ...penalty, [field]: parseFloat(value) || 0 } : penalty
    ));
  };

  const removePenaltyRate = (id) => {
    setPenaltyRates(penaltyRates.filter(penalty => penalty.id !== id));
  };

  return (
    <div className="input-form">
      <h2>Thông tin khoản vay</h2>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="loanAmount">Khoản vay (VND)</label>
          <input
            type="text"
            id="loanAmount"
            value={loanAmountDisplay}
            onChange={handleLoanAmountChange}
            placeholder="2.000.000.000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="termYears">Kỳ hạn vay (năm)</label>
          <input
            type="number"
            id="termYears"
            value={termYears}
            onChange={(e) => setTermYears(parseInt(e.target.value, 10) || 1)}
            min="1"
            max="35"
          />
          <span className="hint">{termYears * 12} tháng</span>
        </div>

        <div className="form-group">
          <label htmlFor="gracePeriodYears">Ân hạn gốc (năm)</label>
          <input
            type="number"
            id="gracePeriodYears"
            value={gracePeriodYears}
            onChange={(e) => setGracePeriodYears(parseInt(e.target.value, 10) || 0)}
            min="0"
            max={termYears - 1}
          />
          <span className="hint">Trong {gracePeriodYears * 12} tháng đầu chỉ trả lãi, không trả gốc</span>
        </div>

        <div className="form-group">
          <label htmlFor="floatingRate">Lãi suất thả nổi (%/năm)</label>
          <input
            type="number"
            id="floatingRate"
            value={floatingRate}
            onChange={(e) => setFloatingRate(parseFloat(e.target.value) || 0)}
            step="0.1"
            min="0"
            max="30"
          />
        </div>

        <div className="form-group">
          <label htmlFor="monthlyIncome">Thu nhập hàng tháng để trả nợ (VND)</label>
          <input
            type="text"
            id="monthlyIncome"
            value={incomeDisplay}
            onChange={handleIncomeChange}
            placeholder="60.000.000"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Lãi suất ưu đãi theo năm</h3>
        <p className="section-desc">Thêm các mức lãi suất ưu đãi cho từng giai đoạn</p>

        {promotionalRates.map((rate, index) => (
          <div key={rate.id} className="rate-row">
            <div className="rate-input-group">
              <label>Từ năm</label>
              <input
                type="number"
                value={rate.fromYear}
                onChange={(e) => updatePromotionalRate(rate.id, 'fromYear', e.target.value)}
                min="1"
              />
            </div>
            <div className="rate-input-group">
              <label>Đến năm</label>
              <input
                type="number"
                value={rate.toYear}
                onChange={(e) => updatePromotionalRate(rate.id, 'toYear', e.target.value)}
                min={rate.fromYear}
              />
            </div>
            <div className="rate-input-group">
              <label>Lãi suất (%)</label>
              <input
                type="number"
                value={rate.rate}
                onChange={(e) => updatePromotionalRate(rate.id, 'rate', e.target.value)}
                step="0.1"
                min="0"
              />
            </div>
            <button
              type="button"
              className="btn-remove"
              onClick={() => removePromotionalRate(rate.id)}
            >
              ×
            </button>
          </div>
        ))}

        <button type="button" className="btn-add" onClick={addPromotionalRate}>
          + Thêm mức lãi suất ưu đãi
        </button>
      </div>

      <div className="form-section">
        <h3>Phí phạt trả nợ trước hạn</h3>
        <p className="section-desc">Phí phạt khi tất toán trước kỳ hạn</p>

        {penaltyRates.map((penalty, index) => (
          <div key={penalty.id} className="rate-row">
            <div className="rate-input-group">
              <label>Trước năm thứ</label>
              <input
                type="number"
                value={penalty.beforeYear}
                onChange={(e) => updatePenaltyRate(penalty.id, 'beforeYear', e.target.value)}
                min="1"
              />
            </div>
            <div className="rate-input-group">
              <label>Phí phạt (%)</label>
              <input
                type="number"
                value={penalty.penaltyRate}
                onChange={(e) => updatePenaltyRate(penalty.id, 'penaltyRate', e.target.value)}
                step="0.1"
                min="0"
              />
            </div>
            <button
              type="button"
              className="btn-remove"
              onClick={() => removePenaltyRate(penalty.id)}
            >
              ×
            </button>
          </div>
        ))}

        <button type="button" className="btn-add" onClick={addPenaltyRate}>
          + Thêm mức phí phạt
        </button>
      </div>
    </div>
  );
};

export default InputForm;
