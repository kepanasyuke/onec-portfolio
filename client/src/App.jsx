import { useRoute } from "./hooks.js";
import { NAV } from "./nav.js";
import { TopBar } from "./components/TopBar.jsx";
import { Tabs } from "./components/Tabs.jsx";
import { LeftPanel } from "./components/LeftPanel.jsx";
import { StatusBar } from "./components/StatusBar.jsx";
import { Toasts } from "./components/Toasts.jsx";
import { OverviewSection } from "./sections/Overview.jsx";
import { UtSection } from "./sections/Ut.jsx";
import { BpSection } from "./sections/Bp.jsx";
import { ZupSection } from "./sections/Zup.jsx";
import { DoSection } from "./sections/Do.jsx";
import { KdSection } from "./sections/Kd.jsx";
import { SoapSection } from "./sections/Soap.jsx";
import { ExtSection } from "./sections/Ext.jsx";
import { DbSection } from "./sections/Db.jsx";

const SECTIONS = {
  overview: OverviewSection,
  ut: UtSection,
  bp: BpSection,
  zup: ZupSection,
  do: DoSection,
  kd: KdSection,
  soap: SoapSection,
  ext: ExtSection,
  db: DbSection,
};

const currentOf = (route) => NAV.find((item) => item.id === route) || NAV[0];

const SectionOf = ({ route }) => {
  const Section = SECTIONS[route] || OverviewSection;
  return <Section />;
};

export const App = () => {
  const route = useRoute();
  return (
    <div className="shell">
      <TopBar />
      <Tabs active={route} />
      <div className="shell__body">
        <LeftPanel active={route} />
        <main className="workspace">
          <SectionOf route={route} />
        </main>
      </div>
      <StatusBar current={currentOf(route)} count={NAV.length} />
      <Toasts />
    </div>
  );
};
