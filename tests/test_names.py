"""Tests for display name generation."""

from piestore.names import generate_display_name, is_valid_name, COLORS, ANIMALS


class TestGenerateDisplayName:
    def test_format(self):
        name = generate_display_name()
        parts = name.split("-")
        assert len(parts) == 2
        assert parts[0] in COLORS
        assert parts[1] in ANIMALS

    def test_randomness(self):
        # Generate 20 names, expect at least 10 unique
        names = {generate_display_name() for _ in range(20)}
        assert len(names) >= 10

    def test_no_uppercase(self):
        for _ in range(50):
            name = generate_display_name()
            assert name == name.lower()

    def test_reasonable_length(self):
        for _ in range(50):
            name = generate_display_name()
            assert len(name) <= 30


class TestIsValidName:
    def test_valid_names(self):
        assert is_valid_name("crimson-marmot") is True
        assert is_valid_name("cerulean-pangolin") is True
        assert is_valid_name("slate-axolotl") is True

    def test_invalid_empty(self):
        assert is_valid_name("") is False

    def test_invalid_too_long(self):
        assert is_valid_name("a" * 51) is False

    def test_invalid_format(self):
        assert is_valid_name("just-one-word-extra") is False
        assert is_valid_name("nodelimiter") is False

    def test_invalid_color(self):
        assert is_valid_name("xyzcolor-marmot") is False

    def test_invalid_animal(self):
        assert is_valid_name("crimson-xyzanimal") is False


class TestWordlists:
    def test_no_duplicates_in_colors(self):
        assert len(COLORS) == len(set(COLORS))

    def test_no_duplicates_in_animals(self):
        assert len(ANIMALS) == len(set(ANIMALS))

    def test_all_lowercase_colors(self):
        for color in COLORS:
            assert color == color.lower()

    def test_all_lowercase_animals(self):
        for animal in ANIMALS:
            assert animal == animal.lower()

    def test_enough_combinations(self):
        # At least 5000 unique names possible
        assert len(COLORS) * len(ANIMALS) >= 5000
