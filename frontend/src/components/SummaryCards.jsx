export const formatMoney = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Totals are calculated from ALL saved records (not just the searched ones)
export default function SummaryCards({ transactions }) {
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <div className="card summary-card income shadow-sm">
          <div className="card-body">
            <div className="summary-label">Total Income</div>
            <div className="fs-3 fw-bold text-success">{formatMoney(totalIncome)}</div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card summary-card expense shadow-sm">
          <div className="card-body">
            <div className="summary-label">Total Expenses</div>
            <div className="fs-3 fw-bold text-danger">{formatMoney(totalExpense)}</div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card summary-card balance shadow-sm">
          <div className="card-body">
            <div className="summary-label">Remaining Balance</div>
            <div className={`fs-3 fw-bold ${balance < 0 ? 'text-danger' : 'text-primary'}`}>{formatMoney(balance)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
