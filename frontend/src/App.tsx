import { BrowserRouter } from "react-router";
import AppRoutes from "./components/AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  // todo: look back into this
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      retry: 0,
      staleTime: 60 * 1000,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
