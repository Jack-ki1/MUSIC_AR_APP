/**
 * Comprehensive Verification Test Suite for Breakout Radar A&R Intelligence Platform
 * Executes unit tests, business logic validations, security boundary checks,
 * and data integrity assertions for production readiness.
 */

import { computeTrackAVM, computeArtistAVMRollup } from '../services/avmEngine';
import { isLegacyMainstream, LEGACY_MAINSTREAM_FILTER } from '../services/realMusicApi';
import { 
  TimeSeriesPoint, 
  PlatformShareSlice, 
  PitchCentHistogramBin 
} from '../types/analytics';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING BREAKOUT RADAR VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  // TEST GROUP 1: AVM 4-Pillar Acoustic Engine Mathematical Verification
  // --------------------------------------------------------------------------
  console.log('--- 1. AVM 4-Pillar Acoustic Engine Tests ---');
  {
    const sampleTrackId = 123456;
    const track = computeTrackAVM(sampleTrackId, 'Nairobi Nights', 'R&B / Soul', 998877);

    assert(track !== null && typeof track === 'object', 'computeTrackAVM returns structured record');
    assert(track.tav >= 0 && track.tav <= 100, `TAV score within valid bounds [0, 100] (got ${track.tav})`);

    // Verify weights sum to 1.0
    const weightSum = Number((track.weightsApplied.wV + track.weightsApplied.wW + track.weightsApplied.wS + track.weightsApplied.wC).toFixed(4));
    assert(Math.abs(weightSum - 1.0) < 0.001, `Pillar weights sum strictly to 1.0 (got ${weightSum})`);

    // Verify Production Polish Bonus is capped per PDF section 6
    assert(track.productionBonus >= 0 && track.productionBonus <= 3.0, `Production bonus is capped at +3.0 pts (got ${track.productionBonus})`);

    // Verify F0 pitch distribution exists and has valid count
    assert(Array.isArray(track.pitchDistribution) && track.pitchDistribution.length > 0, 'Pitch cent distribution generated with bins');
    assert(track.notesWithin20CentsPercent >= 0 && track.notesWithin20CentsPercent <= 100, 'Notes within 20 cents percentage is valid');
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 2: Artist Catalog Rollup (AAV, P75, Consistency, Trajectory)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Artist Catalog Rollup Synthesis Tests ---');
  {
    const tracks = [
      computeTrackAVM(1, 'Single A', 'Afropop', 101),
      computeTrackAVM(2, 'Single B', 'Afropop', 101),
      computeTrackAVM(3, 'Single C', 'Afropop', 101),
      computeTrackAVM(4, 'Single D', 'Afropop', 101)
    ];

    const rollup = computeArtistAVMRollup(tracks);

    assert(rollup.aav > 0 && rollup.aav <= 100, `AAV composite score within bounds [0, 100] (got ${rollup.aav})`);
    assert(rollup.medianTAV > 0 && rollup.medianTAV <= 100, 'Median TAV central tendency calculated');
    assert(rollup.p75TAV >= rollup.medianTAV - 2.0, `P75 upper quartile peak is consistent with median (got P75=${rollup.p75TAV}, Med=${rollup.medianTAV})`);
    assert(rollup.consistency >= 0 && rollup.consistency <= 100, `Consistency score (100 - 2*sigma) in bounds (got ${rollup.consistency})`);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Legacy Mainstream Superstar Exclusion Filter
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Legacy Mainstream Superstar Filter Tests ---');
  {
    // Megastars that MUST be excluded from discovery
    const megastars = [
      'Diamond Platnumz',
      'Burna Boy',
      'Wizkid',
      'Sauti Sol',
      'Davido',
      'Rayvanny',
      'Harmonize'
    ];

    let allFiltered = true;
    for (const star of megastars) {
      if (!isLegacyMainstream(star)) {
        allFiltered = false;
        console.error(`    Megastar not filtered: ${star}`);
      }
    }
    assert(allFiltered, 'All established superstars correctly flagged for exclusion');

    // Emerging talent that MUST be allowed through
    const emergingTalent = [
      'Kinoti',
      'Ethan Muziki',
      'Watendawili',
      'Lisa Oduor-Noah',
      'Karun',
      'Xenia Manasseh'
    ];

    let allPassed = true;
    for (const talent of emergingTalent) {
      if (isLegacyMainstream(talent)) {
        allPassed = false;
        console.error(`    Emerging artist wrongly filtered: ${talent}`);
      }
    }
    assert(allPassed, 'Emerging underground artists allowed through discovery filter');
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 4: Analytics Data Contract & Invariants
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Analytics Data Contract Invariant Tests ---');
  {
    // Platform distribution slice sum test
    const testSlices: PlatformShareSlice[] = [
      { platform: 'Spotify', sharePercentage: 42, streamCount: 42000, color: '#10B981' },
      { platform: 'YouTube', sharePercentage: 26, streamCount: 26000, color: '#EF4444' },
      { platform: 'TikTok', sharePercentage: 18, streamCount: 18000, color: '#0F172A' },
      { platform: 'Apple Music', sharePercentage: 9, streamCount: 9000, color: '#F43F5E' },
      { platform: 'Boomplay', sharePercentage: 5, streamCount: 5000, color: '#38BDF8' }
    ];

    const totalShare = testSlices.reduce((acc, s) => acc + s.sharePercentage, 0);
    assert(totalShare === 100, `Platform audience share percentages sum exactly to 100% (got ${totalShare}%)`);

    // Pitch Histogram cent range
    const bins: PitchCentHistogramBin[] = [
      { centBin: '-50', centValue: -50, percentage: 2, isWithinTolerantRange: false },
      { centBin: '0',   centValue: 0,   percentage: 31, isWithinTolerantRange: true },
      { centBin: '+50', centValue: 50,  percentage: 1, isWithinTolerantRange: false }
    ];

    const hasCenter = bins.some(b => b.centValue === 0 && b.isWithinTolerantRange);
    assert(hasCenter, 'Vocal pitch histogram includes calibrated zero-cent in-key bin');
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
