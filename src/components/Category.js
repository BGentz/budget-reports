import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
import Loading from "./Loading";
import SpendingChart from "./SpendingChart";
import Transaction from "./Transaction";

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  font-weight: 600;
`;

class Category extends Component {
  static propTypes = {
    budgetId: PropTypes.string.isRequired,
    categoryId: PropTypes.string.isRequired,
    currentMonth: PropTypes.string.isRequired,
    onRefreshData: PropTypes.func.isRequired,
    onRequestBudgetDetails: PropTypes.func.isRequired,
    budget: PropTypes.shape({
      categories: PropTypes.arrayOf(
        PropTypes.shape({
          budgeted: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired
        })
      ).isRequired,
      payees: PropTypes.objectOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired
        })
      ).isRequired,
      transactions: PropTypes.arrayOf(
        PropTypes.shape({
          amount: PropTypes.number.isRequired,
          date: PropTypes.string.isRequired,
          id: PropTypes.string.isRequired,
          payeeId: PropTypes.string.isRequired
        })
      ).isRequired
    })
  };

  componentDidMount() {
    if (!this.props.budget) {
      this.props.onRequestBudgetDetails(this.props.budgetId);
    }
  }

  render() {
    const {
      budget,
      budgetId,
      categoryId,
      currentMonth,
      onRefreshData
    } = this.props;

    if (!budget) {
      return <Loading />;
    }

    const category = budget.categories.find(
      category => category.id === categoryId
    );
    const payees = keyBy(budget.payees, "id");
    const transactions = sortBy(
      budget.transactions.filter(
        transaction =>
          transaction.categoryId === categoryId &&
          transaction.date.slice(0, 7) === currentMonth
      ),
      "date"
    ).reverse();

    return (
      <Fragment>
        <Header>
          <div>{category.name}</div>
          <div>
            <button
              onClick={() => {
                onRefreshData(budgetId);
              }}
            >
              Refresh Data
            </button>
          </div>
        </Header>
        <div style={{ padding: "0 20px 20px" }}>
          <SpendingChart
            budgeted={category.budgeted}
            currentMonth={currentMonth}
            transactions={transactions}
          />
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          {transactions.map(({ id, payeeId, date, amount }) => (
            <Transaction
              key={id}
              payee={payees[payeeId]}
              date={date}
              amount={amount}
            />
          ))}
        </div>
      </Fragment>
    );
  }
}

export default Category;