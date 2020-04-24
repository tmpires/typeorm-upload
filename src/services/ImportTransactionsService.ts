import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filePath: string;
}

async function loadCSV(csvFilePath: string): Promise<Array<string[]>> {
  const readCSVStream = fs.createReadStream(csvFilePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: Array<string[]> = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<Transaction[]> {
    const create = new CreateTransactionService();
    const csvFilePath = path.resolve(filePath);
    const data = await loadCSV(csvFilePath);
    const transactionsDTO: TransactionDTO[] = data.map(row => ({
      title: row[0],
      type: row[1] === 'income' ? 'income' : 'outcome',
      value: parseFloat(row[2]),
      category: row[3],
    }));
    const transactions: Transaction[] = [];
    for (let index = 0; index < transactionsDTO.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const transaction = await create.execute(transactionsDTO[index]);
      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
