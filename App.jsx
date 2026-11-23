import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Wallet, ArrowDownLeft, TrendingUp, ReceiptText,
  Search, Plus, Download, Pencil, Trash2, X, ChevronDown, CalendarDays,
  ShoppingBag, Car, Utensils, House, HeartPulse, GraduationCap, Zap,
  CircleHelp, Menu, Sparkles
} from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Education', 'Housing', 'Other'];
const COLORS = {
  Food: '#8b7cf6', Transport: '#45b8ac', Shopping: '#f3a64a', Bills: '#e879a5',
  Health: '#5b9cf5', Education: '#9b83d5', Housing: '#e27d65', Other: '#8b98aa'
};
const ICONS = {
  Food: Utensils, Transport: Car, Shopping: ShoppingBag, Bills: Zap,
  Health: HeartPulse, Education: GraduationCap, Housing: House, Other: CircleHelp
};
const seed = [
  { id: 1, title: 'Grocery shopping', category: 'Food', amount: 1250, date: '2026-11-23', note: 'Weekly groceries' },
  { id: 2, title: 'Monthly bus pass', category: 'Transport', amount: 850, date: '2026-11-22', note: '' },
  { id: 3, title: 'Electricity bill', category: 'Bills', amount: 1100, date: '2026-11-21', note: '' },
  { id: 4, title: 'Coffee and snacks', category: 'Food', amount: 280, date: '2026-11-20', note: '' },
  { id: 5, title: 'New headphones', category: 'Shopping', amount: 1799, date: '2026-11-19', note: '' },
  { id: 6, title: 'Pharmacy', category: 'Health', amount: 460, date: '2026-11-18', note: '' },
];

const money = value => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(value);

