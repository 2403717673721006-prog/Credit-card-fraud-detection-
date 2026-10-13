import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { MonitoringPage } from "./pages/MonitoringPage";
import { PredictPage } from "./pages/PredictPage";
import { DatasetPage } from "./pages/DatasetPage";
import { EdaPage } from "./pages/EdaPage";
import { EvaluationPage } from "./pages/EvaluationPage";
import { InsightsPage } from "./pages/InsightsPage";
import { AboutPage } from "./pages/AboutPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<MonitoringPage />} />
          <Route path="predict" element={<PredictPage />} />
          <Route path="dataset" element={<DatasetPage />} />
          <Route path="eda" element={<EdaPage />} />
          <Route path="evaluation" element={<EvaluationPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
