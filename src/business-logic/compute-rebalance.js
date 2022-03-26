import { computeChange } from "./compute-change";

export function computeRebalance(allocation, sip, changeMap, portfolio) {
  const sortedMonthList = Object.keys(changeMap)
    .map((v) => parseInt(v))
    .sort((a, b) => a - b);

  if (sortedMonthList.length < 6) {
    alert("CANNOT_REBALANCE");
    return {};
  } else {
    if (sortedMonthList.length === 6 || sortedMonthList.length === 12) {
      const stopMonth = sortedMonthList[sortedMonthList.length - 1];

      const { debtBalance, equityBalance, goldBalance } = computeChange(
        allocation,
        sip,
        changeMap,
        stopMonth
      );

      const totalBalance = debtBalance + equityBalance + goldBalance;

      return {
        rebalancedEquity: Math.floor(totalBalance * portfolio.equity),
        rebalancedDebt: Math.floor(totalBalance * portfolio.debt),
        rebalancedGold: Math.floor(totalBalance * portfolio.gold),
      };
    } else {
      alert("!!The rebalancing happens on 6th (June) and 12th (December) month!!");
      return {};
    }
  }
}
