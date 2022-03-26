export const ALLOWED_COMMANDS =  {
    "ALLOCATE": "ALLOCATE",
    "SIP": "SIP",
    "CHANGE": "CHANGE",
    "BALANCE": "BALANCE",
    "REBALANCE": "REBALANCE"
};

export const MONTHS = {
    "JANUARY": 0,
    "FEBRUARY": 1,
    "MARCH": 2,
    "APRIL": 3,
    "MAY": 4,
    "JUNE": 5,
    "JULY": 6,
    "AUGUST": 7,
    "SEPTEMBER": 8,
    "OCTOBER": 9,
    "NOVEMBER": 10,
    "DECEMBER": 11
}

export const REVERSE_MONTH = () => {
    const rMonth = {};
    for(const key in MONTHS) {
        rMonth[MONTHS[key]] = key;
    }

    return rMonth;
}