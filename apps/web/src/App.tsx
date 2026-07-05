import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import RequestsPage from './pages/RequestsPage';
import NewRequestPage from './pages/NewRequestPage';
import RequestDetailPage from './pages/RequestDetailPage';
import AdminRequestsPage from './pages/AdminRequestsPage';
import AdminRequestDetailPage from './pages/AdminRequestDetailPage';
import AdminAlbumsPage from './pages/AdminAlbumsPage';
import AdminNewAlbumPage from './pages/AdminNewAlbumPage';
import AdminAlbumManagePage from './pages/AdminAlbumManagePage';
import GalleryPage from './pages/GalleryPage';
import AlbumDetailPage from './pages/AlbumDetailPage';
import TeamPage from './pages/TeamPage';
import AdminTeamPage from './pages/AdminTeamPage';
import AdminTeamBatchDetailPage from './pages/AdminTeamBatchDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/pending" element={<PendingApprovalPage />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* User-facing */}
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/requests/new" element={<NewRequestPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/gallery/:id" element={<AlbumDetailPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin */}
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <AdminRoute>
                  <AdminRequestsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/requests/:id"
              element={
                <AdminRoute>
                  <AdminRequestDetailPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/albums"
              element={
                <AdminRoute>
                  <AdminAlbumsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/albums/new"
              element={
                <AdminRoute>
                  <AdminNewAlbumPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/albums/:id"
              element={
                <AdminRoute>
                  <AdminAlbumManagePage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/team"
              element={
                <AdminRoute>
                  <AdminTeamPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/team/:id"
              element={
                <AdminRoute>
                  <AdminTeamBatchDetailPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <AdminRoute>
                  <AdminLogsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <AdminAnalyticsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
