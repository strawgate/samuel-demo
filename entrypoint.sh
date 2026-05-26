#!/bin/bash
set -e

# Initialize Postgres data dir on first run
if [ ! -s "/var/lib/postgresql/data/PG_VERSION" ]; then
    su postgres -c "/usr/lib/postgresql/16/bin/initdb -D /var/lib/postgresql/data"
    su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/data -l /tmp/pg.log start"
    su postgres -c "psql -c \"CREATE USER piestore WITH PASSWORD 'piestore' SUPERUSER;\""
    su postgres -c "psql -c \"CREATE DATABASE piestore OWNER piestore;\""
    su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/data stop"
fi

exec supervisord -c /app/supervisord.conf
