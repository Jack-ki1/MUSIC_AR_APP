import math
import unittest

from backend.data import compute_artist_rollup, compute_track_avm, generate_timeseries, get_seed_artists, is_legacy_mainstream


class BackendLogicTests(unittest.TestCase):
    def test_legacy_filter(self):
        self.assertTrue(is_legacy_mainstream("Diamond Platnumz"))
        self.assertFalse(is_legacy_mainstream("Kinoti"))

    def test_track_avm_bounds(self):
        avm = compute_track_avm(1, "Test Song", "Afro-Soul", 123)
        self.assertGreaterEqual(avm["tav"], 0)
        self.assertLessEqual(avm["tav"], 100)
        self.assertGreaterEqual(avm["productionBonus"], 0)
        self.assertLessEqual(avm["productionBonus"], 3.0)
        self.assertEqual(set(avm["weightsApplied"].keys()), {"wV", "wW", "wS", "wC"})
        self.assertTrue(math.isclose(sum(avm["weightsApplied"].values()), 1.0, rel_tol=1e-6))

    def test_artist_rollup_and_seed(self):
        seed = get_seed_artists()
        self.assertGreaterEqual(len(seed), 1)
        rollup = compute_artist_rollup([{"tav": 80}, {"tav": 84}, {"tav": 78}])
        self.assertGreaterEqual(rollup["aav"], 0)
        self.assertLessEqual(rollup["aav"], 100)
        self.assertEqual(rollup["trackCount"], 3)

    def test_timeseries_shape(self):
        pts = generate_timeseries(64000, "30D")
        self.assertEqual(len(pts), 30)
        self.assertTrue({"date", "spotify", "appleMusic", "youtube", "tiktokUgc", "total"}.issubset(pts[0].keys()))


if __name__ == "__main__":
    unittest.main()

