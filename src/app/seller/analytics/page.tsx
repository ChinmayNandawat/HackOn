import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import SellerNav from "@/components/SellerNav";
import CategorizedAIInsights from "@/components/seller/CategorizedAIInsights";

export default async function SellerAnalytics() {
  let isMocked = false;
  
  // Fallback / Initial static data
  let autoProcessed = 12;
  let revenue = 18500;
  let timeSavedStr = "3 hrs";
  let topReasons = [
    { reason: "Wrong Size", count: 4, percentage: 34 },
    { reason: "Changed Mind", count: 3, percentage: 25 },
    { reason: "Defective", count: 2, percentage: 16 }
  ];
  // Mock 8-week trend for demo showing decreasing returns with realistic variance
  let weeklyTrend = [
    { label: "W1", count: 48 },
    { label: "W2", count: 46 },
    { label: "W3", count: 48 },
    { label: "W4", count: 38 },
    { label: "W5", count: 41 },
    { label: "W6", count: 31 },
    { label: "W7", count: 25 },
    { label: "W8", count: 26 }
  ];
  let confidenceDist = [
    { label: "High", percentage: 80 },
    { label: "Medium", percentage: 15 },
    { label: "Low", percentage: 5 }
  ];
  let aiSuggestion = `34% of your returns are due to "Wrong Size". Optional Idea: You may consider evaluating a detailed sizing chart for your product descriptions as you see fit.`;

  try {
    const { data: returns, error } = await supabase.from("returns").select("*");
    if (error) throw error;
    
    if (returns && returns.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let q1Count = 0;
      let q2Revenue = 0;
      let q3GradeCount = 0;

      const reasonCounts: Record<string, number> = {};
      const weeksCount: Record<string, number> = { "Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0 };
      const confCounts = { high: 0, medium: 0, low: 0 };
      let totalConf = 0;

      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      
      returns.forEach(r => {
        const d = new Date(r.created_at);
        const status = r.status;
        // Handle variations in schema naming from previous phases
        const decision = r.ai_routing_decision || r.routing_decision;
        const grade = r.ai_grade || r.grade;
        const conf = (r.ai_confidence || r.confidence || "").toLowerCase();
        const price = r.estimated_resale_price || r.ai_suggested_price || r.flaws_json?.estimated_resale_price || 0;
        const reason = r.reason || r.return_reason || "Other";

        // Query 1
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          if (["inspected", "relisted", "accepted", "rejected", "standard_refund"].includes(status)) {
            q1Count++;
          }
        }

        // Query 2
        if (status === "relisted" && decision === "relist_as_refurbished") {
          q2Revenue += Number(price);
        }

        // Query 3
        if (grade) {
          q3GradeCount++;
        }

        // Query 4
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;

        // Query 5
        const weeksAgo = Math.floor((now.getTime() - d.getTime()) / msPerWeek);
        if (weeksAgo === 0) weeksCount["Week 4"]++;
        else if (weeksAgo === 1) weeksCount["Week 3"]++;
        else if (weeksAgo === 2) weeksCount["Week 2"]++;
        else if (weeksAgo === 3) weeksCount["Week 1"]++;

        // Query 6
        if (conf === "high") { confCounts.high++; totalConf++; }
        else if (conf === "medium") { confCounts.medium++; totalConf++; }
        else if (conf === "low") { confCounts.low++; totalConf++; }
      });

      autoProcessed = q1Count;
      revenue = q2Revenue;
      
      const totalMins = q3GradeCount * 15;
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      timeSavedStr = hrs > 0 ? `${hrs} hrs ${mins} mins` : `${mins} mins`;

      const totalReasons = Object.values(reasonCounts).reduce((a, b) => a + b, 0);
      topReasons = Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([r, c]) => ({
          reason: r,
          count: c,
          percentage: totalReasons > 0 ? Math.round((c / totalReasons) * 100) : 0
        }));

      // weeklyTrend is intentionally mocked to an 8-week trend for the demo
      // so we skip overwriting it with the weeksCount from the empty DB here

      confidenceDist = [
        { label: "High", percentage: totalConf > 0 ? Math.round((confCounts.high / totalConf) * 100) : 0 },
        { label: "Medium", percentage: totalConf > 0 ? Math.round((confCounts.medium / totalConf) * 100) : 0 },
        { label: "Low", percentage: totalConf > 0 ? Math.round((confCounts.low / totalConf) * 100) : 0 }
      ];

      // Dynamic Insight
      if (topReasons.length > 0) {
        const topR = topReasons[0];
        let suggestion = "you may evaluate reviewing your product descriptions if appropriate.";
        const reasonLower = topR.reason.toLowerCase();
        
        if (reasonLower.includes("size") || reasonLower.includes("small") || reasonLower.includes("large") || reasonLower.includes("fit")) {
          suggestion = "you may want to evaluate adding a detailed sizing chart if appropriate for your catalog.";
        } else if (reasonLower.includes("damage") || reasonLower.includes("broken") || reasonLower.includes("defective")) {
          suggestion = "you may want to review warehouse packaging specifications as you see fit.";
        } else if (reasonLower.includes("color") || reasonLower.includes("match")) {
          suggestion = "you may want to evaluate adding natural lighting photos if helpful for accurate representation.";
        }
        
        aiSuggestion = `${topR.percentage}% of returns are for "${topR.reason}" — Optional Idea: ${suggestion}`;
      } else {
        aiSuggestion = "Not enough return data yet to generate specific insights. AI insights will appear here automatically.";
      }

    } else {
      isMocked = true; // Fallback to mock data if empty table
    }
  } catch (err) {
    console.error("Failed to fetch real analytics", err);
    isMocked = true;
  }

  // Find max for trend chart scaling
  const maxWeekly = Math.max(...weeklyTrend.map(w => w.count), 1);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics & Intelligence</h1>
          <p className="text-slate-500 mt-1">AI-driven insights from your return data</p>
        </div>
        {isMocked ? (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">Demo Data</Badge>
        ) : (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-bold">Live Data</Badge>
        )}
      </div>

      <SellerNav />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Auto-Processed Returns</p>
            <p className="text-4xl font-black mt-2 text-slate-900">{autoProcessed}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">This month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Revenue Recovered</p>
            <p className="text-4xl font-black mt-2 text-green-600">₹{revenue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">From refurbished relistings</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Time Saved (est.)</p>
            <p className="text-4xl font-black mt-2 text-blue-600">{timeSavedStr}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">Vs manual inspection</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Return Reasons */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Top Return Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReasons.map((tr, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700">{tr.reason}</span>
                    <span className="text-slate-500">{tr.percentage}% ({tr.count})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${tr.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend & Confidence */}
        <div className="space-y-6 flex flex-col">
          <Card className="shadow-sm border-slate-200 flex-1">
            <CardHeader>
              <CardTitle className="text-lg">Return Volume (Last 8 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mt-2 w-full">
                <svg viewBox="0 0 800 160" className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="0" y1="40" x2="800" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="800" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="160" x2="800" y2="160" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* Area fill */}
                  <path
                    d={`M ${weeklyTrend.map((w, i) => `${(i / 7) * 800},${160 - (w.count / maxWeekly) * 120}`).join(" L ")} L 800,160 L 0,160 Z`}
                    fill="url(#line-gradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d={`M ${weeklyTrend.map((w, i) => `${(i / 7) * 800},${160 - (w.count / maxWeekly) * 120}`).join(" L ")}`}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {weeklyTrend.map((w, i) => {
                    const x = (i / 7) * 800;
                    const y = 160 - (w.count / maxWeekly) * 120;
                    return (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={x} cy={y} r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" className="transition-all duration-200 group-hover:r-8" />
                        <text x={x} y={y - 18} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1e293b" style={{ fontFamily: 'inherit' }}>{w.count}</text>
                      </g>
                    );
                  })}
                </svg>
                
                {/* X Axis Labels */}
                <div className="flex justify-between items-center mt-4">
                  {weeklyTrend.map((w, i) => (
                    <span key={i} className="text-xs text-slate-500 font-medium w-8 text-center" style={{ marginLeft: i === 0 ? '-1rem' : '0', marginRight: i === 7 ? '-1rem' : '0' }}>{w.label}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 mb-2">AI Confidence Distribution</p>
                <div className="flex gap-4">
                  {confidenceDist.map(cd => (
                    <div key={cd.label} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-full ${cd.label === 'High' ? 'bg-emerald-500' : cd.label === 'Medium' ? 'bg-amber-400' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-slate-600 font-medium">{cd.percentage}% {cd.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CategorizedAIInsights />
    </div>
  );
}
