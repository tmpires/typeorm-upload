import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);
    const balance = await transactionRepository.getBalance();
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Insufficient funds');
    }
    let existingCategory = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!existingCategory) {
      existingCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(existingCategory);
    }
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: existingCategory.id,
      category: existingCategory,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
