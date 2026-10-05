/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { MapView } from './components/MapView';
import { TelemetryView } from './components/TelemetryView';
import { AnalyticsView } from './components/AnalyticsView';
import { AlertsView } from './components/AlertsView';
import { OperationsView } from './components/OperationsView';
import { EocPlanModal } from './components/modals/EocPlanModal';
import { RiskDetailsModal } from './components/modals/RiskDetailsModal';
import { ForecastModal } from './components/modals/ForecastModal';
import { DecisionSupportModal } from './components/modals/DecisionSupportModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { SECTORS_DATA, CHRONOLOGICAL_INCIDENTS } from './data/mockData';
import { IncidentEvent } from './types';
import { RiskPrediction } from './ml/risk';
import { requestRiskPrediction, sectorToPredictionRequest, toRiskPrediction } from './api/riskPrediction';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [currentSectorId, setCurrentSectorId] = useState<string>('valparai');
  const [userRole, setUserRole] = useState<'EOC AUTH' | 'COMMUNITY' | 'ADMIN'>('EOC AUTH');
  
  // Modals state
  const [isEocPlanOpen, setIsEocPlanOpen] = useState<boolean>(false);
  const [isRiskDetailsOpen, setIsRiskDetailsOpen] = useState<boolean>(false);
  const [isForecastOpen, setIsForecastOpen] = useState<boolean>(false);
  const [isDecisionSupportOpen, setIsDecisionSupportOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Incidents state
  const [incidents, setIncidents] = useState<IncidentEvent[]>(CHRONOLOGICAL_INCIDENTS);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [activePrediction, setActivePrediction] = useState<RiskPrediction | null>(null);
  const [isPredictionLoading, setIsPredictionLoading] = useState<boolean>(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const activeSector = SECTORS_DATA[currentSectorId] || SECTORS_DATA.valparai;

  useEffect(() => {
    const controller = new AbortController();
    const request = sectorToPredictionRequest(activeSector);

    setActivePrediction(null);
    setPredictionError(null);
    setIsPredictionLoading(true);

    requestRiskPrediction(request, controller.signal)
      .then((response) => setActivePrediction(toRiskPrediction(response, request)))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setPredictionError(error instanceof Error ? error.message : 'Risk prediction request failed.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsPredictionLoading(false);
      });

    return () => controller.abort();
  }, [currentSectorId]);

  const handleDispatchAlert = () => {
    // Add new incident to chronological feed
    const newIncident: IncidentEvent = {
      id: `inc-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      title: 'Emergency Cell Broadcast Executed',
      description: `Tactical broadcast issued for ${activeSector.name} perimeter (300m convex).`,
      type: 'warning',
      threatLevel: 'CRITICAL'
    };
    setIncidents(prev => [newIncident, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleClearNotifications = () => {
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] flex flex-col selection:bg-[#4edea3]/30 selection:text-[#4edea3]">
      
      {/* Top Fixed Header */}
      <Header
        currentSectorId={currentSectorId}
        onSelectSector={setCurrentSectorId}
        userRole={userRole}
        onSelectRole={setUserRole}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          setUnreadCount(0);
        }}
        unreadCount={unreadCount}
      />

      {/* Main Content Area (padded below header) */}
      <main className="flex-1 w-full pt-28 pb-16 bg-[#0f131c]">
        {currentTab === 'dashboard' && (
          <DashboardView
            sector={activeSector}
            prediction={activePrediction}
            predictionLoading={isPredictionLoading}
            predictionError={predictionError}
            onSelectSector={setCurrentSectorId}
            incidents={incidents}
            onOpenEocPlan={() => setIsEocPlanOpen(true)}
            onOpenRiskDetails={() => setIsRiskDetailsOpen(true)}
            onOpenForecast={() => setIsForecastOpen(true)}
            onOpenDecisionSupport={() => setIsDecisionSupportOpen(true)}
          />
        )}

        {currentTab === 'risk-map' && (
          <MapView
            sector={activeSector}
            onOpenRiskDetails={() => setIsRiskDetailsOpen(true)}
            onOpenEocPlan={() => setIsEocPlanOpen(true)}
          />
        )}

        {currentTab === 'live-telemetry' && (
          <TelemetryView />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView />
        )}

        {currentTab === 'alerts' && (
          <AlertsView
            sector={activeSector}
            prediction={activePrediction}
            predictionLoading={isPredictionLoading}
            predictionError={predictionError}
            onOpenEocPlan={() => setIsEocPlanOpen(true)}
          />
        )}

        {currentTab === 'operations-hub' && (
          <OperationsView
            sector={activeSector}
            prediction={activePrediction}
            onOpenEocPlan={() => setIsEocPlanOpen(true)}
          />
        )}
      </main>

      {/* Bottom Fixed Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        alertBadgeCount={unreadCount}
      />

      {/* Modals & Slide-outs */}
      {isEocPlanOpen && (
        <EocPlanModal
          sector={activeSector}
          prediction={activePrediction}
          onClose={() => setIsEocPlanOpen(false)}
          onDispatchAlert={handleDispatchAlert}
        />
      )}

      {isRiskDetailsOpen && (
        <RiskDetailsModal
          sector={activeSector}
          prediction={activePrediction}
          onClose={() => setIsRiskDetailsOpen(false)}
        />
      )}

      {isForecastOpen && (
        <ForecastModal
          sector={activeSector}
          prediction={activePrediction}
          onClose={() => setIsForecastOpen(false)}
        />
      )}

      {isDecisionSupportOpen && (
        <DecisionSupportModal
          sector={activeSector}
          prediction={activePrediction}
          onClose={() => setIsDecisionSupportOpen(false)}
          onOpenEocPlan={() => setIsEocPlanOpen(true)}
        />
      )}

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        incidents={incidents}
        onClear={handleClearNotifications}
      />

    </div>
  );
}
