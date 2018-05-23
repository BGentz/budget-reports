import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";
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

class CategoryGroup extends Component {
  static propTypes = {
    budgetId: PropTypes.string.isRequired,
    categoryGroupId: PropTypes.string.isRequired,
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
      categoryGroupId,
      currentMonth,
      onRefreshData
    } = this.props;

    if (!budget) {
      return <Loading />;
    }

    const categoryGroup = budget.categoryGroups.find(
      group => group.id === categoryGroupId
    );
    const categories = budget.categories.filter(
      category => category.categoryGroupId === categoryGroupId
    );
    const categoryIds = categories.map(category => category.id);

    const payees = keyBy(budget.payees, "id");
    const transactions = sortBy(
      budget.transactions.filter(
        transaction =>
          categoryIds.includes(transaction.categoryId) &&
          transaction.date.slice(0, 7) === currentMonth
      ),
      "date"
    ).reverse();

    return (
      <Fragment>
        <Header>
          <div>{categoryGroup.name}</div>
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
            budgeted={sumBy(categories, "budgeted")}
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

export default CategoryGroup;