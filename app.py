from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

# Database connection helper
def get_db_connection():
    conn = sqlite3.connect('hospital.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')   

# API Endpoints
@app.route('/api/patients', methods=['GET', 'POST'])
def handle_patients():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json
        conn.execute('INSERT INTO patients (name, age, gender, contact, address) VALUES (?, ?, ?, ?, ?)',
                     (data['name'], data['age'], data['gender'], data['contact'], data['address']))
        conn.commit()
        conn.close()
        return jsonify({'status': 'success'}), 201
    
    patients = conn.execute('SELECT * FROM patients').fetchall()
    conn.close()
    return jsonify([dict(row) for row in patients])

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    conn = get_db_connection()
    doctors = conn.execute('SELECT * FROM doctors').fetchall()
    conn.close()
    return jsonify([dict(row) for row in doctors])

@app.route('/api/appointments', methods=['GET', 'POST'])
def handle_appointments():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json
        conn.execute('INSERT INTO appointments (patient_id, doctor_id, appointment_date, status) VALUES (?, ?, ?, ?)',
                     (data['patient_id'], data['doctor_id'], data['date'], 'Scheduled'))
        conn.commit()
        conn.close()
        return jsonify({'status': 'success'}), 201
    
    query = '''
    SELECT a.id, p.name as patient_name, d.name as doctor_name, a.appointment_date, a.status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    ORDER BY a.appointment_date DESC
    '''
    appointments = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(row) for row in appointments])

@app.route('/api/dashboard/stats')
def get_stats():
    conn = get_db_connection()
    patient_count = conn.execute('SELECT COUNT(*) FROM patients').fetchone()[0]
    doctor_count = conn.execute('SELECT COUNT(*) FROM doctors').fetchone()[0]
    appointment_count = conn.execute('SELECT COUNT(*) FROM appointments').fetchone()[0]
    conn.close()
    return jsonify({
        'patients': patient_count,
        'doctors': doctor_count,
        'appointments': appointment_count
    })

@app.route('/api/dashboard/chart')
def get_chart_data():
    conn = get_db_connection()
    # Get last 7 days trend
    query = '''
    SELECT date(appointment_date) as day, COUNT(*) as count 
    FROM appointments 
    GROUP BY day 
    ORDER BY day DESC 
    LIMIT 7
    '''
    trend = conn.execute(query).fetchall()
    
    # Get department distribution
    query_dept = '''
    SELECT specialization as label, COUNT(*) as value 
    FROM doctors d 
    JOIN appointments a ON d.id = a.doctor_id 
    GROUP BY specialization
    '''
    sectors = conn.execute(query_dept).fetchall()
    
    conn.close()
    return jsonify({
        'trend': [dict(row) for row in reversed(trend)],
        'sectors': [dict(row) for row in sectors]
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)           
