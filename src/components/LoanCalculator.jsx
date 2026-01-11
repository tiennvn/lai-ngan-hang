import { useState, useMemo } from 'react';
import InputForm from './InputForm';
import SummaryCard from './SummaryCard';
import LoanScheduleTable from './LoanScheduleTable';
import { calculateLoanSchedule, calculateSummary } from '../utils/loanCalculator';
import './LoanCalculator.css';

const LoanCalculator = () => {
  // Loan parameters state
  const [loanAmount, setLoanAmount] = useState(2000000000); // 2 billion VND
  const [termYears, setTermYears] = useState(20);
  const [gracePeriodYears, setGracePeriodYears] = useState(0); // Grace period - interest only
  const [floatingRate, setFloatingRate] = useState(10.0);
  const [monthlyIncome, setMonthlyIncome] = useState(60000000); // 60 million VND

  // Promotional rates - can be customized
  const [promotionalRates, setPromotionalRates] = useState([
    { id: 1, fromYear: 1, toYear: 1, rate: 5.2 },
    { id: 2, fromYear: 2, toYear: 3, rate: 6.7 }
  ]);

  // Early repayment penalty rates
  const [penaltyRates, setPenaltyRates] = useState([
    { id: 1, beforeYear: 3, penaltyRate: 3 },
    { id: 2, beforeYear: 5, penaltyRate: 1 }
  ]);

  // Calculate loan schedule whenever inputs change
  const schedule = useMemo(() => {
    return calculateLoanSchedule({
      loanAmount,
      termMonths: termYears * 12,
      promotionalRates,
      floatingRate,
      monthlyIncome,
      penaltyRates,
      gracePeriodYears
    });
  }, [loanAmount, termYears, promotionalRates, floatingRate, monthlyIncome, penaltyRates, gracePeriodYears]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    return calculateSummary(schedule, promotionalRates, floatingRate);
  }, [schedule, promotionalRates, floatingRate]);

  return (
    <div className="loan-calculator">
      <header className="calculator-header">
        <h1>Tính toán Lãi suất Vay Ngân hàng</h1>
        <p>Công cụ tính toán chi tiết khoản vay mua bất động sản</p>
      </header>

      <div className="calculator-layout">
        <aside className="calculator-sidebar">
          <InputForm
            loanAmount={loanAmount}
            setLoanAmount={setLoanAmount}
            termYears={termYears}
            setTermYears={setTermYears}
            gracePeriodYears={gracePeriodYears}
            setGracePeriodYears={setGracePeriodYears}
            promotionalRates={promotionalRates}
            setPromotionalRates={setPromotionalRates}
            floatingRate={floatingRate}
            setFloatingRate={setFloatingRate}
            monthlyIncome={monthlyIncome}
            setMonthlyIncome={setMonthlyIncome}
            penaltyRates={penaltyRates}
            setPenaltyRates={setPenaltyRates}
          />
        </aside>

        <main className="calculator-main">
          <SummaryCard
            summary={summary}
            loanAmount={loanAmount}
            monthlyIncome={monthlyIncome}
          />

          <LoanScheduleTable
            schedule={schedule}
            monthlyIncome={monthlyIncome}
          />
        </main>
      </div>
    </div>
  );
};

export default LoanCalculator;
