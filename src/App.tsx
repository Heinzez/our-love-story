import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SiteProvider, useSite } from "@/context/SiteContext";
import AccessGate from "@/components/AccessGate";
import WelcomeNote from "@/components/WelcomeNote";
import Navigation from "@/components/Navigation";
import LandingPage from "@/pages/LandingPage";
import OurStoryPage from "@/pages/OurStoryPage";
import TheJourneyPage from "@/pages/TheJourneyPage";
import LaughsPage from "@/pages/LaughsPage";
import LettersPage from "@/pages/LettersPage";
import GoalsPage from "@/pages/GoalsPage";
import MyNotesPage from "@/pages/MyNotesPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedApp = (): JSX.Element => {
  const { isAuthenticated } = useSite();

  if (!isAuthenticated) {
    return <AccessGate />;
  }

  return (
    <BrowserRouter>
      <WelcomeNote />
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/the-journey" element={<TheJourneyPage />} />
        <Route path="/laughs" element={<LaughsPage />} />
        <Route path="/letters" element={<LettersPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/my-notes" element={<MyNotesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SiteProvider>
        <AuthenticatedApp />
      </SiteProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
