import sqlite3

def init_db():
    conn = sqlite3.connect('hospital.db')
    cursor = conn.cursor()

    # Create Patients table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        contact TEXT,
        address TEXT
    )
    ''')

    # Create Doctors table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        specialization TEXT NOT NULL,
        contact TEXT
    )
    ''')

    # Create Appointments table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        doctor_id INTEGER,
        appointment_date TEXT,
        status TEXT DEFAULT 'Scheduled',
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    )
    ''')

    # Create Medical Records table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        doctor_id INTEGER,
        diagnosis TEXT,
        treatment TEXT,
        record_date TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    )
    ''')

    # Add some initial data if empty
    cursor.execute("SELECT COUNT(*) FROM doctors")
    if cursor.fetchone()[0] == 0:
        doctors = [
            ('Dr. Naveen Kumar', 'Cardiologist', '9876543210'),
            ('Dr. Sarah Ahmed', 'Neurologist', '9876543211'),
            ('Dr. Rajesh Sharma', 'Pediatrician', '9876543212'),
            ('Dr. Priya Singh', 'Orthopedic', '9876543213')
        ]
        cursor.executemany("INSERT INTO doctors (name, specialization, contact) VALUES (?, ?, ?)", doctors)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
