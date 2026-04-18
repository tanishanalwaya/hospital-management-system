// Toast System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// System Clock
function updateClock() {

    const clock = document.getElementById('system-clock');
    if(clock) {
        const now = new Date();
        clock.innerText = now.toLocaleTimeString();
    }
}
setInterval(updateClock, 1000);

function logEvent(title, detail) {
    const log = document.getElementById('activity-log');
    if(!log) return; // Prevent crash if log element is missing
    const item = document.createElement('div');
    item.className = 'activity-item animate-up';
    item.innerHTML = `
        <div class="activity-icon"><i class="fas fa-satellite-dish" style="color: #22c55e;"></i></div>
        <div>
            <p style="font-weight: 700;">${title}</p>
            <p style="color: var(--text-muted); font-size: 0.7rem;">${detail}</p>
        </div>
    `;
    log.prepend(item);
    if(log.children.length > 5) log.lastElementChild.remove();
}



// Theme Management
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const icon = document.querySelector('.theme-toggle i');
    
    if(currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        icon.className = 'fas fa-moon';
        showToast('Switching to Solar Interface');
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.className = 'fas fa-sun';
        showToast('Activating Deep-Space Logic');
    }
}

// Global State
let dashboardChart = null;

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    loadView('dashboard', document.querySelector('.nav-item.active'));
});

