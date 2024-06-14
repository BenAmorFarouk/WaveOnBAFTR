import sqlite3
from ibutton import device_id_value

connection = sqlite3.connect("doctor.db")
cursor = connection.cursor()

# cursor.execute("CREATE TABLE IF NOT EXISTS example (id VARCHAR, Firstname TEXT, Fullname TEXT, url TEXT)")
# cursor.execute("INSERT INTO example VALUES ('0', 'Farouk', 'Farouk Ben Amor', 'URL')")
# cursor.execute("INSERT INTO example VALUES ('01-000001759e7b', 'Racem', 'Racem Taamallah', 'URL')")
# cursor.execute("INSERT INTO example VALUES ('01-000001c50667', 'Houssem', 'Houssem Ouali', 'URL')")

device_id = device_id_value

found = False

while not found:
    cursor.execute("SELECT * FROM example WHERE id=?", (device_id,))
    row = cursor.fetchone()

    if row:
        First_name = row[1]
        Full_name = row[2]
        url = row[3]

        print(First_name)
        print(Full_name)
        print(url)

        connection.commit()

        #cursor.execute("DELETE FROM example WHERE id='001-446'")
        # cursor.execute("UPDATE example SET age = 31 WHERE id = 2")

        # age_var = 31
        # id_var = 2
        doctor = First_name
        print(doctor)

        found = True
    else:
        print(f"Device ID {device_id} not found in the database. Retrying...")

connection.close()
