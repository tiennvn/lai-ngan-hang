/**
 * Utility functions for loan calculations
 */

/**
 * Format number to Vietnamese currency format
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
};

/**
 * Parse Vietnamese currency string to number
 */
export const parseCurrency = (str) => {
  if (typeof str === 'number') return str;
  return parseInt(str.replace(/\./g, '').replace(/,/g, ''), 10) || 0;
};

/**
 * Calculate monthly interest rate from annual rate
 */
export const getMonthlyRate = (annualRate) => {
  return annualRate / 100 / 12;
};

/**
 * Get the annual interest rate for a specific month based on promotional periods
 * @param {number} month - Month number (1-indexed)
 * @param {Array} promotionalRates - Array of {fromYear, toYear, rate}
 * @param {number} floatingRate - Floating rate after promotional period
 */
export const getInterestRateForMonth = (month, promotionalRates, floatingRate) => {
  const year = Math.ceil(month / 12);

  for (const promo of promotionalRates) {
    if (year >= promo.fromYear && year <= promo.toYear) {
      return promo.rate;
    }
  }

  return floatingRate;
};

/**
 * Get early repayment penalty rate based on year
 * @param {number} month - Current month
 * @param {Array} penaltyRates - Array of {beforeYear, penaltyRate}
 */
export const getEarlyRepaymentPenalty = (month, penaltyRates) => {
  const year = Math.ceil(month / 12);

  // Sort by beforeYear ascending to prioritize stricter (smaller year) conditions first
  const sortedPenalties = [...penaltyRates].sort((a, b) => a.beforeYear - b.beforeYear);

  for (const penalty of sortedPenalties) {
    if (year <= penalty.beforeYear) {
      return penalty.penaltyRate;
    }
  }

  return 0; // No penalty after all specified periods
};

/**
 * Calculate loan schedule with all details
 * @param {Object} params - Loan parameters
 * @param {number} params.loanAmount - Total loan amount
 * @param {number} params.termMonths - Loan term in months
 * @param {Array} params.promotionalRates - Promotional interest rates
 * @param {number} params.floatingRate - Floating rate after promotion
 * @param {number} params.monthlyIncome - Monthly income for repayment
 * @param {Array} params.penaltyRates - Early repayment penalty rates
 * @param {number} params.gracePeriodYears - Years of grace period (interest only, no principal)
 */
export const calculateLoanSchedule = ({
  loanAmount,
  termMonths,
  promotionalRates,
  floatingRate,
  monthlyIncome,
  penaltyRates,
  gracePeriodYears = 0
}) => {
  const schedule = [];
  let remainingPrincipal = loanAmount;
  const gracePeriodMonths = gracePeriodYears * 12;
  // Principal is spread over remaining months after grace period
  const principalPaymentMonths = termMonths - gracePeriodMonths;
  const monthlyPrincipal = principalPaymentMonths > 0 ? loanAmount / principalPaymentMonths : 0;

  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  let accumulatedSavings = 0;

  // Initial row (month 0)
  schedule.push({
    month: 0,
    principalStart: loanAmount,
    principalPayment: 0,
    interestPayment: 0,
    totalPayment: 0,
    totalPrincipalAndInterest: 0,
    principalEnd: loanAmount,
    annualRate: 0,
    monthlyRemaining: monthlyIncome,
    accumulatedSavings: 0,
    // Early repayment info
    totalPaidSoFar: 0,
    remainingToSettle: loanAmount,
    penaltyRate: 0,
    penaltyAmount: 0,
    totalSettlementCost: loanAmount
  });

  for (let month = 1; month <= termMonths; month++) {
    const principalStart = remainingPrincipal;
    const annualRate = getInterestRateForMonth(month, promotionalRates, floatingRate);
    const monthlyRate = getMonthlyRate(annualRate);
    const isGracePeriod = month <= gracePeriodMonths;

    // Interest is calculated on remaining principal
    const interestPayment = principalStart * monthlyRate;
    // During grace period, no principal payment
    const principalPayment = isGracePeriod ? 0 : monthlyPrincipal;
    const totalPayment = principalPayment + interestPayment;

    totalInterestPaid += interestPayment;
    totalPrincipalPaid += principalPayment;
    remainingPrincipal = principalStart - principalPayment;

    // Monthly remaining after payment
    const monthlyRemaining = monthlyIncome - totalPayment;
    accumulatedSavings += monthlyRemaining;

    // Early repayment calculations
    const penaltyRate = getEarlyRepaymentPenalty(month, penaltyRates);
    const penaltyAmount = remainingPrincipal * (penaltyRate / 100);
    const totalSettlementCost = totalPrincipalPaid + totalInterestPaid + remainingPrincipal + penaltyAmount;

    schedule.push({
      month,
      principalStart,
      principalPayment,
      interestPayment,
      totalPayment,
      totalPrincipalAndInterest: principalPayment + interestPayment,
      principalEnd: Math.max(0, remainingPrincipal),
      annualRate,
      monthlyRemaining,
      accumulatedSavings,
      isGracePeriod,
      // Accumulated totals
      accumulatedPrincipal: totalPrincipalPaid,
      accumulatedInterest: totalInterestPaid,
      // Early repayment info
      totalPaidSoFar: totalPrincipalPaid + totalInterestPaid,
      remainingToSettle: Math.max(0, remainingPrincipal),
      penaltyRate,
      penaltyAmount,
      totalSettlementCost
    });
  }

  return schedule;
};

/**
 * Calculate summary statistics
 */
export const calculateSummary = (schedule, promotionalRates, floatingRate) => {
  if (schedule.length <= 1) {
    return {
      totalPrincipal: 0,
      totalInterest: 0,
      totalPayment: 0,
      avgMonthlyPayment: 0,
      avgMonthlyPaymentPromotional: 0,
      avgMonthlyPaymentFloating: 0,
      promotionalMonths: 0,
      floatingMonths: 0
    };
  }

  const payments = schedule.slice(1); // Exclude month 0

  const totalPrincipal = payments.reduce((sum, p) => sum + p.principalPayment, 0);
  const totalInterest = payments.reduce((sum, p) => sum + p.interestPayment, 0);
  const totalPayment = totalPrincipal + totalInterest;
  const avgMonthlyPayment = totalPayment / payments.length;

  // Find max promotional year
  const maxPromoYear = promotionalRates.length > 0
    ? Math.max(...promotionalRates.map(p => p.toYear))
    : 0;
  const promotionalMonths = maxPromoYear * 12;

  const promotionalPayments = payments.filter(p => p.month <= promotionalMonths);
  const floatingPayments = payments.filter(p => p.month > promotionalMonths);

  const avgMonthlyPaymentPromotional = promotionalPayments.length > 0
    ? promotionalPayments.reduce((sum, p) => sum + p.totalPayment, 0) / promotionalPayments.length
    : 0;

  const avgMonthlyPaymentFloating = floatingPayments.length > 0
    ? floatingPayments.reduce((sum, p) => sum + p.totalPayment, 0) / floatingPayments.length
    : 0;

  return {
    totalPrincipal,
    totalInterest,
    totalPayment,
    avgMonthlyPayment,
    avgMonthlyPaymentPromotional,
    avgMonthlyPaymentFloating,
    promotionalMonths,
    floatingMonths: payments.length - promotionalMonths
  };
};
