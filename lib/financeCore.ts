
import { Scope } from '../types';

interface TransactionInput {
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  scope: Scope;
  accountId: string; // 'BANK' | 'CASH' | 'JAG'
  category: string;
}

export function sanitizeTransaction(tx: TransactionInput) {
  const warnings: string[] = [];
  
  // Rule 1: JAG Logic
  if (tx.accountId === 'JAG' && tx.type === 'EXPENSE') {
    // You cannot "spend" from JAG directly unless it's a fee
    if (!tx.category.toLowerCase().includes('fee')) {
      warnings.push("Warning: Only Transfers or Fees can be deducted from JAG Holding.");
    }
  }

  // Rule 2: Cash Flow
  if (tx.accountId === 'CASH' && tx.amount > 5000) {
    warnings.push("High Cash Transaction: Verify Anti-Money Laundering limits.");
  }

  // Rule 3: Business Scope Requirement
  if (tx.scope === Scope.BUSINESS && tx.category === 'Uncategorized') {
    warnings.push("Business transactions should ideally be linked to a specific category for reporting.");
  }

  return {
    valid: warnings.length === 0,
    warnings,
    cleanTx: {
      ...tx,
      // Ensure correct polarity
      amount: tx.type === 'EXPENSE' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
    }
  };
}
