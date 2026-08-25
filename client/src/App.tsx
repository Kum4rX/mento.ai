import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TavusProvider } from "./contexts/TavusContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import Session from "./pages/Session";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import Assessment from "./pages/Assessment";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const App = () => (
  <ErrorBoundary fallback={
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Application Error</h2>
        <p className="text-muted-foreground">Something went wrong. Please refresh the page.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-mento-primary text-white rounded-lg hover:bg-mento-primary/90"
        >
          Refresh Page
        </button>
      </div>
    </div>
  }>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <TavusProvider>
                <div className="min-h-screen">
                  <Navigation />
                  {/* Spacer to prevent content from being hidden behind fixed navbar */}
                  <div className="h-24" />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/session" element={
                      <ProtectedRoute>
                        <ErrorBoundary fallback={
                          <div className="min-h-screen flex items-center justify-center p-4">
                            <div className="text-center space-y-4">
                              <h2 className="text-xl font-semibold">Session Error</h2>
                              <p className="text-muted-foreground">There was an issue with the session. Please try again.</p>
                              <button 
                                onClick={() => window.location.href = '/'}
                                className="px-4 py-2 bg-mento-primary text-white rounded-lg hover:bg-mento-primary/90"
                              >
                                Return Home
                              </button>
                            </div>
                          </div>
                        }>
                          <Session />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                    <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </TavusProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
