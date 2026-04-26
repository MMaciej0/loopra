SELECT 'CREATE DATABASE loopra_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'loopra_test')\gexec
CREATE EXTENSION IF NOT EXISTS postgis;