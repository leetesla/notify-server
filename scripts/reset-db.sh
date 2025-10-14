#!/bin/bash
sqlite3 database/signals.db "DELETE FROM signals; UPDATE sqlite_sequence SET seq = 0 WHERE name = 'signals';"