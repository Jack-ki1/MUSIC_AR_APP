import React, { useEffect, useRef } from 'react';
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

interface ChartEmptyProps {
  message: string;
  subtext?: string;
}

export const ChartEmptyState: React.FC<ChartEmptyProps> = ({ message, subtext }) => (
  <div className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-lg bg-[#F8FAFC] border border-dashed border-[#E4E7EC]">
    <p className="text-xs font-semibold text-[#475467]">{message}</p>
    {subtext && <p className="text-[11px] text-[#98A2B3] mt-1 max-w-sm">{subtext}</p>}
  </div>
);

// ============================================================================
// 1. AUDIENCE STREAM PROGRESSION CHART
// ============================================================================
export const MonthlyStreamProgressionChart: React.FC<{ 
  data?: TimeSeriesPoint[]; 
  height?: number; 
  timeRangeLabel?: string;
}> = ({ data = [] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const el = svgRef.current;
    d3.select(el).selectAll('*').remove();

    const margin = { top: 16, right: 16, bottom: 24, left: 44 };
    const clientW = el.clientWidth || el.parentElement?.clientWidth || 400;
    const width = Math.max(280, clientW - margin.left - margin.right);
    const height = 220 - margin.top - margin.bottom;

    const svg = d3.select(el)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseDate = (dStr: string) => new Date(dStr);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => parseDate(d.date)) as [Date, Date])
      .range([0, width]);

    const maxY = d3.max(data, d => d.total) || 1000;
    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([height, 0]);

    // Grid
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(4).tickSize(-width).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#F2F4F7');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d') as any))
      .selectAll('text')
      .attr('fill', '#98A2B3')
      .attr('font-size', '10px');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d3.format('.1s')(d as number)}`))
      .selectAll('text')
      .attr('fill', '#98A2B3')
      .attr('font-size', '10px');

    // Area
    const area = d3.area<TimeSeriesPoint>()
      .x(d => x(parseDate(d.date)))
      .y0(height)
      .y1(d => y(d.total))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', '#EEF2FF')
      .attr('d', area);

    // Line
    const line = d3.line<TimeSeriesPoint>()
      .x(d => x(parseDate(d.date)))
      .y(d => y(d.total))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4F46E5')
      .attr('stroke-width', 2)
      .attr('d', line);
  }, [data]);

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full h-[220px]" />
    </div>
  );
};

// ============================================================================
// 2. PLATFORM AUDIENCE PIE CHART
// ============================================================================
export const PlatformAudiencePieChart: React.FC<{ 
  data?: PlatformShareSlice[]; 
  slices?: PlatformShareSlice[]; 
  size?: number;
}> = ({ data, slices }) => {
  const chartData = data || slices || [];
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const el = svgRef.current;
    d3.select(el).selectAll('*').remove();

    const clientW = el.clientWidth || el.parentElement?.clientWidth || 280;
    const width = Math.max(220, clientW);
    const height = 200;
    const radius = Math.min(width, height) / 2 - 12;

    const svg = d3.select(el)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(chartData.map(d => d.platform))
      .range(['#4F46E5', '#0891B2', '#15803D', '#B45309', '#9333EA']);

    const pie = d3.pie<PlatformShareSlice>()
      .value(d => d.sharePercentage)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<PlatformShareSlice>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius);

    svg.selectAll('path')
      .data(pie(chartData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.platform) as string)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);
  }, [chartData]);

  if (chartData.length === 0) {
    return <ChartEmptyState message="Platform distribution not verified" subtext="DSP audience breakdown requires connected platform accounts." />;
  }

  return (
    <div className="w-full flex items-center justify-center">
      <svg ref={svgRef} className="w-full" style={{ height: 200 }} />
    </div>
  );
};

// ============================================================================
// 3. DAILY ENGAGEMENT SPIKES CHART
// ============================================================================
export const DailyEngagementSpikesChart: React.FC<{ 
  data?: EngagementSpikePoint[]; 
  spikes?: EngagementSpikePoint[]; 
  height?: number;
}> = ({ data, spikes }) => {
  const chartData = data || spikes || [];
  if (chartData.length === 0) {
    return <ChartEmptyState message="No engagement velocity telemetry" subtext="Requires social/UGC monitoring integration." />;
  }

  return (
    <div className="h-48 flex items-end gap-1 p-3 bg-[#F8FAFC] rounded-lg">
      {chartData.slice(-20).map((pt, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className={`w-full rounded-t ${pt.isSpike ? 'bg-[#B45309]' : 'bg-[#C7D2FE]'}`} 
            style={{ height: `${Math.max(4, pt.engagementScore * 1.5)}px` }}
            title={`${pt.dateStr}: Score ${pt.engagementScore}`}
          />
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 4. UGC VIRALITY TIMELINE CHART
// ============================================================================
export const UgcViralityTimelineChart: React.FC<{ 
  data?: any[]; 
  points?: any[]; 
}> = ({ data, points }) => {
  const chartData = data || points || [];
  if (chartData.length === 0) {
    return <ChartEmptyState message="UGC video creations telemetry unavailable" subtext="TikTok / Reels audio ID tracking not yet active for this candidate." />;
  }
  return <div className="h-48 bg-[#F8FAFC] rounded-lg p-4 text-xs text-[#667085]">UGC Timeline Loaded ({chartData.length} data points)</div>;
};

// ============================================================================
// 5. REGIONAL LISTENER CONCENTRATION CHART
// ============================================================================
export const RegionalListenerConcentrationChart: React.FC<{ 
  data?: RegionalConcentrationPoint[]; 
  cities?: RegionalConcentrationPoint[]; 
}> = ({ data, cities }) => {
  const chartData = data || cities || [];
  if (chartData.length === 0) {
    return <ChartEmptyState message="Regional concentration data unavailable" subtext="City-level DSP listener distribution requires Chartmetric or Spotify for Artists feed." />;
  }

  return (
    <div className="space-y-2">
      {chartData.map((r, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#101828]">{r.city}, {r.country}</span>
            <span className="text-[#475467]">{r.percentage}%</span>
          </div>
          <div className="w-full bg-[#F2F4F7] h-2 rounded-full overflow-hidden">
            <div className="bg-[#4F46E5] h-full rounded-full" style={{ width: `${r.percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 6. AVM 4-PILLAR RADAR CHART
// ============================================================================
export const AvmRadarChart: React.FC<{ 
  data?: RadarCompetencePoint[]; 
  metrics?: RadarCompetencePoint[]; 
  size?: number;
}> = ({ data, metrics }) => {
  const chartData = data || metrics || [];
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const el = svgRef.current;
    d3.select(el).selectAll('*').remove();

    const clientW = el.clientWidth || el.parentElement?.clientWidth || 280;
    const width = Math.max(220, clientW);
    const height = 220;
    const radius = Math.min(width, height) / 2 - 28;
    const total = chartData.length;
    const angleSlice = (Math.PI * 2) / total;

    const svg = d3.select(el)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const rScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, radius]);

    // Background concentric circles
    const levels = 4;
    for (let i = 1; i <= levels; i++) {
      const levelFactor = (radius / levels) * i;
      svg.append('circle')
        .attr('r', levelFactor)
        .attr('fill', 'none')
        .attr('stroke', '#E4E7EC')
        .attr('stroke-dasharray', '2,2');
    }

    // Axes
    const axis = svg.selectAll('.axis')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (_, i) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (_, i) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('stroke', '#E4E7EC');

    // Axis Labels
    axis.append('text')
      .attr('x', (_, i) => (rScale(100) + 16) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (_, i) => (rScale(100) + 16) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#475467')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text(d => d.dimension);

    // Radar Area
    const radarLine = d3.lineRadial<RadarCompetencePoint>()
      .radius(d => rScale(d.score))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    svg.append('path')
      .datum(chartData)
      .attr('d', radarLine as any)
      .attr('fill', '#4F46E5')
      .attr('fill-opacity', 0.25)
      .attr('stroke', '#4F46E5')
      .attr('stroke-width', 2);

    // Candidate Points
    svg.selectAll('.radarCircle')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('r', 4)
      .attr('cx', (d, i) => rScale(d.score) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.score) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('fill', '#4F46E5')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5);
  }, [chartData]);

  if (chartData.length === 0) {
    return <ChartEmptyState message="AVM 4-pillar scorecard awaiting acoustic analysis" />;
  }

  return (
    <div className="w-full flex items-center justify-center">
      <svg ref={svgRef} className="w-full" style={{ height: 220 }} />
    </div>
  );
};

