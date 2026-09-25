"""Tests for the parts of the downloader that do not need a 3 GB download.

The filename-to-class table is the piece that makes the Kaggle `test/` folder
usable at all. An earlier version of the script deleted that folder as having
"no ground-truth labels"; the labels are in the filenames.
"""

import sys
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.download_data import (
    TEST_NAME_TO_CLASS,
    class_from_test_filename,
    count_images,
    is_extracted,
)
from src.dataset import CLASSES


class TestFilenameToClass:

    @pytest.mark.parametrize("filename,expected", [
        ("AppleCedarRust1.JPG", "Apple___Cedar_apple_rust"),
        ("AppleCedarRust4.JPG", "Apple___Cedar_apple_rust"),
        ("AppleScab3.JPG", "Apple___Apple_scab"),
        ("CornCommonRust2.JPG", "Corn_(maize)___Common_rust_"),
        ("PotatoEarlyBlight5.JPG", "Potato___Early_blight"),
        ("PotatoHealthy2.JPG", "Potato___healthy"),
        ("TomatoEarlyBlight6.JPG", "Tomato___Early_blight"),
        ("TomatoHealthy4.JPG", "Tomato___healthy"),
        ("TomatoYellowCurlVirus6.JPG", "Tomato___Tomato_Yellow_Leaf_Curl_Virus"),
    ])
    def test_maps_known_kaggle_test_names(self, filename, expected):
        assert class_from_test_filename(filename) == expected

    def test_is_case_and_separator_insensitive(self):
        for variant in ("AppleScab1.JPG", "applescab1.jpg", "Apple Scab 1.JPG",
                        "Apple_Scab_1.jpeg"):
            assert class_from_test_filename(variant) == "Apple___Apple_scab"

    def test_unknown_name_returns_none_rather_than_guessing(self):
        """Unmapped names are reported to the user, not silently misfiled."""
        assert class_from_test_filename("MysteryLeaf1.JPG") is None

    def test_every_mapped_value_is_a_real_class(self):
        unknown = sorted(set(TEST_NAME_TO_CLASS.values()) - set(CLASSES))
        assert not unknown, f"Table maps to classes that do not exist: {unknown}"


class TestCountImages:

    def _make_tree(self, root: Path, names):
        for name in names:
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            Image.fromarray(
                np.zeros((8, 8, 3), dtype=np.uint8)
            ).save(path, format="JPEG")

    def test_counts_each_file_once(self, tmp_path):
        """`glob("*.jpg") + glob("*.JPG")` double-counts on Windows and macOS,
        which is how "70,295 images" once printed as 140,590."""
        self._make_tree(tmp_path, ["a/one.jpg", "a/two.JPG", "b/three.jpeg"])
        assert count_images(tmp_path) == 3

    def test_recurses_into_class_folders(self, tmp_path):
        self._make_tree(tmp_path, [f"cls{i}/img{j}.jpg" for i in range(3) for j in range(4)])
        assert count_images(tmp_path) == 12

    def test_ignores_non_images(self, tmp_path):
        self._make_tree(tmp_path, ["a/one.jpg"])
        (tmp_path / "a" / "notes.txt").write_text("not an image")
        assert count_images(tmp_path) == 1

    def test_empty_directory_is_zero(self, tmp_path):
        assert count_images(tmp_path) == 0


class TestIsExtracted:

    def test_false_when_nothing_is_there(self, tmp_path):
        assert is_extracted(tmp_path / "plantvillage") is False

    def test_false_when_only_one_split_exists(self, tmp_path):
        (tmp_path / "train" / "Apple___healthy").mkdir(parents=True)
        assert is_extracted(tmp_path) is False

    def test_false_when_a_split_directory_is_empty(self, tmp_path):
        (tmp_path / "train" / "Apple___healthy").mkdir(parents=True)
        (tmp_path / "valid").mkdir()
        assert is_extracted(tmp_path) is False

    def test_true_when_both_splits_are_populated(self, tmp_path):
        (tmp_path / "train" / "Apple___healthy").mkdir(parents=True)
        (tmp_path / "valid" / "Apple___healthy").mkdir(parents=True)
        assert is_extracted(tmp_path) is True
