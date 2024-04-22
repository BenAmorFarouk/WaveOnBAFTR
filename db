
import sqlite3
from ibutton import device_id_value



connection = sqlite3.connect("doctor.db")
print(connection.total_changes)
cursor = connection.cursor()

# cursor.execute("CREATE TABLE IF NOT EXISTS example (id VARCHAR, Firstname TEXT, Fullname TEXT, url TEXT)")
# cursor.execute("INSERT INTO example VALUES ('0', 'Farouk', 'Farouk Ben Amor', 'URL')")
# cursor.execute("INSERT INTO example VALUES ('01-000001759e7b', 'Racem', 'Racem Taamallah', 'URL')")
# cursor.execute("INSERT INTO example VALUES ('01-000001c50667', 'Houssem', 'Houssem Ouali', 'URL')")

cursor.execute("SELECT * FROM example where id= ?",(device_id_value,))
rows = cursor.fetchall()

First_name=rows[0][1]
Full_name=rows[0][2]
url=rows[0][3]

print(First_name)
print(Full_name)
print(url)

connection.commit()

#cursor.execute("DELETE FROM example WHERE id='001-446'")
# cursor.execute("UPDATE example SET age = 31 WHERE id = 2")

# age_var = 31
# id_var = 2
# cursor.execute("UPDATE example SET age = ? WHERE id = ?", (age_var, id_var))
    
connection.close()
doctor=First_name
print(doctor)
