#!/bin/bash

set -e
set -u

psql -v ON_ERROR_STOP=1 --username  "$POSTGRES_USER" <<-EOSQL
  create user logger with encrypted password 'logger';
  create database logger;
  grant all privileges on database logger to logger;

  create user auth with encrypted password 'auth';
  create database auth;
  grant all privileges on database auth to auth;

EOSQL
