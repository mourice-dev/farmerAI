"""Tests for the plant-aware disease reference table.

The headline test here is `test_no_class_falls_through_to_fallback`. The two
knowledge bases this table replaced both resolved by substring matching over
dict insertion order, so adding an innocuous key like "blight" silently
rerouted several unrelated classes. Nothing caught it, because nothing checked.
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.dataset import CLASSES
from src.diseases import (
    DISCLAIMER,
    DISEASES,
    SEVERITY_COLOR,
    SEVERITY_LABEL,
    display_name,
    get_disease_info,
    severity_of,
)

FALLBACK_MARKER = "No reference entry"


class TestCoverage:

    def test_every_class_has_an_entry(self):
        missing = [c for c in CLASSES if c not in DISEASES]
        assert not missing, f"No reference entry for: {missing}"

    def test_no_extra_entries(self):
        extra = [k for k in DISEASES if k not in CLASSES]
        assert not extra, f"Entries for unknown classes: {extra}"

    def test_no_class_falls_through_to_fallback(self):
        """Every one of the 38 classes must resolve to its own entry."""
        fell_through = [
            c for c in CLASSES
            if FALLBACK_MARKER in get_disease_info(c)["treatment"]
        ]
        assert not fell_through, f"Fell through to the generic default: {fell_through}"

    def test_unknown_class_gets_the_fallback(self):
        info = get_disease_info("Durian___Nonexistent_rot")
        assert FALLBACK_MARKER in info["treatment"]
        assert info["plant"] == "Durian"

    @pytest.mark.parametrize("class_name", CLASSES)
    def test_entry_is_well_formed(self, class_name):
        info = get_disease_info(class_name)
        for field in ("plant", "label", "severity", "color", "icon", "treatment"):
            assert info[field], f"{class_name}: empty field '{field}'"
        assert info["severity"] in SEVERITY_LABEL
        assert info["severity"] in SEVERITY_COLOR
        assert info["color"].startswith("#")


class TestPlantAwareness:
    """The bug this table exists to fix: advice keyed on disease name alone."""

    @pytest.mark.parametrize(
        "class_a,class_b",
        [
            # Botryosphaeria obtusa vs Guignardia bidwellii
            ("Apple___Black_rot", "Grape___Black_rot"),
            # Xanthomonas arboricola pv. pruni vs X. euvesicatoria
            ("Peach___Bacterial_spot", "Pepper,_bell___Bacterial_spot"),
            ("Peach___Bacterial_spot", "Tomato___Bacterial_spot"),
            # Podosphaera clandestina vs P. xanthii
            ("Cherry_(including_sour)___Powdery_mildew", "Squash___Powdery_mildew"),
            # Same pathogens, different crop management
            ("Potato___Early_blight", "Tomato___Early_blight"),
            ("Potato___Late_blight", "Tomato___Late_blight"),
        ],
    )
    def test_same_disease_different_plant_gives_different_advice(self, class_a, class_b):
        a, b = get_disease_info(class_a), get_disease_info(class_b)
        assert a["treatment"] != b["treatment"], (
            f"{class_a} and {class_b} share treatment text -- the lookup has "
            "fallen back to keying on the disease name alone."
        )
        assert a["plant"] != b["plant"]

    def test_every_treatment_is_distinct(self):
        treatments = [d["treatment"] for d in DISEASES.values()]
        assert len(set(treatments)) == len(treatments), (
            "Two classes share treatment text; advice should be per class."
        )

    def test_plant_is_not_taken_from_the_disease_half(self):
        assert get_disease_info("Pepper,_bell___Bacterial_spot")["plant"] == "Bell Pepper"
        assert get_disease_info("Corn_(maize)___Common_rust_")["plant"] == "Corn (Maize)"

    def test_display_name_combines_plant_and_disease(self):
        assert display_name("Tomato___Late_blight") == "Tomato - Late Blight"


class TestSeverity:

    def test_healthy_classes_are_severity_none(self):
        for class_name in CLASSES:
            if class_name.endswith("___healthy"):
                assert severity_of(class_name) == "none", class_name

    def test_disease_classes_are_never_severity_none(self):
        for class_name in CLASSES:
            if not class_name.endswith("___healthy"):
                assert severity_of(class_name) != "none", class_name

    def test_incurable_diseases_are_flagged_severe(self):
        for class_name in (
            "Orange___Haunglongbing_(Citrus_greening)",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
            "Tomato___Tomato_mosaic_virus",
            "Grape___Esca_(Black_Measles)",
            "Potato___Late_blight",
            "Tomato___Late_blight",
        ):
            assert severity_of(class_name) == "severe", class_name


class TestDisclaimer:

    def test_disclaimer_mentions_local_registration(self):
        """Several named actives are withdrawn in major jurisdictions."""
        assert "registration" in DISCLAIMER.lower()

    def test_disclaimer_is_not_empty(self):
        assert len(DISCLAIMER) > 80
