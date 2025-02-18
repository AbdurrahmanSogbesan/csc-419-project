import { BrowserRouter } from "react-router";
import AppRoutes from "./app/components/AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
        {/* todo: auth provider */}
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
