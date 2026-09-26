import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import StaffAuth from "./pages/StaffAuth";
import EmergencyDashboard from "./pages/EmergencyDashboard";
import FacilityAuth from "./pages/FacilityAuth";
import DischargeEntry from "./pages/DischargeEntry";
import PatientDashboard from "./pages/PatientDashboard";
import CreateAbha from "./pages/CreateAbha";
import ForgotAccess from "./pages/ForgotAccess";
import DischargeReview from "./pages/DischargeReview";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";
import WfIndex from "./pages/wireframes/WfIndex";
import WfLanding from "./pages/wireframes/WfLanding";
import WfCreateAbha from "./pages/wireframes/WfCreateAbha";
import WfStaffAuth from "./pages/wireframes/WfStaffAuth";
import WfEmergencyDashboard from "./pages/wireframes/WfEmergencyDashboard";
import WfFacilityAuth from "./pages/wireframes/WfFacilityAuth";
import WfDischarge from "./pages/wireframes/WfDischarge";
import WfPatientDashboard from "./pages/wireframes/WfPatientDashboard";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/about", Component: AboutPage },
  { path: "/help", Component: HelpPage },
  { path: "/emergency/auth", Component: StaffAuth },
  { path: "/emergency/dashboard", Component: EmergencyDashboard },
  { path: "/facility/auth", Component: FacilityAuth },
  { path: "/discharge", Component: DischargeEntry },
  { path: "/discharge/review", Component: DischargeReview },
  { path: "/patient", Component: PatientDashboard },
  { path: "/create-abha", Component: CreateAbha },
  { path: "/forgot-access", Component: ForgotAccess },

  // Lo-fi wireframe set (separate from the hi-fi app)
  { path: "/wireframes", Component: WfIndex },
  { path: "/wireframes/landing", Component: WfLanding },
  { path: "/wireframes/create-abha", Component: WfCreateAbha },
  { path: "/wireframes/staff-auth", Component: WfStaffAuth },
  { path: "/wireframes/emergency", Component: WfEmergencyDashboard },
  { path: "/wireframes/facility-auth", Component: WfFacilityAuth },
  { path: "/wireframes/discharge", Component: WfDischarge },
  { path: "/wireframes/patient", Component: WfPatientDashboard },

  { path: "*", Component: NotFound },
]);
