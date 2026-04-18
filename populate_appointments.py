import sqlite3
import random
from datetime import datetime, timedelta

def add_appointments():
    conn = sqlite3.connect('hospital.db')
    cursor = conn.cursor()

    # Get random patients and doctors
    cursor.execute("SELECT id FROM patients")
    pat_ids = [r[0] for r in cursor.fetchall()]
    
    cursor.execute("SELECT id FROM doctors")
    doc_ids = [r[0] for r in cursor.fetchall()]

    if not pat_ids or not doc_ids:
        print("Error: Need patients and doctors first.")
        return

    print("Populating Appointments for Analytics...")
    # Generate 30 appointments over the last 7 days
    for i in range(30):
        p_id = random.choice(pat_ids)
        d_id = random.choice(doc_ids)
        days_ago = random.randint(0, 6)
        date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M')
        cursor.execute("INSERT INTO appointments (patient_id, doctor_id, appointment_date) VALUES (?, ?, ?)", (p_id, d_id, date))

    conn.commit()
    conn.close()
    print("30 sample appointments added!")

if __name__ == '__main__':
    add_appointments()
