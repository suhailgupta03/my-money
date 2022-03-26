import * as React from "react";
import { computeChange } from "../business-logic/compute-change";
import { computeRebalance } from "../business-logic/compute-rebalance";
import { ALLOWED_COMMANDS, MONTHS } from "../constants";

export class Main extends React.Component {
  constructor() {
    super();

    this.state = {
      commandBox: [this.getCommandBox(0)],
      disableNewCommandButton: true,
      commandMap: {},
      portfolio: {
        equity: 0,
        debt: 0,
        gold: 0,
      },
      allocate: [],
      sip: {
        equity: 0,
        gold: 0,
        debt: 0,
      },
      change: {},
      cchange: undefined,
      rebalance: undefined,
      errorMap: {
        allocationDone: false,
        sipDeclared: false,
        atleastOneChangeDeclared: false,
      },
      completedInputMap: {}
    };
  }

  updateCommandValues(enteredCommand) {
    let isCommandValid = false;
    if (enteredCommand) {
      const commandTokens = enteredCommand.split(" ");
      const commandValues = commandTokens.slice(1, commandTokens.length);
      switch (commandTokens[0]) {
        case ALLOWED_COMMANDS.ALLOCATE:
          if (commandValues.length === 3) {
            const equity = parseFloat(commandValues[0]);
            const debt = parseFloat(commandValues[1]);
            const gold = parseFloat(commandValues[2]);
            const sum = equity + debt + gold;
            this.setState({
              allocate: [equity, debt, gold],
              portfolio: {
                equity: equity / sum,
                debt: debt / sum,
                gold: gold / sum,
              },
              errorMap: {
                ...this.state.errorMap,
                allocationDone: true,
              },
            });
            isCommandValid = true;
          }
          break;
        case ALLOWED_COMMANDS.BALANCE:
          if (commandValues.length === 1) {
            const balanceMonth = MONTHS[commandValues[0]];
            if ("undefined" !== typeof balanceMonth) {
              const { debtBalance, equityBalance, goldBalance } = computeChange(
                this.state.allocate,
                this.state.sip,
                this.state.change,
                balanceMonth
              );
              this.setState({
                cchange: [equityBalance, debtBalance, goldBalance],
                errorMap: {
                  ...this.state.errorMap,
                  allocationDone: true,
                },
              });
              isCommandValid = true;
            }
          }
          break;
        case ALLOWED_COMMANDS.CHANGE:
          if (commandValues.length === 4) {
            const equityPercentage = parseFloat(
              commandValues[0].replace("%", "")
            );
            const debtPercentage = parseFloat(
              commandValues[1].replace("%", "")
            );
            const goldPercentage = parseFloat(
              commandValues[2].replace("%", "")
            );
            const month = MONTHS[commandValues[3]];
            if ("undefined" !== typeof month) {
              this.setState({
                change: {
                  ...this.state.change,
                  [month]: {
                    equity: equityPercentage,
                    debt: debtPercentage,
                    gold: goldPercentage,
                  },
                },
                errorMap: {
                  ...this.state.errorMap,
                  atleastOneChangeDeclared: true,
                },
              });
              isCommandValid = true;
            }
          }
          break;
        case ALLOWED_COMMANDS.REBALANCE:
          if (commandValues.length === 0) {
            const rebalanced = computeRebalance(
              this.state.allocate,
              this.state.sip,
              this.state.change,
              this.state.portfolio
            );
            if (Object.keys(rebalanced).length > 0) {
              this.setState({
                rebalance: [
                  rebalanced.rebalancedEquity,
                  rebalanced.rebalancedDebt,
                  rebalanced.rebalancedGold,
                ],
              });
            }
            isCommandValid = true;
          }
          break;
        case ALLOWED_COMMANDS.SIP:
          const equitySip = parseFloat(commandValues[0]);
          const debtSip = parseFloat(commandValues[1]);
          const goldSip = parseFloat(commandValues[2]);
          this.setState({
            sip: {
              equity: equitySip,
              gold: goldSip,
              debt: debtSip,
            },
            errorMap: {
              ...this.state.errorMap,
              sipDeclared: true,
            },
          });
          isCommandValid = true;
          break;
        default:
          isCommandValid = false;
          break;
      }
    }
    return {
      isCommandValid,
    };
  }

  getCommandBox(commandNumber) {
    return (
      <div className="d-flex flex-row mb-2">
        <div className="me-3 d-flex align-items-center">Command</div>
        <div style={{ width: "40%" }}>
          <input
            className="form-control"
            placeholder="VALID COMMAND"
            onChange={(input) => {
              this.onCommandEnter(commandNumber, input.currentTarget.value);
            }}
          />
        </div>
      </div>
    );
  }

  onCommandEnter(commandNumber, enteredValue) {
    this.updateCommandValues(enteredValue);

    this.setState({
      commandMap: {
        ...this.state.commandMap,
        [commandNumber]: enteredValue,
      }
    });
  }

  addNewCommandInput() {
    this.setState({
      commandBox: [
        ...this.state.commandBox,
        this.getCommandBox(this.state.commandBox.length),
      ],
    });
  }

  computationTable(computations, type) {
    return (
      <div className="mt-4">
        <div style={{ width: "40%" }}>
          <span className="text-uppercase mt-5 text-primary bg-warning fw-bold ps-2">
            {type} has been calculated below
          </span>
          <span className="ps-2">🚀</span>
        </div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">Equity</th>
              <th scope="col">Debt</th>
              <th scope="col">Gold</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{computations[0]}</td>
              <td>{computations[1]}</td>
              <td>{computations[2]}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  analyseErrors() {
    const { errorMap } = this.state;
    const { allocationDone, sipDeclared, atleastOneChangeDeclared } = errorMap;
    let errList = [];
    let successList = [];

    if (!allocationDone) errList.push("Allocation has not been initiated yet");
    else successList.push("Allocation has been made");

    if (!sipDeclared) errList.push("SIP amount has not been declared yet");
    else successList.push("SIP amount has been declared");

    if (!atleastOneChangeDeclared)
      errList.push("CHANGE has not detected by the system yet");
    else
      successList.push(
        `CHANGE for ${Object.keys(this.state.change).length} month(s) has been declared`
      );

    if (errList.length > 0) {
      return errList.map((item, key) => (
        <li className="list-group-item list-group-item-warning fs-6" key={key}>{item}</li>
      ));
    } else {
      return successList.map((item, key) => (
        <li className="list-group-item list-group-item-success fs-6" key={key}>{item}</li>
      ));
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-10">
            {this.state.commandBox.map((box, index) => {
              return <div key={index}>{box}</div>;
            })}
            <button
              className="btn btn-primary mt-2"
              onClick={() => this.addNewCommandInput()}
            >
              <i className="bi bi-plus-circle"></i> Next
            </button>

            {"undefined" == typeof this.state.cchange ? (
              <div
                className="text-uppercase mt-5 text-primary bg-warning fw-bold ps-2"
                style={{ width: "40%" }}
              >
                Balance has not been executed yet
              </div>
            ) : (
              this.computationTable(this.state.cchange, "balance")
            )}

            {"undefined" == typeof this.state.rebalance ? (
              <div
                className="text-uppercase mt-5 text-primary bg-warning fw-bold ps-2"
                style={{ width: "40%" }}
              >
                Rebalance has not been executed yet
              </div>
            ) : (
              this.computationTable(this.state.rebalance, "rebalance")
            )}
          </div>

          <div className="col-2">
            <ul className="list-group">{this.analyseErrors()}</ul>
          </div>
        </div>
      </div>
    );
  }
}
