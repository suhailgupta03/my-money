import { REVERSE_MONTH } from "../constants";

export function computeChange(allocation, sip, changeMap, stopMonth) {
  const [initialEquity, initialDebt, initialGold] = allocation;
  const equitySip = sip.equity;
  const debtSip = sip.debt;
  const goldSip = sip.gold;

  let totalEquityBalance = 0;
  let totalDebtBalance = 0;
  let totalGoldBalance = 0;

  if(allocation.length === 0) {
    alert("CANNOT COMPUTE BALANCE WITHOUT ALLOCATION");
    throw new Error("Allocation not defined");
  } 

  if(equitySip === 0 || debtSip === 0 || goldSip === 0) {
    alert("SIP ALLOCATION IS EITHER 0 OR NOT_DEFINED. ABORTING!!");
    throw new Error("Sip allocation is missing");
  }

  for (let month = 0; month <= stopMonth; month++) {
    const change = changeMap[month];
    if (!change) {
      alert(`NO DATA FOUND FOR ${REVERSE_MONTH()[month]}. ABORTING!!`);
      throw new Error(`NO DATA FOUND FOR ${REVERSE_MONTH()[month]}. ABORTING!!`);
    } else {
      const equityChange = change.equity;
      const debtChange = change.debt;
      const goldChange = change.gold;

      if (month === 0) {
        totalEquityBalance =
          initialEquity + initialEquity * (equityChange / 100);
        totalDebtBalance = initialDebt + initialDebt * (debtChange / 100);
        totalGoldBalance = initialGold + initialGold * (goldChange / 100);
      } else {
        const teqBalance = totalEquityBalance + equitySip;
        totalEquityBalance = teqBalance + teqBalance * (equityChange / 100);

        const tdebBalance = totalDebtBalance + debtSip;
        totalDebtBalance = tdebBalance + tdebBalance * (debtChange / 100);

        const tgBalance = totalGoldBalance + goldSip;
        totalGoldBalance = tgBalance + tgBalance * (goldChange / 100);
      }

      totalEquityBalance = Math.floor(totalEquityBalance);
      totalDebtBalance = Math.floor(totalDebtBalance);
      totalGoldBalance = Math.floor(totalGoldBalance);
    }
  }

  return {
    equityBalance: totalEquityBalance,
    debtBalance: totalDebtBalance,
    goldBalance: totalGoldBalance,
  };
}
