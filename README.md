# Sync is Life

Experiment to try using shared array buffers to force synchronous APIs back into the main thread of JS.

Currently it's quite flaky, as sometimes the browser and/or OS will not pre-empt the main UI thread and let the worker thread run.  There might yet be some synchronous API call which will trigger a sleep or yeild the CPU enough to let the worker run.
