import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { getGroupLink } from "../../utils";
import EnsureBudgetLoaded from "../EnsureBudgetLoaded";
import Layout from "../common/Layout";
import BackToBudget from "../header/BackToBudget";
import { PageTitle } from "../common/typeComponents";
import Separator from "../header/Separator";
import PageActions from "../header/PageActions";
import TopNumbers from "../common/TopNumbers";
import SpendingChart from "./SpendingChart";
import Transactions from "./Transactions";

const Category = ({
  budget,
  budgetId,
  categoryId,
  currentMonth,
  onRefreshBudget,
  onRequestBudget
}) => (
  <EnsureBudgetLoaded
    budgetId={budgetId}
    budgetLoaded={!!budget}
    onRequestBudget={onRequestBudget}
  >
    {() => {
      const category = budget.categories.find(
        category => category.id === categoryId
      );
      const categoryGroup = budget.categoryGroups.find(
        group => group.id === category.categoryGroupId
      );
      const transactions = budget.transactions.filter(
        transaction =>
          transaction.categoryId === categoryId &&
          transaction.date.slice(0, 7) === currentMonth
      );

      return (
        <Layout>
          <Layout.Header flushLeft flushRight>
            <BackToBudget budgetId={budgetId} />
            <PageTitle
              style={{ flexGrow: 1, display: "flex", alignItems: "center" }}
            >
              <Link
                to={getGroupLink({
                  budgetId,
                  categoryGroupId: categoryGroup.id
                })}
              >
                {categoryGroup.name}
              </Link>
              <Separator />
              {category.name}
            </PageTitle>
            <PageActions
              budgetId={budgetId}
              onRefreshBudget={onRefreshBudget}
            />
          </Layout.Header>
          <Layout.Body>
            <TopNumbers
              numbers={[
                { label: "budgeted", value: category.budgeted },
                { label: "spent", value: -category.activity },
                { label: "available", value: category.balance }
              ]}
            />
            <SpendingChart
              total={category.balance - category.activity}
              currentMonth={currentMonth}
              transactions={transactions}
            />
            <Transactions
              transactions={transactions}
              payeesById={budget.payeesById}
            />
          </Layout.Body>
        </Layout>
      );
    }}
  </EnsureBudgetLoaded>
);

Category.propTypes = {
  budgetId: PropTypes.string.isRequired,
  categoryId: PropTypes.string.isRequired,
  currentMonth: PropTypes.string.isRequired,
  onRefreshBudget: PropTypes.func.isRequired,
  onRequestBudget: PropTypes.func.isRequired,
  budget: PropTypes.shape({
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        activity: PropTypes.number.isRequired,
        balance: PropTypes.number.isRequired,
        budgeted: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ).isRequired,
    payeesById: PropTypes.objectOf(
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

export default Category;