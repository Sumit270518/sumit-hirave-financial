import Transaction, { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../models/Transaction.js';

export const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'date',
      order = 'desc',
    } = req.query;

    const query = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction.',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      amount,
      currency = 'INR',
      category,
      description,
      date,
      paymentMethod,
      isInternalTransfer = false,
      notes,
    } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Type, amount, and category are required.',
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense".',
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number.',
      });
    }

    const parsedDate = date ? new Date(date) : new Date();
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction date format.',
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: Math.round(numericAmount * 100) / 100,
      currency,
      category: category.trim(),
      description: description ? description.trim() : '',
      date: parsedDate,
      paymentMethod: paymentMethod || 'upi',
      isInternalTransfer: Boolean(isInternalTransfer),
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this transaction.',
      });
    }

    const {
      type,
      amount,
      currency,
      category,
      description,
      date,
      paymentMethod,
      isInternalTransfer,
      notes,
    } = req.body;

    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid transaction type.' });
      }
      transaction.type = type;
    }

    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });
      }
      transaction.amount = Math.round(num * 100) / 100;
    }

    if (currency) transaction.currency = currency;
    if (category) transaction.category = category.trim();
    if (description !== undefined) transaction.description = description.trim();
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid transaction date.' });
      }
      transaction.date = parsedDate;
    }
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (isInternalTransfer !== undefined) transaction.isInternalTransfer = Boolean(isInternalTransfer);
    if (notes !== undefined) transaction.notes = notes.trim();

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transaction.',
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();

    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth, 1));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59, 999));

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let totalIncome = 0;
    let totalExpense = 0; // regular consumption expenses
    let totalTransfers = 0; // internal transfers (e.g., to savings/investments)
    const categoryTotals = {};
    const incomeCategories = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeCategories[tx.category] = (incomeCategories[tx.category] || 0) + tx.amount;
      } else if (tx.type === 'expense') {
        if (tx.isInternalTransfer) {
          totalTransfers += tx.amount;
        } else {
          totalExpense += tx.amount;
          categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        }
      }
    });

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpense = Math.round(totalExpense * 100) / 100;
    totalTransfers = Math.round(totalTransfers * 100) / 100;

    // Savings = Income - Consumption Expenses
    const savings = Math.round((totalIncome - totalExpense) * 100) / 100;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 1000) / 10 : 0;

    const categoryList = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat,
      amount: Math.round(amt * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((amt / totalExpense) * 1000) / 10 : 0,
    }));

    res.status(200).json({
      success: true,
      period: {
        year: targetYear,
        month: targetMonth + 1,
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
      summary: {
        totalIncome,
        totalExpense,
        totalTransfers,
        savings,
        savingsRate,
        transactionCount: transactions.length,
      },
      expenseCategories: categoryList,
      incomeCategories: Object.entries(incomeCategories).map(([cat, amt]) => ({
        category: cat,
        amount: Math.round(amt * 100) / 100,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const exportTransactionsCSV = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });

    const headers = 'ID,Type,Amount,Currency,Category,Description,Date,PaymentMethod,IsInternalTransfer\n';
    const rows = transactions.map((t) => {
      const cleanDesc = `"${(t.description || '').replace(/"/g, '""')}"`;
      const dateStr = t.date.toISOString().split('T')[0];
      return `${t._id},${t.type},${t.amount},${t.currency},"${t.category}",${cleanDesc},${dateStr},${t.paymentMethod},${t.isInternalTransfer}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions_export.csv"');
    res.status(200).send(headers + rows);
  } catch (error) {
    next(error);
  }
};
