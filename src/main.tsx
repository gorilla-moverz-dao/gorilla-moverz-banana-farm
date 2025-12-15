import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import theme from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./services/WalletProvider";

const queryClient = new QueryClient({});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <WalletProvider>
        <QueryClientProvider client={queryClient}>
          <ColorModeScript initialColorMode={theme.config.initalColorMode} />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </WalletProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
