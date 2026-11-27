## Starting database (Postgres)

Note: If `docker compose` does not work on your system follow instructions here: <https://docs.docker.com/compose/install/>

To start the database

```
docker compose up -d
```

To enter the database

```
docker exec -it shelifts-postgres psql -U shelifts_user -d shelifts
```

If you need to wipe your database to start over

```
docker compose down -v
```
