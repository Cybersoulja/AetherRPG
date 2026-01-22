import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * The entry point of the application.
 * Renders the root component into the DOM.
 */
createRoot(document.getElementById("root")!).render(<App />);
