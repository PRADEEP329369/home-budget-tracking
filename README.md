# Home Budget Tracking System

A simple web app to record income and expenses, view/search/edit/delete them, and see the remaining balance.

## Features
- Add Income (source, amount, date) and Add Expense (category, description, amount, date)
- Transaction IDs are generated automatically and are unique (`INC-...` / `EXP-...`)
- Table of all transactions with Income/Expense badges
- Search by transaction ID, category/source, and date (with a Clear button)
- Edit and Delete (with confirmation) for every transaction
- Dashboard cards: Total Income, Total Expenses, Remaining Balance (Income - Expenses)
- Loading spinner, empty-state message, friendly error messages, duplicate-submit protection

## Technologies
| Part | Technology |
|---|---|
| Frontend | React (Vite), Bootstrap 5, Axios |
| Backend | Node.js, Express.js, CORS, dotenv |
| Database | MongoDB Atlas via the official `mongodb` driver (no Mongoose), collection `transactions` |

## Folder structure
```
home-budget-tracking/
├── backend/
│   ├── server.js              # Express app, CORS, starts DB connection
│   ├── db.js                  # MongoDB Atlas connection
│   ├── routes/transactions.js # CRUD routes + validation
│   ├── .env.example           # copy to .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # main page, talks to the API
│   │   ├── api.js             # Axios calls
│   │   └── components/        # SummaryCards, SearchBar, TransactionTable, TransactionForm
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup (Windows PowerShell + VS Code)

Open the `home-budget-tracking` folder in VS Code, then open two terminals (Terminal > New Terminal).

### 1. MongoDB Atlas (one time)
1. Sign in at https://cloud.mongodb.com and create a free **M0** cluster.
2. **Database Access** > Add New Database User > choose a username and password (avoid `@ : / ?` in the password) > role *Read and write to any database*.
3. **Network Access** > Add IP Address > *Allow access from anywhere* (`0.0.0.0/0`) for the demo (or add your current IP).
4. **Database** > Connect > Drivers > copy the connection string. It looks like  
   `mongodb+srv://myuser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

### 2. Backend (Terminal 1)
```powershell
cd backend
npm install
```
A `backend\.env` file is already there with placeholders. Open it and set:
```
MONGODB_URI=mongodb+srv://myuser:MyRealPassword@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
DB_NAME=home_budget
```
(If `.env` is missing: `Copy-Item .env.example .env`.) Replace `<password>` with your real password, without the `< >`.

Start the server:
```powershell
npm start
```
You should see `Connected to MongoDB Atlas (database: home_budget)`. If not, the terminal lists what to check. The database and `transactions` collection are created automatically on the first insert.

### 3. Frontend (Terminal 2)
```powershell
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser. (Optional: `Copy-Item .env.example .env` in `frontend` if your backend is not on port 5000.)

If PowerShell blocks `npm` with a script-execution error, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use `npm.cmd`.

## API endpoints
| Method | URL | Purpose |
|---|---|---|
| POST | `/api/transactions` | Insert a transaction |
| GET | `/api/transactions` | List all (optional `?q=text&date=YYYY-MM-DD` to search) |
| GET | `/api/transactions/:id` | Get one by transaction ID |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/health` | Shows if the server and database are up |

Example body:
```json
{ "type": "expense", "category": "Groceries", "description": "Vegetables", "amount": 450.5, "date": "2026-10-24" }
```
Income uses `type: "income"` with `category` holding the income source (description is not needed).

Status codes: 201 created, 200 ok, 400 validation / invalid ID, 404 not found, 503 database not connected, 500 server error.

## Testing checklist (manual)
1. **Add income**: *Add Income* > Salary, 50000, today > Save. Green success message; row appears with a green *Income* badge.
2. **Add expense**: *Add Expense* > Groceries, "Vegetables", 1250.50 > Save. Row appears with a red *Expense* badge.
3. **Persistence**: press F5. Both rows are still there (they come from Atlas). You can also see them in Atlas > Database > Browse Collections.
4. **Totals**: Total Income 50,000.00, Total Expenses 1,250.50, Remaining Balance 48,749.50.
5. **Search**: type part of an ID, then "groc", then "sal" and press Search; then pick a date and Search; click *Clear* to reset.
6. **Update**: *Edit* on a row, change the amount > Update. Table, cards and the Atlas document change.
7. **Delete**: *Delete* > confirm. The row disappears and the document is gone in Atlas.
8. **Validation**: submit with an empty field or amount 0 / -5 and see the error message.
9. **Error handling**: stop the backend (Ctrl+C) and click Search or reload. The page shows "Cannot reach the backend server...". Put a wrong password in `.env` and restart the backend to see the Atlas troubleshooting hints.

## Notes
- Money values are shown in Indian Rupees (₹); change the symbol in `SummaryCards.jsx` if needed.
- Edit keeps the transaction type fixed (an income stays an income).
- Never commit `backend/.env` or share your connection string; `.gitignore` already excludes it.
