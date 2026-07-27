import psycopg2
from datetime import datetime


# ===============================
# CONFIGURACION DATABASE
# ===============================

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "nettmi",
    "user": "postgres",
    "password": "postgres"
}



def connect():

    return psycopg2.connect(
        **DB_CONFIG
    )



# ===============================
# REVISAR VIAJES
# ===============================

def check_trips():

    conn = connect()
    cur = conn.cursor()


    print("\n==============================")
    print(" TRIPS")
    print("==============================\n")


    cur.execute("""
        SELECT
            id,
            status,
            "passengerId",
            "driverId",
            origin,
            destination,
            "createdAt"
        FROM "Trip"
        ORDER BY "createdAt" DESC
        LIMIT 10;
    """)


    rows = cur.fetchall()


    if not rows:

        print("No hay viajes")


    else:

        for r in rows:

            print(
                f"""
ID:
{r[0]}

STATUS:
{r[1]}

PASSENGER:
{r[2]}

DRIVER:
{r[3]}

ORIGEN:
{r[4]}

DESTINO:
{r[5]}

CREADO:
{r[6]}

----------------------------
"""
            )


    cur.close()
    conn.close()





# ===============================
# REVISAR CONDUCTORES
# ===============================

def check_driver_locations():

    conn = connect()
    cur = conn.cursor()


    print("\n==============================")
    print(" DRIVER LOCATIONS")
    print("==============================\n")



    cur.execute("""
        SELECT
            id,
            "driverId",
            latitude,
            longitude,
            online,
            busy,
            "updatedAt"
        FROM "DriverLocation"
        ORDER BY "updatedAt" DESC;
    """)



    rows = cur.fetchall()



    if not rows:

        print("No hay conductores")


    else:


        for r in rows:


            print(
                f"""
LOCATION ID:
{r[0]}

DRIVER ID:
{r[1]}

LAT:
{r[2]}

LNG:
{r[3]}

ONLINE:
{r[4]}

BUSY:
{r[5]}

UPDATED:
{r[6]}

----------------------------
"""
            )



    cur.close()
    conn.close()





# ===============================
# MAIN
# ===============================

def main():

    print(
        "\nNETT DATABASE CHECK",
        datetime.now()
    )


    check_trips()

    check_driver_locations()



if __name__ == "__main__":

    main()