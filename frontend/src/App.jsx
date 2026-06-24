/**
 * Main application component
 * Provides tab-based navigation between transaction, summary, and ranking pages
 */

import { useState } from "react";
import TransactionForm from "./pages/TransactionForm";
import SummaryPage from "./pages/SummaryPage";
import RankingPage from "./pages/RankingPage";
import "./App.css";

// Tab configuration for navigation
const tabs = [
  { id: "transaction", label: "Submit Transaction" },
  { id: "summary", label: "User Summary" },
  { id: "ranking", label: "Leaderboard" },
];

function App() {
  // Track currently active tab
  const [activeTab, setActiveTab] = useState("transaction");

  return (
    <div className="app-shell">
      {/* Application header with title and tab navigation */}
      <header className="app-header">
        <h1>Institute of Digital Risk</h1>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main content area: render active tab component */}
      <main className="app-main">
        {activeTab === "transaction" && <TransactionForm />}
        {activeTab === "summary" && <SummaryPage />}
        {activeTab === "ranking" && <RankingPage />}
      </main>
    </div>
  );
}

export default App;
