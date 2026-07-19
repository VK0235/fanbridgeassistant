import type { DashboardResponse, UserMode } from "../../types";

interface PersonaPanelProps {
  userMode: UserMode;
  dashboard: DashboardResponse;
}

/**
 * Conditional panel showing role-specific information for volunteer, staff, and organizer personas.
 * Not rendered for "fan" mode.
 */
export default function PersonaPanel({ userMode, dashboard }: PersonaPanelProps) {
  if (userMode === "fan") return null;

  const panelTitle =
    userMode === "volunteer"
      ? "Volunteer Shift Deployments"
      : userMode === "staff"
      ? "Direct Operations Protocols"
      : "Match Day Event Analytics";

  return (
    <div className="bg-white/40 border border-dashed border-slate-350 rounded-2xl p-5 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        <h3 className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
          {panelTitle}
        </h3>
      </div>

      {userMode === "volunteer" && <VolunteerView dashboard={dashboard} />}
      {userMode === "staff" && <StaffView dashboard={dashboard} />}
      {userMode === "organizer" && <OrganizerView dashboard={dashboard} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-views per persona
// ---------------------------------------------------------------------------

function VolunteerView({ dashboard }: { dashboard: DashboardResponse }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {dashboard.volunteer_posts.map((post, i) => (
        <div key={i} className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 text-center">
          <p className="text-[9px] text-slate-400 font-black uppercase">{post.id}</p>
          <p className="text-xs font-black text-slate-800 mt-1 truncate" title={post.role}>
            {post.role}
          </p>
          <p className="text-[9px] text-slate-505 font-semibold mt-0.5 truncate">{post.zone}</p>
          <div className="mt-2 inline-block bg-slate-100 text-[9px] font-black px-1.5 py-0.5 rounded-full text-indigo-700">
            {post.headcount} slots
          </div>
        </div>
      ))}
    </div>
  );
}

function StaffView({ dashboard }: { dashboard: DashboardResponse }) {
  return (
    <div className="space-y-2 text-xs font-chat">
      <p className="text-slate-655 font-bold">
        Emergency Security:{" "}
        {dashboard.analytics.top_questions
          ? "Dial extension 911 from any venue terminal. Command stationed at Gate A."
          : ""}
      </p>
      <p className="text-slate-655 font-bold">
        Lost Child Reunification: Guide families to Gate C Guest Services. Immediate PA overrides.
      </p>
      <p className="text-slate-655 font-bold">
        Lost & Found: Stationed at Guest Services desk (Gate C). Open until 1h post whistle.
      </p>
    </div>
  );
}

function OrganizerView({ dashboard }: { dashboard: DashboardResponse }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white border border-slate-100 shadow-sm p-3 rounded-xl">
        <span className="text-[9px] text-slate-404 font-bold uppercase block">Queries Handled</span>
        <span className="text-lg font-black text-blue-600">{dashboard.analytics.queries_handled}</span>
      </div>
      <div className="bg-white border border-slate-100 shadow-sm p-3 rounded-xl">
        <span className="text-[9px] text-slate-404 font-bold uppercase block">Core user topic</span>
        <span className="text-[10px] font-bold text-slate-700 truncate block mt-1 font-chat">
          {dashboard.analytics.top_questions[0]}
        </span>
      </div>
      <div className="bg-white border border-slate-100 shadow-sm p-3 rounded-xl col-span-2">
        <span className="text-[9px] text-slate-404 font-bold uppercase block">Matches Scheduled</span>
        <div className="flex gap-2 items-center mt-1">
          {dashboard.match_schedule.map((match, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-700"
            >
              {match.home} vs {match.away} ({match.time})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
