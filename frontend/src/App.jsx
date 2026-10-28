import { useEffect, useState } from 'react';
import SummaryCards from './components/SummaryCards';
import SearchBar from './components/SearchBar';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getErrorMessage,
} from './api';
export default function App() {
  const [allTransactions, setAllTransactions] = useState([]); // used for the summary cards
  const [transactions, setTransactions] = useState([]); // shown in the table (may be filtered)
  const [filters, setFilters] = useState({ q: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'danger', text }
  const [formState, setFormState] = useState(null); 
  // Gets data from the backend: all records for the cards, searched records for the table
  const loadData = async (activeFilters) => {
    setLoading(true);
    try {
      const all = await fetchTransactions();
      const searching = activeFilters.q || activeFilters.date;
      setAllTransactions(all);
      setTransactions(searching ? await fetchTransactions(activeFilters) : all);
    } catch (err) {
      setMessage({ type: 'danger', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData(filters);
  }, [filters]);
  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (formState.record) {
        await updateTransaction(formState.record.transactionId, data);
        setMessage({ type: 'success', text: 'Transaction updated successfully.' });
      } else {
        await createTransaction(data);
        setMessage({ type: 'success', text: `${data.type === 'income' ? 'Income' : 'Expense'} added successfully.` });
      }
      setFormState(null);
      await loadData(filters);
    } catch (err) {
      setMessage({ type: 'danger', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (t) => {
    if (!window.confirm(`Delete ${t.type} ${t.transactionId} (${t.category})? This cannot be undone.`)) return;
    try {
      await deleteTransaction(t.transactionId);
      setMessage({ type: 'success', text: 'Transaction deleted successfully.' });
      await loadData(filters);
    } catch (err) {
      setMessage({ type: 'danger', text: getErrorMessage(err) });
    }
  };
  return (
    <div className="container py-4">
      <div className="text-center mb-4 app-header">
        <h1 className="h2 fw-bold mb-1">Home Budget Tracking System</h1>
        <p className="text-secondary mb-0">Track your income and expenses in one place</p>
      </div>
      {message && (
        <div className={`alert alert-${message.type} alert-dismissible`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)} aria-label="Close" />
        </div>
      )}
      <SummaryCards transactions={allTransactions} />
      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <h2 className="h5 fw-semibold mb-0">All Transactions</h2>
            <div className="d-flex gap-2 action-buttons">
              <button className="btn btn-success" onClick={() => setFormState({ type: 'income', record: null })}>
                + Add Income
              </button>
              <button className="btn btn-danger" onClick={() => setFormState({ type: 'expense', record: null })}>
                + Add Expense
              </button>
            </div>
          </div>
          <SearchBar onSearch={setFilters} onClear={() => setFilters({ q: '', date: '' })} />
          <TransactionTable
            transactions={transactions}
            loading={loading}
            onEdit={(t) => setFormState({ type: t.type, record: t })}
            onDelete={handleDelete}
          />
        </div>
      </div>
      {formState && (
        <TransactionForm
          key={formState.record?.transactionId ?? formState.type}
          type={formState.type}
          initial={formState.record}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setFormState(null)}
        />
      )}
    </div>
  );
}
