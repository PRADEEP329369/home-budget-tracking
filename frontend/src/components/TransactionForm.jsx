import { useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

// One form used for: add income, add expense, and edit.
// `type` is "income" or "expense"; `initial` is the record being edited (or null when adding).
export default function TransactionForm({ type, initial, saving, onSave, onCancel }) {
  const isIncome = type === 'income';
  const [form, setForm] = useState({
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    amount: initial?.amount ?? '',
    date: initial?.date ?? today(),
  });
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return; // prevents double submit

    if (!form.category.trim()) return setError(isIncome ? 'Income source is required.' : 'Category is required.');
    if (!isIncome && !form.description.trim()) return setError('Description is required.');
    if (!(Number(form.amount) > 0)) return setError('Amount must be a number greater than 0.');
    if (!form.date) return setError('Date is required.');

    setError('');
    onSave({ type, ...form, amount: Number(form.amount) });
  };

  const title = `${initial ? 'Edit' : 'Add'} ${isIncome ? 'Income' : 'Expense'}`;

  return (
    <div className="modal d-block modal-backdrop-custom" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <form className={`modal-content ${type}`} onSubmit={handleSubmit} noValidate>
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close" />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="mb-3">
              <label className="form-label">{isIncome ? 'Income ID' : 'Expense ID'}</label>
              <input className="form-control" disabled value={initial?.transactionId ?? 'Generated automatically'} />
            </div>

            <div className="mb-3">
              <label className="form-label">{isIncome ? 'Income Source' : 'Category'}</label>
              <input
                className="form-control"
                name="category"
                value={form.category}
                onChange={change}
                placeholder={isIncome ? 'e.g. Salary' : 'e.g. Groceries'}
              />
            </div>

            {!isIncome && (
              <div className="mb-3">
                <label className="form-label">Description</label>
                <input
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={change}
                  placeholder="e.g. Weekly vegetables"
                />
              </div>
            )}

            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-control"
                  name="amount"
                  value={form.amount}
                  onChange={change}
                />
              </div>
              <div className="col-6 mb-3">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" name="date" value={form.date} onChange={change} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
            <button type="submit" className={`btn ${isIncome ? 'btn-success' : 'btn-danger'}`} disabled={saving}>
              {saving ? 'Saving...' : initial ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
