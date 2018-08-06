import CurrentMonthBody from "./components/CurrentMonthBody";
import CurrentMonthGroupBody from "./components/CurrentMonthGroupBody";
import CategoriesBody from "./components/CategoriesBody";
import GroupBody from "./components/GroupBody";
import CategoryBody from "./components/CategoryBody";
import PayeesBody from "./components/PayeesBody";
import PayeeBody from "./components/PayeeBody";
import IncomeVsExpensesBody from "./components/IncomeVsExpensesBody";
import NetWorthBody from "./components/NetWorthBody";
import ProjectionsBody from "./components/ProjectionsBody";
import SettingsBody from "./components/SettingsBody";

export const makeLink = (path, params) =>
  path.replace(/:([a-zA-Z]*)/g, (_, part) => params[part]);

const pages = {
  currentMonth: {
    path: "/budgets/:budgetId",
    title: "Current Month Spending",
    Component: CurrentMonthBody,
    props: props => ({
      budget: props.budget,
      currentMonth: props.currentMonth,
      investmentAccounts: props.investmentAccounts
    })
  },
  currentMonthGroup: {
    path: "/budgets/:budgetId/current/:categoryGroupId",
    title: (params, budget) =>
      budget.categoryGroupsById[params.categoryGroupId].name,
    Component: CurrentMonthGroupBody,
    props: (props, params) => ({
      budget: props.budget,
      categoryGroupId: params.categoryGroupId,
      currentMonth: props.currentMonth
    })
  },
  currentMonthCategory: {
    path: "/budgets/:budgetId/current/:categoryGroupId/:categoryId",
    title: (params, budget) => budget.categoriesById[params.categoryId].name,
    Component: CurrentMonthGroupBody,
    props: (props, params) => ({
      budget: props.budget,
      categoryId: params.categoryId,
      categoryGroupId: params.categoryGroupId,
      currentMonth: props.currentMonth
    })
  },
  categories: {
    path: "/budgets/:budgetId/categories",
    title: "Categories",
    Component: CategoriesBody,
    props: props => ({
      budget: props.budget,
      sort: props.settings.categoriesSort
    })
  },
  group: {
    path: "/budgets/:budgetId/category-groups/:categoryGroupId",
    title: (params, budget) =>
      budget.categoryGroupsById[params.categoryGroupId].name,
    Component: GroupBody,
    props: (props, params) => ({
      budget: props.budget,
      categoryGroup: props.budget.categoryGroupsById[params.categoryGroupId]
    })
  },
  category: {
    path: "/budgets/:budgetId/category-groups/:categoryGroupId/:categoryId",
    title: (params, budget) => budget.categoriesById[params.categoryId].name,
    Component: CategoryBody,
    props: (props, params) => ({
      budget: props.budget,
      category: props.budget.categoriesById[params.categoryId]
    })
  },
  payees: {
    path: "/budgets/:budgetId/payees",
    title: "Payees",
    Component: PayeesBody,
    props: props => ({
      budget: props.budget,
      sort: props.settings.payeesSort
    })
  },
  payee: {
    path: "/budgets/:budgetId/payees/:payeeId",
    title: (params, budget) => budget.payeesById[params.payeeId].name,
    Component: PayeeBody,
    props: (props, params) => ({
      budget: props.budget,
      payee: props.budget.payeesById[params.payeeId]
    })
  },
  incomeVsExpenses: {
    path: "/budgets/:budgetId/income-vs-expenses",
    title: "Income vs Expenses",
    Component: IncomeVsExpensesBody,
    props: props => ({
      budget: props.budget,
      investmentAccounts: props.investmentAccounts,
      showing: props.settings.incomeVsExpensesShowing
    })
  },
  netWorth: {
    path: "/budgets/:budgetId/net-worth",
    title: "Net Worth",
    Component: NetWorthBody,
    props: props => ({
      budget: props.budget,
      investmentAccounts: props.investmentAccounts,
      mortgageAccounts: props.mortgageAccounts
    })
  },
  projections: {
    path: "/budgets/:budgetId/projections",
    title: "Retirement Calculator",
    Component: ProjectionsBody,
    props: props => ({
      budget: props.budget,
      investmentAccounts: props.investmentAccounts,
      mortgageAccounts: props.mortgageAccounts
    })
  },
  settings: {
    path: "/budgets/:budgetId/settings",
    title: "Budget Settings",
    Component: SettingsBody,
    props: props => ({
      budget: props.budget,
      investmentAccounts: props.investmentAccounts,
      mortgageAccounts: props.mortgageAccounts,
      onUpdateAccounts: props.onUpdateAccounts
    })
  }
};

export default pages;