import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import SellerNav from "@/components/SellerNav";

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
  let weeklyTrend = [
    { label: "Week 1", count: 2 },
    { label: "Week 2", count: 4 },
    { label: "Week 3", count: 1 },
    { label: "Week 4", count: 5 }
  ];
  let confidenceDist = [
    { label: "High", percentage: 80 },
    { label: "Medium", percentage: 15 },
    { label: "Low", percentage: 5 }
  ];
  let aiSuggestion = `34% of your returns are due to "Wrong Size". Consider adding a detailed sizing chart to your product descriptions to prevent future returns.`;

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

      weeklyTrend = [
        { label: "Week 1", count: weeksCount["Week 1"] },
        { label: "Week 2", count: weeksCount["Week 2"] },
        { label: "Week 3", count: weeksCount["Week 3"] },
        { label: "Week 4", count: weeksCount["Week 4"] }
      ];

      confidenceDist = [
        { label: "High", percentage: totalConf > 0 ? Math.round((confCounts.high / totalConf) * 100) : 0 },
        { label: "Medium", percentage: totalConf > 0 ? Math.round((confCounts.medium / totalConf) * 100) : 0 },
        { label: "Low", percentage: totalConf > 0 ? Math.round((confCounts.low / totalConf) * 100) : 0 }
      ];

      // Dynamic Insight
      if (topReasons.length > 0) {
        const topR = topReasons[0];
        let suggestion = "consider updating your product descriptions.";
        const reasonLower = topR.reason.toLowerCase();
        
        if (reasonLower.includes("size") || reasonLower.includes("small") || reasonLower.includes("large") || reasonLower.includes("fit")) {
          suggestion = "consider adding a detailed sizing chart to your product descriptions to prevent future returns.";
        } else if (reasonLower.includes("damage") || reasonLower.includes("broken") || reasonLower.includes("defective")) {
          suggestion = "consider upgrading your packaging to prevent damage in transit.";
        } else if (reasonLower.includes("color") || reasonLower.includes("match")) {
          suggestion = "consider adding more accurate photos in natural lighting.";
        }
        
        aiSuggestion = `${topR.percentage}% of returns are for "${topR.reason}" — ${suggestion}`;
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
              <CardTitle className="text-lg">Return Volume (Last 4 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-32 gap-2 mt-2">
                {weeklyTrend.map((w, i) => {
                  const heightPct = Math.round((w.count / maxWeekly) * 100) || 5;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 gap-2">
                      <div className="w-full bg-slate-100 rounded-t-md relative flex items-end justify-center group h-full">
                        <div 
                          className="w-full bg-slate-800 rounded-t-md transition-all duration-500 hover:bg-blue-600"
                          style={{ height: `${heightPct}%` }}
                        ></div>
                        <span className="absolute -top-6 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{w.count}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{w.label}</span>
                    </div>
                  );
                })}
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

      {/* AI Insight Card */}
      <Card className="bg-amber-50 border-amber-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/50 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-lg tracking-tight">AI Insight</h3>
              <p className="text-amber-800 mt-1 font-medium leading-relaxed">{aiSuggestion}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
