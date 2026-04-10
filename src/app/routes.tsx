import { createBrowserRouter } from 'react-router';
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { HowItWorks } from './pages/HowItWorks';
import { Dashboard } from './pages/Dashboard';
import { Contact } from './pages/Contact';
import { Demo } from './pages/Demo';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardIntegrations } from './components/dashboard/DashboardIntegrations';
import { DashboardSettings } from './components/dashboard/DashboardSettings';
import { InventoryManager } from './components/dashboard/InventoryManager';
import { AIForecastEngine } from './components/dashboard/AIForecastEngine';
import { AlertsPage } from './components/dashboard/AlertsPage';
import { DataProvider } from './contexts/DataContext';
import { SmartInventory } from './pages/SmartInventory';
import { SmartDashboard } from './pages/SmartDashboard';
import { AiReportPage } from './components/dashboard/AiReportPage';
import { AnalyticsPage } from './components/dashboard/AnalyticsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'features', Component: Features },
      { path: 'pricing', Component: Pricing },
      { path: 'how-it-works', Component: HowItWorks },
      { path: 'contact', Component: Contact },
      { path: 'demo', Component: Demo },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DataProvider>
          <DashboardLayout />
        </DataProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: 'inventory', element: <InventoryManager /> },
      { path: 'forecast', element: <AIForecastEngine /> },
      { path: 'ai-assistant', element: <div className="p-6 space-y-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">AI Assistant</h1><Dashboard /></div> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'integrations', Component: DashboardIntegrations },
      { path: 'settings', Component: DashboardSettings },
      { path: 'smart-inventory', Component: SmartInventory },
      { path: 'smart-dashboard', Component: SmartDashboard },
      { path: 'ai-report', Component: AiReportPage },
      { path: 'analytics', Component: AnalyticsPage },
    ],
  },
]);
