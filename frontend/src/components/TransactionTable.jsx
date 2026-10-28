import { formatMoney } from './SummaryCards';

export default function TransactionTable({ transactions, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2 text-muted">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return <div className="alert alert-info mb-0">No transactions found. Use the buttons above to add income or expenses.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Source / Category</th>
            <th>Description</th>
            <th className="text-end">Amount</th>
            <th>Date</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const isIncome = t.type === 'income';
            return (
              <tr key={t.transactionId}>
                <td className="text-nowrap">{t.transactionId}</td>
                <td>
                  <span className={`badge rounded-pill px-3 ${isIncome ? 'badge-income' : 'badge-expense'}`}>{isIncome ? 'Income' : 'Expense'}</span>
                </td>
                <td>{t.category}</td>
                <td>{t.description || '-'}</td>
                <td className={`text-end fw-semibold text-nowrap ${isIncome ? 'text-success' : 'text-danger'}`}>
                  {isIncome ? '+' : '-'} {formatMoney(t.amount)}
                </td>
                <td className="text-nowrap">{t.date}</td>
                <td className="text-center text-nowrap">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(t)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(t)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
