import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="nettmi",
    user="postgres",
    password="postgres"
)

cur = conn.cursor()

cur.execute("""
UPDATE "DriverLocation"
SET busy=false
WHERE "driverId"='ccd92509-f90d-4981-90e1-22d988b33e61';
""")

conn.commit()

print("CONDUCTOR LIBERADO")

cur.close()
conn.close()