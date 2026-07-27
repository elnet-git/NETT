import psycopg2


conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="nettmi",
    user="postgres",
    password="postgres"
)


cur = conn.cursor()


print("Recalculando busy...")


cur.execute("""
UPDATE "DriverLocation"
SET busy = false;
""")


cur.execute("""
UPDATE "DriverLocation"
SET busy = true
WHERE "driverId" IN (

    SELECT DISTINCT "driverId"
    FROM "Trip"
    WHERE status IN (
        'DRIVER_ASSIGNED',
        'DRIVER_ACCEPTED',
        'DRIVER_ARRIVED',
        'IN_PROGRESS'
    )
    AND "driverId" IS NOT NULL

);
""")


conn.commit()


print("Listo")


cur.close()
conn.close()