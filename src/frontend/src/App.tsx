import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from './pages/LandingPage';
import ChatInterface from './pages/ChatInterface';
import Dashboard from './pages/Dashboard';
import BrowseHubs from './pages/BrowseHubs';
import LiveFixturesPage from './pages/LiveFixturesPage';
import TeamNewsPage from './pages/TeamNewsPage';
import FanCommunityPage from './pages/FanCommunityPage';
import FanPredictionsPage from './pages/FanPredictionsPage';
import FanLeaderboardPage from './pages/FanLeaderboardPage';
import PublishHelpPage from './pages/PublishHelpPage';

// Create root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
        <Toaster />
      </div>
    </ThemeProvider>
  ),
});

// Create routes
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatInterface,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/$teamName',
  component: Dashboard,
});

const browseHubsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowseHubs,
});

const liveFixturesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fixtures',
  component: LiveFixturesPage,
});

const teamNewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news',
  component: TeamNewsPage,
});

const fanCommunityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/community',
  component: FanCommunityPage,
});

const fanPredictionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/predictions',
  component: FanPredictionsPage,
});

const fanLeaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: FanLeaderboardPage,
});

const publishHelpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publish-help',
  component: PublishHelpPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  landingRoute,
  chatRoute,
  dashboardRoute,
  browseHubsRoute,
  liveFixturesRoute,
  teamNewsRoute,
  fanCommunityRoute,
  fanPredictionsRoute,
  fanLeaderboardRoute,
  publishHelpRoute,
]);
const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
