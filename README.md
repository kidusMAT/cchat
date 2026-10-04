# cchat

## Ambient activity

The optional ambient background simulation runs as its own long-lived process,
separate from the Django web server:

```text
python manage.py simulate_ambient_activity
```

Set `AMBIENT_SIMULATION_ENABLED=False` to disable synthetic events. Real
reactions continue to broadcast regardless of this setting.
