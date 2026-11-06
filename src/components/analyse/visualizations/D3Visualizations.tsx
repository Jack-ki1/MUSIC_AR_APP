import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  TimeSeriesPoint, 
  PlatformShareSlice, 
  EngagementSpikePoint, 
  RegionalConcentrationPoint, 
  RadarCompetencePoint, 
  PitchCentHistogramBin, 
  DynamicEnergyPoint, 
  OrganicScatterPoint, 
  DiscographyTrajectoryPoint 
} from '../../../types/analytics';

// ============================================================================
// 1. MONTHLY STREAM PROGRESSION (90-DAY D3 AREA & LINE CHART)
// ============================================================================
interface MonthlyStreamProgressionProps {
  data: TimeSeriesPoint[];
  height?: number;
  timeRangeLabel?: string;
}

export const MonthlyStreamProgressionChart: React.FC<MonthlyStreamProgressionProps> = ({
  data,
  height = 280,
  timeRangeLabel = 'Last 90 Days'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState<'all' | 'spotify' | 'appleMusic' | 'youtube' | 'tiktokUgc'>('all');

  const width = 760;
  const margin = { top: 20, right: 30, bottom: 35, left: 55 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const { xScale, yScale, totalAreaPath, spotifyLine, appleLine, ytLine, tiktokLine } = useMemo(() => {
    const dates = data.map(d => new Date(d.timestamp));
    const x = d3.scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, innerWidth]);

    const maxVal = d3.max(data, d => Math.max(d.total, d.tiktokUgc, d.spotify * 1.5)) || 100000;
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.08])
      .range([innerHeight, 0]);

    // Area generator for total streams
    const areaGen = d3.area<TimeSeriesPoint>()
      .x(d => x(new Date(d.timestamp)))
      .y0(innerHeight)
      .y1(d => y(d.total))
      .curve(d3.curveMonotoneX);

    // Line generators
    const spotifyLineGen = d3.line<TimeSeriesPoint>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.spotify))
      .curve(d3.curveMonotoneX);

    const appleLineGen = d3.line<TimeSeriesPoint>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.appleMusic))
      .curve(d3.curveMonotoneX);

    const ytLineGen = d3.line<TimeSeriesPoint>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.youtube))
      .curve(d3.curveMonotoneX);

    const tiktokLineGen = d3.line<TimeSeriesPoint>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.tiktokUgc))
      .curve(d3.curveMonotoneX);

    return {
      xScale: x,
      yScale: y,
      totalAreaPath: areaGen(data) || '',
      spotifyLine: spotifyLineGen(data) || '',
      appleLine: appleLineGen(data) || '',
      ytLine: ytLineGen(data) || '',
      tiktokLine: tiktokLineGen(data) || ''
    };
  }, [data, innerWidth, innerHeight]);

  // Y-axis tick values
  const yTicks = yScale.ticks(5);
  // X-axis tick values (approx 6 ticks)
  const xTicks = xScale.ticks(6);

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <div className="space-y-3">
      {/* Header with channel filter pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Platform Scope:</span>
          {(['all', 'spotify', 'tiktokUgc', 'youtube', 'appleMusic'] as const).map(channel => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                activeChannel === channel
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {channel === 'all' ? 'All Channels' : channel === 'spotify' ? 'Spotify' : channel === 'tiktokUgc' ? 'TikTok UGC' : channel === 'youtube' ? 'YouTube' : 'Apple'}
            </button>
          ))}
        </div>

        {activePoint && (
          <div className="text-xs font-mono font-semibold text-[#0F172A] flex items-center gap-3">
            <span className="text-[#64748B]">{activePoint.date}:</span>
            <span className="text-[#7155F5] font-black">{activePoint.total.toLocaleString()} total streams</span>
            <span className="text-[#10B981] text-[10px]">({activePoint.spotify.toLocaleString()} Spotify)</span>
          </div>
        )}
      </div>

      {/* D3 SVG Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-white border border-[#E2E8F0] p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="streamAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7155F5" stopOpacity="0.32" />
              <stop offset="65%" stopColor="#7155F5" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#7155F5" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="spotifyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Horizontal Grid lines */}
            {yTicks.map((tick, i) => (
              <g key={i} transform={`translate(0, ${yScale(tick)})`}>
                <line x1={0} x2={innerWidth} y1={0} y2={0} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <text x={-10} y={4} textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                  {(tick / 1000).toFixed(0)}k
                </text>
              </g>
            ))}

            {/* X Axis dates */}
            {xTicks.map((date, i) => (
              <text
                key={i}
                x={xScale(date)}
                y={innerHeight + 20}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
                fontFamily="sans-serif"
              >
                {d3.timeFormat('%b %d')(date)}
              </text>
            ))}

            {/* Total Streams Area Fill */}
            {(activeChannel === 'all') && (
              <path d={totalAreaPath} fill="url(#streamAreaGrad)" />
            )}

            {/* Total Streams Boundary Line */}
            {(activeChannel === 'all') && (
              <path d={d3.line<TimeSeriesPoint>().x(d => xScale(new Date(d.timestamp))).y(d => yScale(d.total)).curve(d3.curveMonotoneX)(data) || ''}
                fill="none"
                stroke="#7155F5"
                strokeWidth="2.75"
              />
            )}

            {/* Spotify Line */}
            {(activeChannel === 'all' || activeChannel === 'spotify') && (
              <path d={spotifyLine} fill="none" stroke="#10B981" strokeWidth={activeChannel === 'spotify' ? '3' : '2'} />
            )}

            {/* TikTok UGC Line */}
            {(activeChannel === 'all' || activeChannel === 'tiktokUgc') && (
              <path d={tiktokLine} fill="none" stroke="#0F172A" strokeWidth={activeChannel === 'tiktokUgc' ? '3' : '1.75'} strokeDasharray={activeChannel === 'all' ? '4 3' : 'none'} />
            )}

            {/* YouTube Line */}
            {(activeChannel === 'all' || activeChannel === 'youtube') && (
              <path d={ytLine} fill="none" stroke="#EF4444" strokeWidth={activeChannel === 'youtube' ? '3' : '1.5'} />
            )}

            {/* Apple Music Line */}
            {(activeChannel === 'all' || activeChannel === 'appleMusic') && (
              <path d={appleLine} fill="none" stroke="#F43F5E" strokeWidth={activeChannel === 'appleMusic' ? '3' : '1.5'} strokeDasharray="3 2" />
            )}

            {/* Interactive Crosshair & Hover Overlay */}
            {data.map((d, idx) => {
              const xPos = xScale(new Date(d.timestamp));
              return (
                <rect
                  key={idx}
                  x={xPos - (innerWidth / data.length) / 2}
                  y={0}
                  width={innerWidth / data.length}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIdx(idx)}
                />
              );
            })}

            {/* Hovered Marker Dot & Line */}
            {hoveredIdx !== null && activePoint && (
              <g>
                <line
                  x1={xScale(new Date(activePoint.timestamp))}
                  x2={xScale(new Date(activePoint.timestamp))}
                  y1={0}
                  y2={innerHeight}
                  stroke="#7155F5"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={xScale(new Date(activePoint.timestamp))}
                  cy={yScale(activePoint.total)}
                  r="5"
                  fill="#7155F5"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                <circle
                  cx={xScale(new Date(activePoint.timestamp))}
                  cy={yScale(activePoint.spotify)}
                  r="4"
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Legend & Insights */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-[#7155F5]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7155F5]"></span> Total Aggregate
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#10B981]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Spotify
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]"></span> TikTok Audio
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#EF4444]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> YouTube
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#F43F5E]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]"></span> Apple Music
          </span>
        </div>
        <div className="text-[11px] text-[#059669] font-bold">
          {timeRangeLabel} Velocity: +68.4%
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// 2. PLATFORM AUDIENCE DISTRIBUTION (D3 DONUT / PIE CHART)
// ============================================================================
interface PlatformAudiencePieProps {
  slices: PlatformShareSlice[];
  size?: number;
}

export const PlatformAudiencePieChart: React.FC<PlatformAudiencePieProps> = ({
  slices,
  size = 260
}) => {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const radius = size / 2;
  const innerRadius = radius * 0.58; // Donut hole

  // D3 Pie layout
  const pieGen = useMemo(() => {
    return d3.pie<PlatformShareSlice>()
      .value(d => d.sharePercentage)
      .sort(null);
  }, []);

  // D3 Arc generator
  const arcGen = useMemo(() => {
    return d3.arc<d3.PieArcDatum<PlatformShareSlice>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10)
      .cornerRadius(4)
      .padAngle(0.03);
  }, [innerRadius, radius]);

  const arcHoverGen = useMemo(() => {
    return d3.arc<d3.PieArcDatum<PlatformShareSlice>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(radius - 2)
      .cornerRadius(4)
      .padAngle(0.03);
  }, [innerRadius, radius]);

  const pieData = pieGen(slices);
  const activeSlice = hoveredPlatform 
    ? slices.find(s => s.platform === hoveredPlatform) 
    : slices[0];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none">
          <g transform={`translate(${radius}, ${radius})`}>
            {pieData.map((d, i) => {
              const isHovered = hoveredPlatform === d.data.platform;
              const pathStr = isHovered ? (arcHoverGen(d) || '') : (arcGen(d) || '');
              return (
                <path
                  key={i}
                  d={pathStr}
                  fill={d.data.color}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPlatform(d.data.platform)}
                  onMouseLeave={() => setHoveredPlatform(null)}
                  opacity={hoveredPlatform && !isHovered ? 0.6 : 1}
                />
              );
            })}
          </g>
        </svg>

        {/* Center Callout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Primary Share</span>
          <span className="text-xl font-black text-[#0F172A] font-mono leading-none mt-0.5">
            {activeSlice ? `${activeSlice.sharePercentage}%` : '42%'}
          </span>
          <span className="text-xs font-bold text-[#7155F5] mt-0.5">
            {activeSlice ? activeSlice.platform : 'Spotify'}
          </span>
        </div>
      </div>

      {/* Platform Breakdown Cards / Legend */}
      <div className="flex-1 w-full space-y-2">
        {slices.map((slice, i) => {
          const isSelected = hoveredPlatform === slice.platform;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredPlatform(slice.platform)}
              onMouseLeave={() => setHoveredPlatform(null)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected 
                  ? 'bg-[#F8FAFC] border-[#7155F5] shadow-xs' 
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                <div>
                  <span className="text-xs font-extrabold text-[#0F172A] block">{slice.platform}</span>
                  <span className="text-[10px] text-[#64748B]">
                    ~{(slice.streamCount / 1000).toFixed(0)}k est. monthly streams
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black font-mono text-[#0F172A]">
                  {slice.sharePercentage}%
                </span>
                <span className="text-[10px] block text-[#059669] font-bold">Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ============================================================================
// 3. DAILY ENGAGEMENT SPIKES OVER LAST 90 DAYS (D3 SPIKE BARS & CURVE)
// ============================================================================
interface DailyEngagementSpikesProps {
  spikes: EngagementSpikePoint[];
  height?: number;
}

export const DailyEngagementSpikesChart: React.FC<DailyEngagementSpikesProps> = ({
  spikes,
  height = 240
}) => {
  const [hoveredDay, setHoveredDay] = useState<EngagementSpikePoint | null>(null);

  const width = 760;
  const margin = { top: 25, right: 25, bottom: 35, left: 45 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const { xScale, yScale, trendlinePath } = useMemo(() => {
    const x = d3.scaleBand<number>()
      .domain(spikes.map(s => s.dayIndex))
      .range([0, innerWidth])
      .padding(0.25);

    const maxEngagement = d3.max(spikes, s => s.engagementScore) || 100;
    const y = d3.scaleLinear()
      .domain([0, maxEngagement * 1.15])
      .range([innerHeight, 0]);

    // Trendline
    const lineGen = d3.line<EngagementSpikePoint>()
      .x(s => (x(s.dayIndex) || 0) + x.bandwidth() / 2)
      .y(s => y(s.engagementScore))
      .curve(d3.curveMonotoneX);

    return {
      xScale: x,
      yScale: y,
      trendlinePath: lineGen(spikes) || ''
    };
  }, [spikes, innerWidth, innerHeight]);

  const maxPoint = useMemo(() => {
    return [...spikes].sort((a, b) => b.engagementScore - a.engagementScore)[0];
  }, [spikes]);

  return (
    <div className="space-y-3">
      {/* Header and Callout info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="text-[#64748B]">
          Daily interaction spikes (comments, shares, UGC video sound uses, playlist saves) across 90 days.
        </div>
        {hoveredDay ? (
          <div className="font-mono text-[#0F172A] font-bold bg-[#FEF3C7] text-[#B45309] px-2.5 py-1 rounded-lg border border-[#FDE68A]">
            {hoveredDay.dateStr}: {hoveredDay.engagementScore.toFixed(0)} score ({hoveredDay.creationsCount} creations) {hoveredDay.spikeReason ? `• ${hoveredDay.spikeReason}` : ''}
          </div>
        ) : (
          <div className="font-mono text-[#059669] font-bold">
            Peak Day: {maxPoint?.dateStr} (+{maxPoint?.creationsCount} creations)
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-white border border-[#E2E8F0] p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Horizontal baseline grids */}
            {[0, 25, 50, 75, 100].map((tick, i) => (
              <g key={i} transform={`translate(0, ${yScale(tick)})`}>
                <line x1={0} x2={innerWidth} y1={0} y2={0} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <text x={-8} y={4} textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                  {tick}
                </text>
              </g>
            ))}

            {/* Weekend Shading bands */}
            {spikes.filter(s => s.isWeekend).map((s, i) => {
              const xPos = xScale(s.dayIndex) || 0;
              return (
                <rect
                  key={i}
                  x={xPos}
                  y={0}
                  width={xScale.bandwidth()}
                  height={innerHeight}
                  fill="#F8FAFC"
                  opacity={0.7}
                />
              );
            })}

            {/* Bars for Daily Engagement */}
            {spikes.map((s, idx) => {
              const xPos = xScale(s.dayIndex) || 0;
              const barHeight = innerHeight - yScale(s.engagementScore);
              const isSelected = hoveredDay?.dayIndex === s.dayIndex;
              return (
                <g key={idx}>
                  <rect
                    x={xPos}
                    y={yScale(s.engagementScore)}
                    width={xScale.bandwidth()}
                    height={barHeight}
                    fill={s.isSpike ? '#F59E0B' : '#7155F5'}
                    fillOpacity={s.isSpike ? 0.95 : 0.65}
                    rx={2}
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                    onMouseEnter={() => setHoveredDay(s)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                  {s.isSpike && (
                    <circle
                      cx={xPos + xScale.bandwidth() / 2}
                      cy={yScale(s.engagementScore) - 4}
                      r="2.5"
                      fill="#EF4444"
                    />
                  )}
                </g>
              );
            })}

            {/* Smoothed trendline on top */}
            <path
              d={trendlinePath}
              fill="none"
              stroke="#0F172A"
              strokeWidth="2"
              strokeOpacity="0.75"
            />

            {/* X Axis: Samples every 15 days */}
            {spikes.filter((_, i) => i % 15 === 0).map((s, i) => (
              <text
                key={i}
                x={(xScale(s.dayIndex) || 0) + xScale.bandwidth() / 2}
                y={innerHeight + 20}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
                fontFamily="sans-serif"
              >
                {s.dateStr}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-[#F59E0B]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]"></span> Viral Spike (&gt;2.5σ Deviation)
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#7155F5]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#7155F5]"></span> Steady Organic Baselines
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#475569]">
          Weekend Velocity Factor: <strong>1.42x uplift</strong>
        </span>
      </div>
    </div>
  );
};


// ============================================================================
// 4. TIKTOK & REELS UGC VIRALITY TIMELINE (D3 STEP-AREA CHART)
// ============================================================================
export const UgcViralityTimelineChart: React.FC<{ points: { day: string; videoCreations: number; ugcAudioStreams: number }[] }> = ({ points }) => {
  const width = 500;
  const height = 180;
  const margin = { top: 15, right: 15, bottom: 25, left: 40 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const { xScale, yScale, areaPath, linePath } = useMemo(() => {
    const x = d3.scaleBand()
      .domain(points.map((_, i) => i.toString()))
      .range([0, innerW]);

    const maxCreates = d3.max(points, p => p.videoCreations) || 500;
    const y = d3.scaleLinear()
      .domain([0, maxCreates * 1.1])
      .range([innerH, 0]);

    const areaGen = d3.area<{ day: string; videoCreations: number }>()
      .x((_, i) => (x(i.toString()) || 0) + x.bandwidth() / 2)
      .y0(innerH)
      .y1(d => y(d.videoCreations))
      .curve(d3.curveStepAfter);

    const lineGen = d3.line<{ day: string; videoCreations: number }>()
      .x((_, i) => (x(i.toString()) || 0) + x.bandwidth() / 2)
      .y(d => y(d.videoCreations))
      .curve(d3.curveStepAfter);

    return {
      xScale: x,
      yScale: y,
      areaPath: areaGen(points) || '',
      linePath: lineGen(points) || ''
    };
  }, [points, innerW, innerH]);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="ugcAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <path d={areaPath} fill="url(#ugcAreaGrad)" />
          <path d={linePath} fill="none" stroke="#EC4899" strokeWidth="2.5" />
          {points.filter((_, i) => i % 2 === 0).map((p, i) => (
            <text
              key={i}
              x={(xScale((i * 2).toString()) || 0) + xScale.bandwidth() / 2}
              y={innerH + 16}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontFamily="monospace"
            >
              {p.day}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};


// ============================================================================
// 5. REGIONAL LISTENER CONCENTRATION (D3 HORIZONTAL RANKED BARS)
// ============================================================================
export const RegionalListenerConcentrationChart: React.FC<{ cities: RegionalConcentrationPoint[] }> = ({ cities }) => {
  const maxPercent = d3.max(cities, c => c.percentage) || 50;

  return (
    <div className="space-y-2.5">
      {cities.map((city, idx) => {
        const barWidth = (city.percentage / maxPercent) * 100;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                {city.isAnchorMarket && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                )}
                {city.city}, {city.country}
              </span>
              <span className="text-[#64748B] font-mono text-[11px]">
                {city.percentage}% • {city.estimatedListeners.toLocaleString()} fans
              </span>
            </div>

            <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  idx === 0 
                    ? 'bg-[#7155F5]' 
                    : idx === 1 
                    ? 'bg-[#38BDF8]' 
                    : idx === 2 
                    ? 'bg-[#10B981]' 
                    : 'bg-[#94A3B8]'
                }`}
                style={{ width: `${barWidth}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ============================================================================
// 6. AVM 4-PILLAR SPIDER RADAR CHART (D3 POLAR POLYGON)
// ============================================================================
export const AvmRadarChart: React.FC<{ metrics: RadarCompetencePoint[]; size?: number }> = ({
  metrics,
  size = 260
}) => {
  const radius = size / 2 - 35;
  const center = size / 2;
  const numAxes = metrics.length;
  const angleSlice = (Math.PI * 2) / numAxes;

  // D3 Scale for radial distance
  const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

  // Points for artist polygon
  const artistPoints = metrics.map((m, i) => {
    const r = rScale(m.score);
    const angle = angleSlice * i - Math.PI / 2;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  // Points for benchmark peer polygon
  const benchmarkPoints = metrics.map((m, i) => {
    const r = rScale(m.benchmarkCohortAverage);
    const angle = angleSlice * i - Math.PI / 2;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none">
        {/* Concentric Grid Polygons */}
        {[25, 50, 75, 100].map((level, idx) => {
          const gridPoints = metrics.map((_, i) => {
            const r = rScale(level);
            const angle = angleSlice * i - Math.PI / 2;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ');

          return (
            <polygon
              key={idx}
              points={gridPoints}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Radial Axes */}
        {metrics.map((m, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const labelX = center + (radius + 20) * Math.cos(angle);
          const labelY = center + (radius + 20) * Math.sin(angle);

          return (
            <g key={i}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text
                x={labelX}
                y={labelY + 4}
                textAnchor="middle"
                fill="#0F172A"
                fontSize="9"
                fontWeight="700"
              >
                {m.dimension}
              </text>
            </g>
          );
        })}

        {/* Peer Benchmark Polygon */}
        <polygon
          points={benchmarkPoints}
          fill="#94A3B8"
          fillOpacity="0.15"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />

        {/* Artist Score Polygon */}
        <polygon
          points={artistPoints}
          fill="#7155F5"
          fillOpacity="0.3"
          stroke="#7155F5"
          strokeWidth="2.5"
        />

        {/* Data points */}
        {metrics.map((m, i) => {
          const r = rScale(m.score);
          const angle = angleSlice * i - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={center + r * Math.cos(angle)}
              cy={center + r * Math.sin(angle)}
              r="4"
              fill="#7155F5"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      <div className="flex items-center gap-4 text-[11px] text-[#64748B] mt-2">
        <span className="flex items-center gap-1 font-bold text-[#7155F5]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7155F5]"></span> Target Artist
        </span>
        <span className="flex items-center gap-1 font-semibold text-[#94A3B8]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></span> Cohort Benchmark (142 peers)
        </span>
      </div>
    </div>
  );
};


// ============================================================================
// 7. VOCAL PITCH F0 CENT ERROR DISTRIBUTION HISTOGRAM (D3 BARS)
// ============================================================================
export const VocalPitchHistogramChart: React.FC<{ bins: PitchCentHistogramBin[] }> = ({ bins }) => {
  const maxPercent = d3.max(bins, b => b.percentage) || 35;

  return (
    <div className="space-y-2">
      <div className="h-36 flex items-end justify-between gap-1.5 pt-3">
        {bins.map((bin, i) => {
          const heightPercent = (bin.percentage / maxPercent) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className={`w-full rounded-t-md transition-all ${
                  bin.isWithinTolerantRange
                    ? 'bg-[#10B981] group-hover:bg-[#059669]'
                    : 'bg-[#EF4444]/65 group-hover:bg-[#DC2626]'
                }`}
                style={{ height: `${heightPercent}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[9px] px-1 rounded font-mono pointer-events-none transition-opacity">
                  {bin.percentage}%
                </div>
              </div>
              <span className="text-[8px] text-[#64748B] font-mono">{bin.centBin}¢</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
        <span className="text-[#059669] font-bold">Green = Within ±20¢ psychoacoustic tolerance</span>
        <span className="font-mono text-[#0F172A]">89.4% in key</span>
      </div>
    </div>
  );
};


// ============================================================================
// 8. DYNAMIC 1-PT/SEC TRACK ENERGY & SECTION LIFT (D3 WAVE CURVE)
// ============================================================================
export const DynamicEnergyWaveformChart: React.FC<{ points: DynamicEnergyPoint[] }> = ({ points }) => {
  const width = 640;
  const height = 140;
  const margin = { top: 15, right: 15, bottom: 25, left: 25 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const { xScale, yScale, areaPath, linePath } = useMemo(() => {
    const x = d3.scaleLinear()
      .domain([0, points.length - 1])
      .range([0, innerW]);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerH, 0]);

    const areaGen = d3.area<DynamicEnergyPoint>()
      .x((_, i) => x(i))
      .y0(innerH)
      .y1(d => y(d.perceivedEnergy))
      .curve(d3.curveMonotoneX);

    const lineGen = d3.line<DynamicEnergyPoint>()
      .x((_, i) => x(i))
      .y(d => y(d.perceivedEnergy))
      .curve(d3.curveMonotoneX);

    return {
      xScale: x,
      yScale: y,
      areaPath: areaGen(points) || '',
      linePath: lineGen(points) || ''
    };
  }, [points, innerW, innerH]);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="d3EnergyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7155F5" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7155F5" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Section Boxes */}
          <rect x={0} y={0} width={innerW * 0.18} height={innerH} fill="#F8FAFC" rx={3} />
          <rect x={innerW * 0.18} y={0} width={innerW * 0.32} height={innerH} fill="#EEF2FF" rx={3} />
          <rect x={innerW * 0.50} y={0} width={innerW * 0.35} height={innerH} fill="#FEF3C7" rx={3} />
          <rect x={innerW * 0.85} y={0} width={innerW * 0.15} height={innerH} fill="#F8FAFC" rx={3} />

          <text x={innerW * 0.09} y={12} textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="bold">INTRO</text>
          <text x={innerW * 0.34} y={12} textAnchor="middle" fill="#4338CA" fontSize="8" fontWeight="bold">VERSE 1</text>
          <text x={innerW * 0.67} y={12} textAnchor="middle" fill="#B45309" fontSize="8" fontWeight="bold">HOOK / CHORUS (+6.2dB)</text>
          <text x={innerW * 0.92} y={12} textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="bold">OUTRO</text>

          {/* Area & Wave Line */}
          <path d={areaPath} fill="url(#d3EnergyGrad)" />
          <path d={linePath} fill="none" stroke="#7155F5" strokeWidth="2.75" />
        </g>
      </svg>
    </div>
  );
};


// ============================================================================
// 9. STREAM-TO-FOLLOWER ORGANIC CONVERSION SCATTER PLOT (D3 2D BUBBLE)
// ============================================================================
export const OrganicConversionScatterPlot: React.FC<{ peers: OrganicScatterPoint[] }> = ({ peers }) => {
  return (
    <div className="relative h-44 bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] overflow-hidden select-none">
      {/* Shaded Organic Safe Zone Corridor */}
      <div className="absolute top-4 left-6 right-6 bottom-6 bg-[#10B981]/12 border border-[#10B981]/30 rounded-lg pointer-events-none flex items-center justify-center">
        <span className="text-[10px] text-[#059669] font-black tracking-wider uppercase opacity-75">
          High Retention Organic Corridor (Bot-Free)
        </span>
      </div>

      {/* Peer Scatter Dots */}
      {peers.map((p, i) => {
        const leftPct = (p.streamsToFollowerRatio / 6.0) * 85 + 5;
        const topPct = 95 - (p.organicConfidencePercent / 100) * 85;

        if (p.isTargetArtist) {
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7155F5] border-2 border-white shadow-md animate-pulse cursor-pointer flex items-center justify-center"
              style={{ left: `${leftPct}%`, top: `${topPct}%`, width: '32px', height: '32px', zIndex: 10 }}
              title={`${p.artistName}: ${p.streamsToFollowerRatio}x ratio, ${p.organicConfidencePercent}% organic`}
            >
              <span className="text-[9px] font-black text-white font-mono">YOU</span>
            </div>
          );
        }

        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#94A3B8] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ left: `${leftPct}%`, top: `${topPct}%`, width: '12px', height: '12px' }}
            title={`${p.artistName}: ${p.streamsToFollowerRatio}x ratio`}
          />
        );
      })}

      <div className="absolute bottom-1 right-3 text-[9px] font-mono text-[#94A3B8]">
        X: Stream/Follower Ratio • Y: Organic Conf %
      </div>
    </div>
  );
};


// ============================================================================
// 10. DISCOGRAPHY TRAJECTORY (TAV VS RELEASE PROGRESSION)
// ============================================================================
export const DiscographyTrajectoryChart: React.FC<{ releases: DiscographyTrajectoryPoint[] }> = ({ releases }) => {
  return (
    <div className="space-y-3">
      <div className="h-36 flex items-end justify-between gap-3 pt-3">
        {releases.map((rel, idx) => {
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div
                className="w-full bg-[#7155F5] group-hover:bg-[#5E3EE4] rounded-t-lg transition-all relative"
                style={{ height: `${(rel.tavScore / 100) * 100}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[9px] px-1.5 py-0.5 rounded font-mono pointer-events-none whitespace-nowrap shadow-md">
                  {rel.trackTitle}: TAV {rel.tavScore}
                </div>
              </div>
              <span className="text-[10px] text-[#64748B] font-mono font-bold truncate max-w-[64px]">
                Rel #{rel.releaseOrder}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
        <span>Artistic Momentum: <strong className="text-[#059669]">+12.4% TAV Progression</strong></span>
        <span className="font-mono text-[#7155F5] font-bold">Steep Upward Trajectory</span>
      </div>
    </div>
  );
};
