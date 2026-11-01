import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Plus, Trash2, Edit2, AlertTriangle, ArrowLeft, 
  TrendingUp, Check, PieChart as PieIcon, BarChart3, Sparkles, 
  ShieldCheck, Loader2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { EventItem, BudgetOverview, BudgetItem, ExpenseItem } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';

interface BudgetPageProps {
  event: EventItem;
  onBack: () => void;
}

const COLORS = ['#7c3aed', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

export const BudgetPage: React.FC<BudgetPageProps> = ({ event, onBack }) => {
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Expense modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

  // Budget category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAllocated, setNewCatAllocated] = useState('');

  // AI Optimizer modal states
  const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [overviewData, expensesData] = await Promise.all([
        api.getBudgetOverview(event.id),
        api.getExpenses(event.id),
      ]);
      setBudgetOverview(overviewData);
      setExpenses(expensesData);
      if (overviewData.categories.length > 0 && !expenseCategory) {
        setExpenseCategory(overviewData.categories[0].category);
      }
    } catch (err) {
      console.error('Error fetching budget data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [event.id]);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpenseId) {
        await api.updateExpense(event.id, editingExpenseId, {
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          description: expenseDesc,
          expense_date: expenseDate,
        });
      } else {
        await api.createExpense(event.id, {
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          description: expenseDesc,
          expense_date: expenseDate,
        });
      }
      setIsExpenseModalOpen(false);
      setEditingExpenseId(null);
      setExpenseAmount('');
      setExpenseDesc('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.deleteExpense(event.id, expenseId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addBudgetCategory(event.id, {
        category: newCatName,
        allocated_amount: parseFloat(newCatAllocated),
      });
      setIsCategoryModalOpen(false);
      setNewCatName('');
      setNewCatAllocated('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (catId: number) => {
    if (!window.confirm('Delete this budget category?')) return;
    try {
      await api.deleteBudgetCategory(event.id, catId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    setIsOptimizerModalOpen(true);
    try {
      const res = await api.optimizeBudget(event.id, 12.0);
      setOptimizationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Chart data
  const pieData = (budgetOverview?.categories || []).map((cat) => ({
    name: cat.category,
    value: cat.allocated_amount,
  }));

  const barData = (budgetOverview?.categories || []).map((cat) => ({
    name: cat.category.length > 12 ? cat.category.substring(0, 10) + '...' : cat.category,
    Allocated: cat.allocated_amount,
    Actual: cat.actual_amount,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-purple-200 text-slate-600 hover:text-slate-900 hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              Budget & Expense Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time deterministic financial reconciliation for {event.event_name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunOptimizer}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand-800 font-semibold text-xs sm:text-sm border border-purple-200 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>AI Budget Optimizer</span>
          </button>
          <button
            onClick={() => {
              setEditingExpenseId(null);
              setExpenseAmount('');
              setExpenseDesc('');
              setIsExpenseModalOpen(true);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Over-budget Warning */}
      {budgetOverview?.is_over_budget && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 shadow-soft animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Spending Alert: Budget Limit Exceeded</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Your actual expenses ({event.currency} {budgetOverview.total_actual.toLocaleString()}) or planned allocations ({event.currency} {budgetOverview.total_allocated.toLocaleString()}) exceed the total budget of {event.currency} {event.total_budget.toLocaleString()}. Use the AI Optimizer below to rebalance allocations.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Event Budget</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
            {event.currency} {event.total_budget.toLocaleString()}
          </p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Hard Cap
          </span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Allocated</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-brand-700 mt-1">
            {event.currency} {budgetOverview?.total_allocated.toLocaleString() || '0'}
          </p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-brand-700 bg-purple-100 px-2 py-0.5 rounded-full">
            {event.total_budget > 0 ? Math.round(((budgetOverview?.total_allocated || 0) / event.total_budget) * 100) : 0}% of budget
          </span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Actual Disbursed</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
            {event.currency} {budgetOverview?.total_actual.toLocaleString() || '0'}
          </p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {expenses.length} payments recorded
          </span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Remaining Available</span>
          <p className={`text-2xl sm:text-3xl font-bold font-serif mt-1 ${
            (budgetOverview?.remaining_balance || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {event.currency} {budgetOverview?.remaining_balance.toLocaleString() || '0'}
          </p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Exact to the cent
          </span>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie: Category Share */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-serif text-slate-900 flex items-center">
              <PieIcon className="w-4 h-4 mr-2 text-brand-600" /> Category Allocation Share
            </h3>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${event.currency} ${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: Allocated vs Actual */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-serif text-slate-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" /> Allocated vs Actual Spent
            </h3>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(value: any) => `${event.currency} ${Number(value).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Allocated" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Category Allocations Table */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Category Budgets</h3>
            <p className="text-xs text-slate-500">Fine-tune allocated capital for each event category</p>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Category</th>
                <th className="pb-3">Allocated ({event.currency})</th>
                <th className="pb-3">Share (%)</th>
                <th className="pb-3">Actual Spent</th>
                <th className="pb-3">Variance</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {budgetOverview?.categories.map((cat) => {
                const variance = cat.allocated_amount - cat.actual_amount;
                return (
                  <tr key={cat.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-800">{cat.category}</td>
                    <td className="py-3 text-slate-700 font-medium">
                      {event.currency} {cat.allocated_amount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-brand-800 font-semibold text-xs">
                        {cat.percentage}%
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-900">
                      {event.currency} {cat.actual_amount.toLocaleString()}
                    </td>
                    <td className="py-3 font-semibold">
                      <span className={variance < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {variance < 0 ? '-' : '+'}{event.currency} {Math.abs(variance).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses Log */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Itemized Expense History</h3>
            <p className="text-xs text-slate-500">Every recorded payment and deposit</p>
          </div>
          <button
            onClick={() => {
              setEditingExpenseId(null);
              setExpenseAmount('');
              setExpenseDesc('');
              setIsExpenseModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
            No expenses recorded yet. Click "Record Expense" to add your first vendor payment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Amount ({event.currency})</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 text-slate-500">{exp.expense_date}</td>
                    <td className="py-3 font-semibold text-slate-800">{exp.category}</td>
                    <td className="py-3 text-slate-600">{exp.description || '—'}</td>
                    <td className="py-3 font-bold text-slate-900">
                      {event.currency} {exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingExpenseId(exp.id);
                          setExpenseCategory(exp.category);
                          setExpenseAmount(exp.amount.toString());
                          setExpenseDesc(exp.description || '');
                          setExpenseDate(exp.expense_date);
                          setIsExpenseModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: RECORD EXPENSE */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title={editingExpenseId ? 'Edit Expense Record' : 'Record New Expense'}
        subtitle="Log an actual invoice or deposit paid"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
            >
              {(budgetOverview?.categories || []).map((cat) => (
                <option key={cat.id} value={cat.category}>{cat.category}</option>
              ))}
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Amount ({event.currency})</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date Paid</label>
            <input
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Memo</label>
            <input
              type="text"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              placeholder="e.g., 50% advance to floral vendor"
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-soft"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD CATEGORY */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Budget Category"
        subtitle="Allocate funds for a specific segment"
      >
        <form onSubmit={handleAddCategory} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category Title</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g., Drone Videography / Welcome Gift Hampers"
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Allocated Amount ({event.currency})</label>
            <input
              type="number"
              step="100"
              required
              min="0"
              value={newCatAllocated}
              onChange={(e) => setNewCatAllocated(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-soft"
            >
              Add Category
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SMART BUDGET OPTIMIZER */}
      <Modal
        isOpen={isOptimizerModalOpen}
        onClose={() => setIsOptimizerModalOpen(false)}
        title="AI Smart Budget Optimizer"
        subtitle="Market-calibrated cost reductions & contingency preservation"
        maxWidth="max-w-3xl"
      >
        {isOptimizing ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto" />
            <p className="text-sm text-slate-600 font-medium">Analyzing budget elasticity and vendor benchmarks...</p>
          </div>
        ) : optimizationResult ? (
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-brand-900">Optimization Strategy</h4>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{optimizationResult.overall_strategy}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Original Capital</span>
                <p className="font-bold text-slate-900 text-base">{event.currency} {optimizationResult.original_total.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase">Projected Savings</span>
                <p className="font-bold text-emerald-800 text-base">+{event.currency} {optimizationResult.projected_savings.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-semibold text-brand-700 uppercase">Contingency Buffer</span>
                <p className="font-bold text-brand-900 text-base">{event.currency} {optimizationResult.contingency_fund_allocated.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <h5 className="font-bold text-slate-900 font-serif">Category Optimization Proposals</h5>
              {optimizationResult.category_recommendations?.map((item: any, i: number) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-purple-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.category}</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Save {event.currency} {item.savings_amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{item.rationale}</p>
                  {item.specific_actionable_tips?.length > 0 && (
                    <ul className="text-[11px] text-slate-500 list-disc list-inside pt-1">
                      {item.specific_actionable_tips.map((tip: string, ti: number) => (
                        <li key={ti}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <button
                onClick={() => setIsOptimizerModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold"
              >
                Close Optimizer
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

    </div>
  );
};

