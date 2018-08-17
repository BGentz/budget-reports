import { utils } from "ynab";
import moment from "moment";
import compose from "lodash/fp/compose";
import flatMap from "lodash/fp/flatMap";
import dropWhile from "lodash/fp/dropWhile";
import matchesProperty from "lodash/fp/matchesProperty";
import omit from "lodash/fp/omit";
import reverse from "lodash/fp/reverse";
import sortBy from "lodash/fp/sortBy";
import uniq from "lodash/fp/uniq";
import { upsertBy, keyByProp } from "./dataUtils";

const formatCurrency = utils.convertMilliUnitsToCurrencyAmount;

const GROUPS_TO_HIDE = [
  "Internal Master Category",
  "Credit Card Payments",
  "Hidden Categories"
];

const MAX_MONTHS_TO_SHOW = 24;

const sanitizeCategory = category => ({
  ...category,
  activity: formatCurrency(category.activity),
  balance: formatCurrency(category.balance),
  budgeted: formatCurrency(category.budgeted)
});

const sanitizeMonth = ({ categoryGroupsById }) => month => ({
  ...month,
  activity: formatCurrency(month.activity),
  budgeted: formatCurrency(month.budgeted),
  income: formatCurrency(month.income),
  to_be_budgeted: formatCurrency(month.to_be_budgeted),
  categories: month.categories
    .filter(category => !category.deleted && !category.hidden)
    .filter(category => !!categoryGroupsById[category.category_group_id])
    .map(sanitizeCategory)
});

export const sanitizeBudget = budget => {
  const transactionIdsFromSub = uniq(
    budget.subtransactions.map(transaction => transaction.transaction_id)
  );
  const categoryGroups = budget.category_groups.filter(
    group => !GROUPS_TO_HIDE.includes(group.name)
  );
  const categoryGroupsById = keyByProp("id")(categoryGroups);
  const categories = budget.categories.map(sanitizeCategory);
  const months = compose([
    months => months.map(sanitizeMonth({ categoryGroupsById })),
    sortBy("month")
  ])(budget.months);
  const earliestDate = moment()
    .subtract(MAX_MONTHS_TO_SHOW - 1, "months")
    .format("YYYY-MM-01");

  return {
    ...omit(["category_groups"])(budget),
    accountsById: keyByProp("id")(budget.accounts),
    categoryGroups,
    categoryGroupsById,
    categories,
    categoriesById: keyByProp("id")(categories),
    payeesById: keyByProp("id")(budget.payees),
    months,
    transactions: compose([
      transactions =>
        transactions.map(transaction => ({
          ...transaction,
          amount: formatCurrency(transaction.amount)
        })),
      flatMap(
        transaction =>
          transactionIdsFromSub.includes(transaction.id)
            ? compose([
                subs =>
                  subs.map(sub =>
                    omit("transaction_id")({ ...transaction, ...sub })
                  ),
                subs =>
                  subs.filter(matchesProperty("transaction_id", transaction.id))
              ])(budget.subtransactions)
            : transaction
      ),
      reverse,
      dropWhile(transaction => transaction.date < earliestDate),
      sortBy("date"),
      transactions =>
        transactions.filter(transaction => transaction.amount !== 0)
    ])(budget.transactions)
  };
};

const applyDeltas = (arr, deltas, key = "id", updater) =>
  deltas.reduce((acc, curr) => upsertBy(acc, key, curr, updater), arr);

const arraysToUpdate = [
  "accounts",
  "categories",
  "category_groups",
  "payee_locations",
  "payees",
  "scheduled_subtransactions",
  "scheduled_transactions",
  "subtransactions",
  "transactions"
];

export const mergeBudgets = (budget, deltas) => ({
  ...budget,
  ...deltas,
  ...arraysToUpdate.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: applyDeltas(budget[curr], deltas[curr])
    }),
    {}
  ),
  months: applyDeltas(budget.months, deltas.months, "month", (prev, curr) => ({
    ...prev,
    ...curr,
    categories: applyDeltas(prev.categories, curr.categories)
  }))
});
