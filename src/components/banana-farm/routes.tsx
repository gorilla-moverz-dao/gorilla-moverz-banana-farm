import FarmCreateCollection from "./FarmCreateCollection";
import FarmPartners from "./FarmPartners";
import FarmLeaderboard from "./FarmLeaderboard";
import FarmerOverview from "./FarmOverview";
import { FARM_COLLECTION_ID } from "../../constants";
import { Navigate } from "react-router-dom";
import FarmGameplay from "./FarmGameplay";

export const farmRoutes = [
  { index: true, element: <Navigate to="farm" /> },
  { path: "farm", element: <FarmerOverview collectionId={FARM_COLLECTION_ID} enableFarming={true} /> },
  { path: "partner", element: <FarmPartners /> },
  { path: "leaderboard", element: <FarmLeaderboard /> },
  { path: "gameplay", element: <FarmGameplay /> },
  { path: "create", element: <FarmCreateCollection /> },
];
