import { useState } from 'react';

export default function SearchBar({ onSearch, onClear }) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ q: text.trim(), date });
  };

  const handleClear = () => {
    setText('');
    setDate('');
    onClear();
  };

  return (
    <form className="row g-2 mb-3" onSubmit={handleSubmit}>
      <div className="col-12 col-md-5">
        <input
          className="form-control"
          placeholder="Search by ID, category or income source"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="col-12 col-md-3">
        <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="col-12 col-md-4 d-flex gap-2">
        <button type="submit" className="btn btn-primary flex-fill">Search</button>
        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={handleClear}>Clear</button>
      </div>
    </form>
  );
}
