import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { Profile } from "./components/Profile";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "register", Component: Register },
      { path: "dashboard", Component: Dashboard },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);