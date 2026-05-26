"""Tests for mode configuration and switching."""

import pytest
from piestore.modes import Mode, MODE_CONFIGS
from piestore.state import AppState


class TestModeEnum:
    def test_mode_values(self):
        assert Mode.BASELINE == 1
        assert Mode.GUARDRAILS == 2
        assert Mode.SANDBOXED == 3

    def test_mode_from_int(self):
        assert Mode(1) == Mode.BASELINE
        assert Mode(2) == Mode.GUARDRAILS
        assert Mode(3) == Mode.SANDBOXED

    def test_invalid_mode(self):
        with pytest.raises(ValueError):
            Mode(4)


class TestModeConfigs:
    def test_all_modes_have_config(self):
        for mode in Mode:
            assert mode in MODE_CONFIGS

    def test_baseline_config(self):
        cfg = MODE_CONFIGS[Mode.BASELINE]
        assert cfg.expose_get_env is True
        assert cfg.use_enforce_route is False
        assert cfg.label == "Baseline"

    def test_guardrails_config(self):
        cfg = MODE_CONFIGS[Mode.GUARDRAILS]
        assert cfg.expose_get_env is True
        assert cfg.use_enforce_route is True
        assert cfg.label == "Guardrails"

    def test_sandboxed_config(self):
        cfg = MODE_CONFIGS[Mode.SANDBOXED]
        assert cfg.expose_get_env is False
        assert cfg.use_enforce_route is True
        assert cfg.label == "Sandboxed"

    def test_only_baseline_observes(self):
        """Only baseline mode uses observe (not enforce) route."""
        for mode, cfg in MODE_CONFIGS.items():
            if mode == Mode.BASELINE:
                assert cfg.use_enforce_route is False
            else:
                assert cfg.use_enforce_route is True

    def test_only_sandboxed_removes_tool(self):
        """Only sandboxed mode removes the get_env tool."""
        for mode, cfg in MODE_CONFIGS.items():
            if mode == Mode.SANDBOXED:
                assert cfg.expose_get_env is False
            else:
                assert cfg.expose_get_env is True


class TestAppState:
    @pytest.fixture
    def fresh_state(self):
        return AppState()

    def test_default_mode(self, fresh_state):
        assert fresh_state.mode == Mode.BASELINE

    def test_record_access(self, fresh_state):
        event = fresh_state.record_access("test-user", "github")
        assert event.name == "test-user"
        assert event.secret_type == "github"
        assert event.reached_user is True
        assert event.mode == Mode.BASELINE.value
        assert fresh_state.total_accesses == 1

    def test_record_multiple_accesses(self, fresh_state):
        fresh_state.record_access("user1", "github")
        fresh_state.record_access("user2", "aws")
        fresh_state.record_access("user1", "cc")
        assert fresh_state.total_accesses == 3
        assert len(fresh_state.recent) == 3

    def test_recent_is_bounded(self, fresh_state):
        for i in range(100):
            fresh_state.record_access(f"user-{i}", "github")
        assert len(fresh_state.recent) == 50  # maxlen

    def test_recent_is_most_recent_first(self, fresh_state):
        fresh_state.record_access("first", "github")
        fresh_state.record_access("second", "aws")
        assert fresh_state.recent[0].name == "second"
        assert fresh_state.recent[1].name == "first"
