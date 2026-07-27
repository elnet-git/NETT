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




def check_driver(driver_id):

    conn = connect()
    cur = conn.cursor()


    print("\n==============================")
    print(" DRIVER LOCATION")
    print("==============================\n")


    cur.execute(
        """
        SELECT
            "id",
            "driverId",
            latitude,
            longitude,
            online,
            busy,
            "updatedAt"
        FROM "DriverLocation"
        WHERE "driverId"=%s;
        """,
        (driver_id,)
    )


    location = cur.fetchone()


    if location:

        print(
            f"""
ID:
{location[0]}

DRIVER ID:
{location[1]}

LAT:
{location[2]}

LNG:
{location[3]}

ONLINE:
{location[4]}

BUSY:
{location[5]}

UPDATED:
{location[6]}
"""
        )

    else:

        print("No existe DriverLocation")





    print("\n==============================")
    print(" TRIPS DEL DRIVER")
    print("==============================\n")



    cur.execute(
        """
        SELECT
            id,
            status,
            "createdAt"
        FROM "Trip"
        WHERE "driverId"=%s
        ORDER BY "createdAt" DESC;
        """,
        (driver_id,)
    )



    trips = cur.fetchall()


    if not trips:

        print("No tiene viajes")

    else:

        for trip in trips:

            print(
                f"""
TRIP ID:
{trip[0]}

STATUS:
{trip[1]}

CREATED:
{trip[2]}

----------------------------
"""
            )



    cur.close()
    conn.close()






def main():

    print(
        "\nNETT DRIVER CHECK",
        datetime.now()
    )


    # conductor de prueba
    driver_id = "ccd92509-f90d-4981-90e1-22d988b33e61"


    check_driver(driver_id)




if __name__ == "__main__":

    main()