// ============================================================================
// 7. VOCAL PITCH CENT HISTOGRAM
// ============================================================================
export const VocalPitchHistogramChart: React.FC<{ 
  data?: PitchCentHistogramBin[]; 
  bins?: PitchCentHistogramBin[]; 
}> = ({ data, bins }) => {
  const chartData = data || bins || [];
  if (chartData.length === 0) {
    return <ChartEmptyState message="Vocal f0 intonation distribution unanalyzed" subtext="Upload vocal stem or run preview audio analysis to generate cent distribution." />;
  }

  return (
    <div className="space-y-1.5">
      <div className="h-32 flex items-end gap-1.5 p-2 bg-[#F8FAFC] rounded-lg border border-[#E4E7EC]">
        {chartData.map((bin, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className={`w-full rounded-t ${bin.isWithinTolerantRange ? 'bg-[#15803D]' : 'bg-[#D0D5DD]'}`}
              style={{ height: `${Math.max(4, bin.percentage * 2.8)}px` }}
              title={`${bin.centBin} cents: ${bin.percentage}%`}
            />
            <span className="text-[9px] text-[#667085] font-mono">{bin.centBin}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-[#667085] px-1">
        <span>-50 cents (Flat)</span>
        <span className="font-semibold text-[#15803D]">±20 cents in-key zone</span>
        <span>+50 cents (Sharp)</span>
      </div>
    </div>
  );
};

// ============================================================================
// 8. DYNAMIC ENERGY WAVEFORM
// ============================================================================
export const DynamicEnergyWaveformChart: React.FC<{ 
  data?: DynamicEnergyPoint[]; 
  points?: DynamicEnergyPoint[]; 
}> = ({ data, points }) => {
  const chartData = data || points || [];
  if (chartData.length === 0) {
    return <ChartEmptyState message="Waveform energy curve not yet analyzed" />;
  }

  return (
    <div className="h-28 flex items-center gap-1 p-2 bg-[#F8FAFC] rounded-lg border border-[#E4E7EC]">
      {chartData.map((pt, i) => (
        <div 
          key={i} 
          className="flex-1 bg-[#4F46E5] rounded-full transition-all"
          style={{ height: `${Math.max(10, pt.perceivedEnergy * 80)}%` }}
          title={`${pt.second}s: ${pt.section} (${(pt.perceivedEnergy * 100).toFixed(0)}% energy)`}
        />
      ))}
    </div>
  );
};

// ============================================================================
// 9. ORGANIC CONVERSION SCATTER PLOT
// ============================================================================
export const OrganicConversionScatterPlot: React.FC<{ 
  data?: OrganicScatterPoint[]; 
  peers?: OrganicScatterPoint[]; 
}> = ({ data, peers }) => {
  const chartData = data || peers || [];
  if (chartData.length === 0) {
    return <ChartEmptyState message="Organic conversion scatter requires multi-artist cohort" />;
  }

  return (
    <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E4E7EC] text-xs text-[#667085]">
      {chartData.map((pt, i) => (
        <div key={i} className="flex justify-between py-1 border-b border-[#F2F4F7]">
          <span className="font-semibold text-[#101828]">{pt.artistName}</span>
          <span>Ratio: {pt.streamsToFollowerRatio.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 10. DISCOGRAPHY TRAJECTORY CHART
// ============================================================================
export const DiscographyTrajectoryChart: React.FC<{ 
  data?: DiscographyTrajectoryPoint[]; 
  releases?: DiscographyTrajectoryPoint[]; 
}> = ({ data, releases }) => {
  const chartData = data || releases || [];
  if (chartData.length === 0) {
    return <ChartEmptyState message="Single release only" subtext="Trajectory requires minimum 2 verified releases in catalogue." />;
  }

  return (
    <div className="space-y-2">
      {chartData.map((d, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded border border-[#E4E7EC] bg-white text-xs">
          <div>
            <p className="font-semibold text-[#101828]">#{d.releaseOrder} {d.trackTitle}</p>
            <p className="text-[10px] text-[#667085]">{d.releaseDate}</p>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-[#4F46E5]">TAV {d.tavScore}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
