def test_joukowsky_basic():
    from physics_engine.joukowsky import joukowsky_delta_p
    v = 2.0
    p = joukowsky_delta_p(v, rho=1000.0, wave_speed=1000.0)
    assert abs(p - 2e6) < 1e-6


def test_cavitation_simple():
    from physics_engine.cavitation import detect_cavitation_simple
    assert detect_cavitation_simple(1000.0, 500.0, margin_pa=600.0)
