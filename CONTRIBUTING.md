# Contributing

This repository is a compact public project, so contributions should keep the app easy to run and easy to understand.

## Local Check

```bash
pip install -r requirements.txt
python -m py_compile main.py
python main.py
```

Then open `http://localhost:8080` and confirm the dashboard loads.

## Change Guidelines

- Keep source failures isolated; one feed should not break the whole dashboard.
- Prefer small, readable changes over broad rewrites.
- Update `README.md` when runtime behavior, source coverage, or API shape changes.
- Avoid adding client-side dependencies unless they clearly improve the dashboard.
