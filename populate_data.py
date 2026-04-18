import sqlite3
import random

def populate():
    conn = sqlite3.connect('hospital.db')
    cursor = conn.cursor()

    # Specializations
    specialties = [
        'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics', 
        'Dermatology', 'Psychiatry', 'Gastroenterology', 'Endocrinology', 'Urology',
        'Radiology', 'Anesthesiology', 'Ophthalmology', 'Gynecology', 'ENT Specialist'
    ]

    # Sample Doctors
    doc_names = [
        'Dr. Rajesh Kumar', 'Dr. Sarah Johnson', 'Dr. Amit Sharma', 'Dr. Priya Patel', 
        'Dr. Michael Chen', 'Dr. Anjali Gupta', 'Dr. David Wilson', 'Dr. Neha Reddy',
        'Dr. James Miller', 'Dr. Sunita Rao', 'Dr. Robert Brown', 'Dr. Kavita Singh',
        'Dr. Sanjay Mehta', 'Dr. Lisa Wong', 'Dr. Vikram Malhotra', 'Dr. Emily Davis',
        'Dr. Arun Joshi', 'Dr. Sophia Garcia', 'Dr. Manish Verma', 'Dr. Olivia Taylor'
    ]
    
    # Generate 50 Doctors
    print("Populating Doctors...")
    for i in range(50):
        name = random.choice(doc_names) + " " + random.choice(['SR.', 'JR.', ''])
        spec = random.choice(specialties)
        contact = f"+91 {random.randint(7000, 9999)} {random.randint(10000, 99999)}"
        cursor.execute("INSERT INTO doctors (name, specialization, contact) VALUES (?, ?, ?)", (name, spec, contact))

    # Sample Patients
    pat_names = [
        'Aarav Sharma', 'Aditi Rao', 'Rohan Gupta', 'Isha Patel', 'Kabir Singh', 
        'Zoya Khan', 'Arjun Verma', 'Sana Reddy', 'Vihaan Malhotra', 'Ishani Joshi',
        'Aryan Mehta', 'Myra Kapoor', 'Reyansh Goel', 'Ananya Dixit', 'Advait Iyer',
        'Saanvi Deshmukh', 'Ishaan Saxena', 'Kyra Bansal', 'Vivaan Chandra', 'Riya Mittal'
    ]
    genders = ['Male', 'Female', 'Other']
    cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Pune']

    # Generate 50 Patients
    print("Populating Patients...")
    for i in range(50):
        name = random.choice(pat_names)
        age = random.randint(5, 85)
        gender = random.choice(genders)
        contact = f"+91 {random.randint(6000, 9999)} {random.randint(10000, 99999)}"
        address = f"Flat {random.randint(1, 500)}, {random.choice(cities)}"
        cursor.execute("INSERT INTO patients (name, age, gender, contact, address) VALUES (?, ?, ?, ?, ?)", 
                       (name, age, gender, contact, address))

    conn.commit()
    conn.close()
    print("Database populated with 50+ records successfully!")

if __name__ == '__main__':
    populate()
