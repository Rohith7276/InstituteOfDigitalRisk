import { useState } from "react";
import TransactionForm from "./pages/TransactionForm";
import SummaryPage from "./pages/SummaryPage";
import RankingPage from "./pages/RankingPage";
import "./App.css";

const tabs = [
  { id: "transaction", label: "Submit Transaction" },
  { id: "summary", label: "User Summary" },
  { id: "ranking", label: "Leaderboard" },
];

function App() {
  const [activeTab, setActiveTab] = useState("transaction");

  return (
    <div className="app-shell">
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

      <main className="app-main">
        {activeTab === "transaction" && <TransactionForm />}
        {activeTab === "summary" && <SummaryPage />}
        {activeTab === "ranking" && <RankingPage />}
      </main>
    </div>
  );
}

export default App;