function App() {
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('pocketwise-expenses');
      return saved ? JSON.parse(saved) : seed;
    } catch { return seed; }
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem('pocketwise-expenses', JSON.stringify(expenses));
  }, [expenses]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth = expenses.filter(e => e.date?.slice(0, 7) === currentMonth);
  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const monthTotal = thisMonth.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const average = expenses.length ? total / expenses.length : 0;

  const filtered = useMemo(() => expenses
    .filter(e => `${e.title} ${e.category} ${e.note || ''}`.toLowerCase().includes(search.toLowerCase()))
    .filter(e => category === 'All categories' || e.category === category)
    .sort((a, b) => b.date.localeCompare(a.date)), [expenses, search, category]);

  const breakdown = CATEGORIES.map(name => ({
    name,
    amount: expenses.filter(e => e.category === name).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount);
  const maxCategory = Math.max(1, ...breakdown.map(x => x.amount));

  function openAdd() { setEditing(null); setModal(true); }
  function openEdit(item) { setEditing(item); setModal(true); }
  function saveExpense(data) {
    if (editing) setExpenses(old => old.map(e => e.id === editing.id ? { ...data, id: editing.id } : e));
    else setExpenses(old => [{ ...data, id: Date.now() }, ...old]);
    setModal(false);
  }
  function removeExpense(id) {
    if (window.confirm('Delete this expense?')) setExpenses(old => old.filter(e => e.id !== id));
  }
  function exportCSV() {
    const rows = [['Title', 'Category', 'Amount (INR)', 'Date', 'Note'], ...filtered.map(e => [e.title, e.category, e.amount, e.date, e.note || ''])];
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pocketwise-expenses.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Wallet size={21}/></div><span>Pocket<span>Wise</span></span></div>
      <div className="nav-label">MENU</div>
      <button className="nav-item active" onClick={() => setMobileMenu(false)}><LayoutDashboard size={18}/> Dashboard</button>
      <button className="nav-item" onClick={() => { setCategory('All categories'); setMobileMenu(false); }}><ReceiptText size={18}/> Transactions</button>
      <div className="sidebar-bottom">
        <div className="tip-card"><div className="tip-icon"><Sparkles size={17}/></div><strong>Small steps add up.</strong><p>Keep tracking your spending to build better money habits.</p></div>
        <div className="profile"><div className="avatar">PW</div><div><strong>My Wallet</strong><small>Personal account</small></div><ChevronDown size={16}/></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}><Menu/></button>
        <div><div className="eyebrow">OVERVIEW</div><h1>Dashboard</h1></div>
        <div className="top-actions"><div className="date-pill"><CalendarDays size={16}/> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div><button className="primary-btn" onClick={openAdd}><Plus size={17}/> Add expense</button></div>
      </header>

      <section className="welcome-row"><div><h2>Good day! <span>✦</span></h2><p>Here’s what’s happening with your expenses.</p></div><div className="welcome-decoration">₹</div></section>

      <section className="stats-grid">
        <StatCard label="Total expenses" value={money(total)} caption="Across all transactions" icon={<Wallet/>} tone="purple"/>
        <StatCard label="This month" value={money(monthTotal)} caption="Your monthly spending" icon={<ArrowDownLeft/>} tone="teal"/>
        <StatCard label="Average expense" value={money(average)} caption="Per transaction" icon={<TrendingUp/>} tone="orange"/>
        <StatCard label="Transactions" value={expenses.length} caption="Recorded expenses" icon={<ReceiptText/>} tone="pink"/>
      </section>

      <section className="content-grid">
        <div className="panel category-panel">
          <div className="panel-heading"><div><h3>Spending by category</h3><p>Where your money goes</p></div><span className="soft-badge">All time</span></div>
          {breakdown.length ? <div className="category-list">{breakdown.map(item => {
            const Icon = ICONS[item.name] || CircleHelp;
            return <div className="category-row" key={item.name}><div className="category-symbol" style={{ color: COLORS[item.name], background: `${COLORS[item.name]}18` }}><Icon size={17}/></div><div className="category-info"><div className="category-meta"><strong>{item.name}</strong><span>{money(item.amount)}</span></div><div className="bar-track"><div className="bar-fill" style={{ width: `${item.amount / maxCategory * 100}%`, background: COLORS[item.name] }}/></div></div></div>;
          })}</div> : <Empty text="Add an expense to see your category breakdown."/>}
        </div>
        <div className="panel snapshot-panel">
          <div className="panel-heading"><div><h3>Spending snapshot</h3><p>A quick look at your wallet</p></div><div className="snapshot-icon"><TrendingUp size={19}/></div></div>
          <div className="snapshot-total">{money(monthTotal)}</div><div className="snapshot-label">Spent this month</div>
          <div className="snapshot-divider"/>
          <div className="snapshot-line"><span>Transactions this month</span><strong>{thisMonth.length}</strong></div>
          <div className="snapshot-line"><span>Top spending category</span><strong>{breakdown[0]?.name || '—'}</strong></div>
          <div className="snapshot-note"><Sparkles size={15}/> Every expense tracked is a step towards clarity.</div>
        </div>
      </section>

      <section className="panel transactions-panel">
        <div className="panel-heading transaction-heading"><div><h3>Recent transactions</h3><p>Review and manage your expenses</p></div><button className="outline-btn" onClick={exportCSV}><Download size={16}/> Export CSV</button></div>
        <div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."/></div><select value={category} onChange={e => setCategory(e.target.value)}><option>All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="table-wrap"><table><thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th className="actions-head">ACTIONS</th></tr></thead><tbody>
          {filtered.map(item => { const Icon = ICONS[item.category] || CircleHelp; return <tr key={item.id}><td><div className="transaction-name"><div className="transaction-icon" style={{ color: COLORS[item.category], background: `${COLORS[item.category]}18` }}><Icon size={17}/></div><div><strong>{item.title}</strong>{item.note && <small>{item.note}</small>}</div></div></td><td><span className="category-tag" style={{ color: COLORS[item.category], background: `${COLORS[item.category]}18` }}>{item.category}</span></td><td className="date-cell">{new Date(`${item.date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td><td className="amount-cell">− {money(Number(item.amount))}</td><td><div className="row-actions"><button aria-label="Edit expense" onClick={() => openEdit(item)}><Pencil size={15}/></button><button aria-label="Delete expense" onClick={() => removeExpense(item.id)}><Trash2 size={15}/></button></div></td></tr>; })}
        </tbody></table>{!filtered.length && <Empty text="No matching expenses. Try another search or add a new expense."/>}</div>
        <div className="table-footer">Showing <strong>{filtered.length}</strong> of <strong>{expenses.length}</strong> transactions</div>
      </section>
      <footer>Made with care by PocketWise <span>•</span> Your money, in focus.</footer>
    </main>
    {modal && <ExpenseModal initial={editing} onClose={() => setModal(false)} onSave={saveExpense}/>}
  </div>;
}

function StatCard({ label, value, caption, icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-caption">{caption}</div></div>;
}
function Empty({ text }) { return <div className="empty-state">{text}</div>; }

function ExpenseModal({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [category, setCategory] = useState(initial?.category || 'Food');
  const [date, setDate] = useState(initial?.date || new Date().toLocaleDateString('en-CA'));
  const [note, setNote] = useState(initial?.note || '');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('Please enter an expense name.');
    if (!amount || Number(amount) <= 0) return setError('Please enter an amount greater than zero.');
    onSave({ title: title.trim(), amount: Number(amount), category, date, note: note.trim() });
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><form className="modal" onSubmit={submit}>
    <div className="modal-heading"><div><h2>{initial ? 'Edit expense' : 'Add an expense'}</h2><p>Enter the details of your transaction.</p></div><button type="button" className="close-btn" onClick={onClose}><X/></button></div>
    <label>Expense name<input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Grocery shopping"/></label>
    <div className="form-two"><label>Amount (₹)<input type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"/></label><label>Category<select value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label></div>
    <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} required/></label>
    <label>Note <span className="optional">(optional)</span><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a short note..." rows="3"/></label>
    {error && <div className="form-error">{error}</div>}
    <div className="modal-actions"><button type="button" className="outline-btn" onClick={onClose}>Cancel</button><button className="primary-btn" type="submit">{initial ? 'Save changes' : 'Add expense'}</button></div>
  </form></div>;
}

export default App;