// View Routing
async function loadView(view, element) {
    // Nav state management
    if(element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    const contentArea = document.getElementById('content-area');
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');
    
    if(!contentArea) return;

    // Transition effect
    contentArea.style.opacity = '0';
    contentArea.style.transform = 'translateY(10px)';
    
    setTimeout(async () => {
        contentArea.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height: 300px;">
                <i class="fas fa-circle-notch fa-spin fa-2x" style="color: var(--primary);"></i>
            </div>
        `;
        
        try {
            switch(view) {
                case 'dashboard':
                    viewTitle.innerText = 'Dashboard Overview';
                    viewSubtitle.innerText = 'Real-time hospital operations overview';
                    await renderDashboard(contentArea);
                    break;
                case 'patients':
                    viewTitle.innerText = 'Patient Directory';
                    viewSubtitle.innerText = 'Manage centralized electronic health records';
                    await renderPatients(contentArea);
                    break;
                case 'doctors':
                    viewTitle.innerText = 'Medical Staff';
                    viewSubtitle.innerText = 'Specialist panel and performance metrics';
                    await renderDoctors(contentArea);
                    break;
                case 'appointments':
                    viewTitle.innerText = 'Appointments';
                    viewSubtitle.innerText = 'Synchronized consultation scheduling';
                    await renderAppointments(contentArea);
                    break;
            }
        } catch (err) {
            contentArea.innerHTML = `<div style="color:red; padding: 20px;">Error loading view: ${err.message}</div>`;
        }

        contentArea.style.opacity = '1';
        contentArea.style.transform = 'translateY(0)';
    }, 300);
}



async function renderDashboard(container) {
    const stats = await fetch('/api/dashboard/stats').then(res => res.json());
    const appointments = await fetch('/api/appointments').then(res => res.json());

    container.innerHTML = `
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fas fa-bed"></i></div>
                <span class="stat-label">Total Patients</span>
                <span class="stat-number">${stats.patients}</span>
                <span class="stat-change up"><i class="fas fa-arrow-up"></i> 12% this month</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon teal"><i class="fas fa-user-md"></i></div>
                <span class="stat-label">Active Doctors</span>
                <span class="stat-number">${stats.doctors}</span>
                <span class="stat-change neutral"><i class="fas fa-minus"></i> Stable</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon amber"><i class="fas fa-calendar-check"></i></div>
                <span class="stat-label">Appointments</span>
                <span class="stat-number">${stats.appointments}</span>
                <span class="stat-change up"><i class="fas fa-arrow-up"></i> 8 today</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon rose"><i class="fas fa-procedures"></i></div>
                <span class="stat-label">Beds Occupied</span>
                <span class="stat-number">${Math.floor(stats.patients * 0.35)}</span>
                <span class="stat-change down"><i class="fas fa-arrow-down"></i> 3% freed</span>
            </div>
        </div>

        <div class="chart-grid">
            <div class="card">
                <div class="card-title"><i class="fas fa-chart-line"></i> Weekly Appointment Trends</div>
                <canvas id="mainChart" height="220"></canvas>
            </div>
            <div class="card">
                <div class="card-title"><i class="fas fa-chart-pie"></i> Department Distribution</div>
                <canvas id="pieChart" height="220"></canvas>
            </div>
        </div>

        <div class="chart-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="card">
                <div class="card-title" style="justify-content: space-between;">
                    <span><i class="fas fa-clock-rotate-left"></i> Live Intelligence Feed</span>
                    <span class="badge badge-pending">LIVE SYNC</span>
                </div>
                <div id="activity-log" style="display: flex; flex-direction: column; gap: 15px; min-height: 250px;">
                    <div style="border-left: 2px solid var(--primary); padding-left: 15px; position: relative;">
                        <p style="font-size: 0.85rem; font-weight: 700;">System Initialized</p>
                        <p style="font-size: 0.75rem; color: var(--text-muted);">Database connected and sync active.</p>
                        <span style="font-size: 0.65rem; color: var(--primary); font-weight: 800; text-transform: uppercase;">A moment ago</span>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-title"><i class="fas fa-calendar-alt"></i> Recent Consultations</div>
                <div class="table-container" style="border:none; box-shadow:none;">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appointments.slice(0, 5).map(a => `
                                <tr>
                                    <td style="font-weight: 700;">${a.patient_name}</td>
                                    <td>${a.doctor_name}</td>
                                    <td style="font-size: 0.75rem; color: var(--text-muted);">${new Date(a.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    setTimeout(initCharts, 100);
}

// Advanced Feature: Global Search Intelligence
function handleGlobalSearch(query) {
    const q = query.toLowerCase();
    const activeView = document.querySelector('.nav-item.active').innerText.toLowerCase();
    
    if(activeView.includes('patient')) {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(q) ? '' : 'none';
        });
    } else if(activeView.includes('staff')) {
        const cards = document.querySelectorAll('.doctor-profile-card');
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(q) ? '' : 'none';
        });
    }
}

// Advanced Feature: Automated Medical Report
function generatePatientReport(id) {
    showToast('Initializing Medical Intelligence Report Engine...');
    setTimeout(() => {
        showToast('Processing Patient ID #PAT-' + id.toString().padStart(4, '0'));
        setTimeout(() => {
            showToast('Report Generated Successfully. (Simulated Download)', 'success');
        }, 1500);
    }, 1000);
}



async function initCharts() {
    const data = await fetch('/api/dashboard/chart').then(res => res.json());
    
    const trendCtx = document.getElementById('mainChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: data.trend.map(i => i.day),
            datasets: [{
                label: 'Global Syncs',
                data: data.trend.map(i => i.count),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#6366f1'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { 
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, 
                x: { grid: { display: false } } 
            }
        }
    });

    new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: data.sectors.map(i => i.label),
            datasets: [{
                data: data.sectors.map(i => i.value),
                backgroundColor: ['#6366f1', '#a855f7', '#22d3ee', '#f87171', '#34d399', '#fbbf24'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } },
            cutout: '75%'
        }
    });
}


async function renderPatients(container) {
    const patients = await fetch('/api/patients').then(res => res.json());
    
    container.innerHTML = `
        <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <p style="color: var(--text-muted); font-weight: 600;">Total Records: ${patients.length}</p>
            <button class="btn btn-primary" onclick="showAddPatientModal()">+ Register Patient</button>
        </div>
        <div class="table-container animate">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Biological Sex</th>
                        <th>Contact Axis</th>
                        <th>Global ID</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${patients.map(p => `
                        <tr>
                            <td style="font-weight: 700;">${p.name}</td>
                            <td>${p.age}</td>
                            <td>${p.gender}</td>
                            <td>${p.contact}</td>
                            <td>#PAT-${p.id.toString().padStart(4, '0')}</td>
                            <td>
                                <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.7rem;" onclick="generatePatientReport(${p.id})">
                                    <i class="fas fa-file-medical"></i> Report
                                </button>
                            </td>

                        </tr>
                    `).join('') || '<tr><td colspan="6" style="text-align:center;">No records in system</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

async function renderDoctors(container) {
    const doctors = await fetch('/api/doctors').then(res => res.json());
    
    const specColors = {
        'Cardiologist': '#e11d48', 'Neurologist': '#7c3aed', 'Pediatrician': '#0d9488',
        'Orthopedic': '#d97706', 'Ophthalmology': '#2563eb', 'Dermatology': '#db2777',
        'Oncologist': '#dc2626', 'Gynecologist': '#c026d3', 'ENT Specialist': '#059669',
        'Gastroenterology': '#ea580c', 'Neurology': '#7c3aed', 'Cardiology': '#e11d48',
        'Psychiatrist': '#6366f1', 'Urologist': '#0891b2', 'Pulmonologist': '#16a34a'
    };

    container.innerHTML = `
        <div class="stats-grid animate-up">
            ${doctors.map((d, i) => {
                const color = specColors[d.specialization] || '#4f46e5';
                const exp = 5 + (d.id % 20);
                const avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(d.name) + '&background=' + color.replace('#','') + '&color=fff&size=128&font-size=0.4&bold=true&rounded=true';
                return `
                <div class="doctor-profile-card">
                    <img src="${avatarUrl}" alt="${d.name}" style="width: 90px; height: 90px; border-radius: 50%; margin: 0 auto 16px; display: block; border: 3px solid ${color}20; box-shadow: 0 8px 24px ${color}20;">
                    <h3 style="margin-bottom: 4px; font-weight: 700; font-size: 1.05rem;">${d.name}</h3>
                    <span style="display: inline-block; background: ${color}12; color: ${color}; padding: 4px 12px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">${d.specialization}</span>
                    <div style="display: flex; justify-content: center; gap: 24px; padding: 12px 0; border-top: 1px solid var(--border); margin-top: 4px;">
                        <div style="text-align: center;">
                            <p style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">ID</p>
                            <p style="font-weight: 800; font-size: 0.85rem;">#DOC-${d.id.toString().padStart(3, '0')}</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">EXP</p>
                            <p style="font-weight: 800; font-size: 0.85rem;">${exp} Yrs</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">RATING</p>
                            <p style="font-weight: 800; font-size: 0.85rem; color: #d97706;">★ 4.${5 + (d.id % 5)}</p>
                        </div>
                    </div>
                    <button class="btn btn-outline" style="width: 100%; margin-top: 14px; justify-content: center; font-size: 0.8rem;" onclick="showDoctorBio(${JSON.stringify(d).replace(/"/g, '&quot;')})"><i class="fas fa-id-badge"></i> View Profile</button>
                </div>
            `}).join('')}
        </div>
    `;
}


function showDoctorBio(doctor) {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    document.getElementById('modal-content').innerHTML = `
        <div class="doctor-bio-modal animate-up">
            <div style="width: 200px;">
                <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%); border-radius: 30px; display:flex; justify-content:center; align-items:center; margin-bottom: 20px;">
                    <i class="fas fa-user-md fa-5x" style="color: var(--primary);"></i>
                </div>
                <div class="bio-stat-box">
                    <p style="font-size: 0.7rem; font-weight: 800; color: var(--primary);">SUCCESS RATE</p>
                    <p style="font-size: 1.5rem; font-weight: 900;">99.4%</p>
                </div>
            </div>
            <div style="flex: 1;">
                <h2 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 5px;">${doctor.name}</h2>
                <p style="color: var(--primary); font-weight: 800; letter-spacing: 2px;">SENIOR CONSULTANT | ${doctor.specialization.toUpperCase()}</p>
                
                <div style="margin-top: 25px;">
                    <h4 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">CORE COMPETENCIES</h4>
                    <div class="bio-pills">
                        <span class="pill">Robotic Surgery</span>
                        <span class="pill">Neural Mapping</span>
                        <span class="pill">Genetic Analysis</span>
                        <span class="pill">CRISPR Editing</span>
                    </div>
                </div>

                <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0;">
                    <p style="font-size: 0.9rem; color: #64748b; line-height: 1.6;">
                        ${doctor.name} is a globally recognized pioneer in ${doctor.specialization}. 
                        With over 12 years of experience in synchronized medical intelligence, they have 
                        managed over 4,000+ complex cases with a near-perfect efficiency rating.
                    </p>
                </div>

                <div style="display: flex; gap: 15px; margin-top: 30px;">
                    <button class="btn btn-primary" style="flex: 1;" onclick="closeModal()">Close Intelligence Feed</button>
                    <button class="btn" style="background: #f1f5f9;" onclick="showToast('Secure Comms Established')"><i class="fas fa-comment-medical"></i> Secure Message</button>
                </div>
            </div>
        </div>
    `;
}



async function renderAppointments(container) {
    const appointments = await fetch('/api/appointments').then(res => res.json());
    
    container.innerHTML = `
        <div style="margin-bottom: 2rem; display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" onclick="showAddAppointmentModal()">+ New Appointment</button>
        </div>
        <div class="table-container animate">
            <table>
                <thead>
                    <tr>
                        <th>Ref Code</th>
                        <th>Patient Entry</th>
                        <th>Consultant</th>
                        <th>Time Axis</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointments.map(a => `
                        <tr>
                            <td style="color: var(--text-muted); font-size: 0.8rem;">REF-${a.id}</td>
                            <td style="font-weight: 700;">${a.patient_name}</td>
                            <td>${a.doctor_name}</td>
                            <td>${new Date(a.appointment_date).toLocaleString()}</td>
                            <td><span class="badge badge-scheduled">VERIFIED</span></td>
                        </tr>
                    `).join('') || '<tr><td colspan="5" style="text-align:center;">Queue is empty</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

// MODALS
function showAddPatientModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    document.getElementById('modal-content').innerHTML = `
        <h2 style="margin-bottom: 2rem; font-weight: 800;">Patient Onboarding</h2>
        <form id="add-patient-form">
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: block;">PATIENT FULL NAME</label>
                <input type="text" name="name" style="width:100%; padding: 15px; border-radius: 12px; border:none;" placeholder="John Doe" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: block;">AGE</label>
                    <input type="number" name="age" style="width:100%; padding: 15px; border-radius: 12px; border:none;" required>
                </div>
                <div class="form-group">
                    <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: block;">GENDER</label>
                    <select name="gender" style="width:100%; padding: 15px; border-radius: 12px; border:none;">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: block;">CONTACT NUMBER</label>
                <input type="text" name="contact" style="width:100%; padding: 15px; border-radius: 12px; border:none;" required>
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: block;">RESIDENTIAL ADDRESS</label>
                <textarea name="address" style="width:100%; padding: 15px; border-radius: 12px; border:none; resize: none;" rows="2" placeholder="Street, City, Zip" required></textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn" style="background: #f1f5f9;" onclick="closeModal()">Dismiss</button>
                <button type="submit" class="btn btn-primary" style="padding: 15px 30px;">Initialize Record</button>
            </div>
        </form>

    `;

        document.getElementById('add-patient-form').onsubmit = async (e) => {
            e.preventDefault();
            try {
                const data = Object.fromEntries(new FormData(e.target).entries());
                const res = await fetch('/api/patients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if(res.ok) {
                    showToast('Patient record initialized successfully');
                    logEvent('Patient Added', data.name + ' registered');
                    closeModal();
                    loadView('patients', document.querySelector('.nav-item[onclick*="patients"]'));
                } else {
                    const err = await res.json();
                    showToast('Failed to save record: ' + (err.message || 'Server Error'), 'error');
                }
            } catch (error) {
                showToast('Network error: ' + error.message, 'error');
            }
        };

}

async function showAddAppointmentModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    const [patients, doctors] = await Promise.all([
        fetch('/api/patients').then(res => res.json()),
        fetch('/api/doctors').then(res => res.json())
    ]);

    document.getElementById('modal-content').innerHTML = `
        <h2 style="margin-bottom: 2rem; font-weight: 800;">Schedule Consultation</h2>
        <form id="add-appointment-form">
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: block;">SELECT PATIENT</label>
                <select name="patient_id" style="width:100%; padding: 15px; border-radius: 12px; border:none;" required>
                    ${patients.map(p => `<option value="${p.id}">${p.name} (#PAT-${p.id})</option>`).join('')}
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: block;">ASSIGN DOCTOR</label>
                <select name="doctor_id" style="width:100%; padding: 15px; border-radius: 12px; border:none;" required>
                    ${doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialization}</option>`).join('')}
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: block;">DATE & TIME</label>
                <input type="datetime-local" name="date" style="width:100%; padding: 15px; border-radius: 12px; border:none;" required>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn" style="background: #f1f5f9;" onclick="closeModal()">Dismiss</button>
                <button type="submit" class="btn btn-primary" style="padding: 15px 30px;">Confirm Schedule</button>
            </div>
        </form>
    `;

    document.getElementById('add-appointment-form').onsubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            showToast('Consultation scheduled successfully');
            logEvent('Event Scheduled', 'Sync with Node #04');
            closeModal();
            loadView('appointments', document.querySelector('.nav-item[onclick*="appointments"]'));
        }
    };
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

