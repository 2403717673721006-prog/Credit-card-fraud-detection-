import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldAlert,
  CheckCircle,
  Database,
  ArrowRight,
} from "lucide-react";
import { api } from "../services/api";
import { TransactionItem, PaginatedTransactions } from "../types";
import { TransactionDetailModal } from "../components/TransactionDetailModal";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export const MonitoringPage: React.FC = () => {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [classFilter, setClassFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Time");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        page,
        per_page: perPage,
        class_filter: classFilter,
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, perPage, classFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleClassFilterChange = (val: string) => {
    setPage(1);
    if (val === "all") setClassFilter(undefined);
    else if (val === "0") setClassFilter(0);
    else if (val === "1") setClassFilter(1);
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Historical Transaction Monitoring
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Query and inspect 284,807 transactions from the Kaggle Credit Card Fraud dataset with ground truth labels.
          </p>
        </div>

        {/* Dataset Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">
              Dataset Records
            </span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {data ? data.total.toLocaleString() : "284,807"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID (e.g. TX-000542) or Amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#080d1a] py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20"
          >
            Search
          </button>
        </form>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <span>Class:</span>
            <select
              value={classFilter === undefined ? "all" : classFilter.toString()}
              onChange={(e) => handleClassFilterChange(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Transactions (284k)</option>
              <option value="0">Legitimate Only (Class 0)</option>
              <option value="1">Fraudulent Only (Class 1 - 492 cases)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="h-3.5 w-3.5 text-cyan-400" />
            <span>Sort:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="Time-desc">Time (Newest First)</option>
              <option value="Time-asc">Time (Oldest First)</option>
              <option value="Amount-desc">Amount (Highest First)</option>
              <option value="Amount-asc">Amount (Lowest First)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Per Page:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-800 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-200 font-mono"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={8} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Time Elapsed</th>
                  <th className="py-3 px-4">Amount ($)</th>
                  <th className="py-3 px-4">Ground Truth Class</th>
                  <th className="py-3 px-4">Key PCA Indicators (V14, V17, V10)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data?.items && data.items.length > 0 ? (
                  data.items.map((tx) => (
                    <tr
                      key={tx.transaction_id}
                      className={`transition hover:bg-slate-800/40 ${
                        tx.actual_class === 1 ? "bg-red-950/15" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {tx.transaction_id}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {tx.time.toFixed(0)}s ({(tx.time / 3600).toFixed(1)}h)
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {tx.actual_class === 1 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
                            <ShieldAlert className="h-3 w-3" />
                            Fraudulent (Class 1)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            Legitimate (Class 0)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>V14: {tx.key_features.V14?.toFixed(2)}</span>
                          <span>|</span>
                          <span>V17: {tx.key_features.V17?.toFixed(2)}</span>
                          <span>|</span>
                          <span>V10: {tx.key_features.V10?.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-500 hover:text-cyan-400 transition"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No transactions matched the specified search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && (
          <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4 bg-slate-900/60 text-xs text-slate-400">
            <div>
              Showing page <span className="font-bold text-white">{data.page}</span> of{" "}
              <span className="font-bold text-white">{data.total_pages.toLocaleString()}</span>{" "}
              ({data.total.toLocaleString()} total records)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};
