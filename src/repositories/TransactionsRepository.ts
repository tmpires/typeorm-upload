import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({});
    const balanceIncome = transactions.reduce((accumulator, currentValue) => {
      if (currentValue.type === 'income') {
        return accumulator + currentValue.value;
      }
      return accumulator;
    }, 0);
    const balanceOutcome = transactions.reduce((accumulator, currentValue) => {
      if (currentValue.type === 'outcome') {
        return accumulator + currentValue.value;
      }
      return accumulator;
    }, 0);
    const balance: Balance = {
      income: balanceIncome,
      outcome: balanceOutcome,
      total: balanceIncome - balanceOutcome,
    };
    return balance;
  }
}

export default TransactionsRepository;
