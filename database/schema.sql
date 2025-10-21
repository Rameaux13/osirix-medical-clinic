-- Schema de base de données pour OSIRIX CLINIQUE MÉDICAL
-- Fonctionnement 24h/24 - 7j/7 avec carnet médical virtuel
-- CREATE DATABASE osirix_medical;

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table de configuration des horaires de la clinique (24h/7j mais configurable)
CREATE TABLE clinic_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER, -- 1=Lundi, 2=Mardi, ..., 7=Dimanche, 0=Tous les jours
    start_time TIME DEFAULT '00:00',
    end_time TIME DEFAULT '23:59',
    slot_duration INTEGER DEFAULT 30, -- durée en minutes
    max_appointments_per_slot INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des jours de fermeture exceptionnelle
CREATE TABLE clinic_closures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    closure_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(255),
    is_full_day BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des utilisateurs (patients)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    social_security_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des médecins
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    speciality VARCHAR(255),
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des administrateurs
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions TEXT[], -- Array des permissions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des créneaux de rendez-vous générés automatiquement
CREATE TABLE appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_appointments INTEGER DEFAULT 1,
    current_appointments INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, start_time)
);

-- Table des types de consultation/spécialités
CREATE TABLE consultation_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des rendez-vous
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    consultation_type_id UUID REFERENCES consultation_types(id) ON DELETE SET NULL,
    slot_id UUID REFERENCES appointment_slots(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, no_show
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
    amount DECIMAL(10,2) DEFAULT 50.00,
    urgency_level VARCHAR(20) DEFAULT 'normal', -- normal, urgent, emergency
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des fiches patients (remplie lors de la prise de RDV)
CREATE TABLE patient_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chief_complaint TEXT, -- Motif de consultation
    symptoms TEXT,
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    pain_location VARCHAR(255),
    symptoms_duration VARCHAR(100),
    medical_history TEXT,
    current_medications TEXT,
    allergies TEXT,
    family_medical_history TEXT,
    lifestyle_info TEXT, -- tabac, alcool, sport, etc.
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des consultations (ce que le médecin remplit)
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    consultation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vital_signs JSONB, -- tension, poids, température, etc.
    physical_examination TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    recommendations TEXT,
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_date DATE,
    consultation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    prescription_date DATE DEFAULT CURRENT_DATE,
    medications JSONB, -- [{name, dosage, frequency, duration}, ...]
    instructions TEXT,
    pharmacy_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des analyses/examens prescrits
CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    exam_type VARCHAR(255), -- prise de sang, radio, scanner, etc.
    instructions TEXT,
    priority VARCHAR(20) DEFAULT 'normal', -- normal, urgent, stat
    status VARCHAR(50) DEFAULT 'ordered', -- ordered, completed, cancelled
    results TEXT,
    results_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id),
    user_id UUID REFERENCES users(id),
    stripe_payment_intent_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) DEFAULT 'pending', -- pending, succeeded, failed, cancelled, refunded
    payment_method VARCHAR(100),
    transaction_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table du carnet médical numérique (ce que voit le patient)
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    record_type VARCHAR(100) NOT NULL, -- consultation, prescription, lab_result, document, etc.
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_url VARCHAR(500), -- URL du fichier uploadé
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(100),
    record_date DATE DEFAULT CURRENT_DATE,
    is_visible_to_patient BOOLEAN DEFAULT true,
    tags VARCHAR(255)[], -- pour catégoriser les documents
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes de carnet médical physique
CREATE TABLE physical_record_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shipping_address TEXT NOT NULL,
    contact_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'ordered', -- ordered, processing, printed, shipped, delivered
    order_date DATE DEFAULT CURRENT_DATE,
    shipping_date DATE,
    tracking_number VARCHAR(255),
    shipping_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- appointment, prescription, lab_result, general
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tokens de session/refresh
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_appointments_consultation_type ON appointments(consultation_type_id);
CREATE INDEX idx_consultation_types_active ON consultation_types(is_active);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointment_slots_date ON appointment_slots(date);
CREATE INDEX idx_appointment_slots_available ON appointment_slots(is_available);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_forms_updated_at BEFORE UPDATE ON patient_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_physical_record_orders_updated_at BEFORE UPDATE ON physical_record_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configuration des horaires 24h/7j par défaut
INSERT INTO clinic_schedule (day_of_week, start_time, end_time, slot_duration, max_appointments_per_slot) VALUES
(0, '00:00', '23:59', 30, 1); -- 0 = tous les jours, créneaux de 30 min

-- Fonction pour générer automatiquement les créneaux
CREATE OR REPLACE FUNCTION generate_appointment_slots(
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE + INTERVAL '3 months'
)
RETURNS INTEGER AS $$
DECLARE
    current_date DATE;
    current_time TIME;
    schedule_row RECORD;
    slots_created INTEGER := 0;
BEGIN
    current_date := start_date;
    
    WHILE current_date <= end_date LOOP
        -- Vérifier si ce jour n'est pas fermé exceptionnellement
        IF NOT EXISTS (
            SELECT 1 FROM clinic_closures 
            WHERE closure_date = current_date 
            AND is_full_day = true
        ) THEN
            -- Récupérer la configuration pour ce jour
            FOR schedule_row IN 
                SELECT * FROM clinic_schedule 
                WHERE is_active = true 
                AND (day_of_week = 0 OR day_of_week = EXTRACT(DOW FROM current_date))
            LOOP
                current_time := schedule_row.start_time;
                
                WHILE current_time < schedule_row.end_time LOOP
                    -- Insérer le créneau s'il n'existe pas déjà
                    INSERT INTO appointment_slots (date, start_time, end_time, max_appointments)
                    VALUES (
                        current_date,
                        current_time,
                        current_time + (schedule_row.slot_duration || ' minutes')::INTERVAL,
                        schedule_row.max_appointments_per_slot
                    )
                    ON CONFLICT (date, start_time) DO NOTHING;
                    
                    slots_created := slots_created + 1;
                    current_time := current_time + (schedule_row.slot_duration || ' minutes')::INTERVAL;
                END LOOP;
            END LOOP;
        END IF;
        
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
    
    RETURN slots_created;
END;
$$ LANGUAGE plpgsql;

-- Générer les créneaux pour les 3 prochains mois
SELECT generate_appointment_slots();

-- Insertion des types de consultation disponibles
INSERT INTO consultation_types (name, description) VALUES
('Pédiatrie', 'Consultation spécialisée pour les enfants et adolescents'),
('Neurologie', 'Consultation pour les troubles du système nerveux'),
('Urologie', 'Consultation pour les troubles urologiques'),
('Andrologie', 'Consultation spécialisée en santé masculine'),
('Sexologie', 'Consultation en santé sexuelle et reproductive'),
('Endoscopie', 'Examens endoscopiques et urodynamiques'),
('Urodynamique', 'Tests de fonction vésicale et urétrale'),
('Psychiatrie', 'Consultation en santé mentale'),
('Gastroentérologie', 'Consultation pour les troubles digestifs'),
('Rhumatologie', 'Consultation pour les troubles articulaires et musculaires'),
('Cancérologie', 'Consultation oncologique'),
('Urgence', 'Consultation d''urgence'),
('Consultation Générale', 'Consultation de médecine générale');

-- Insertion des données de test

-- Admin par défaut (mot de passe: admin123)
INSERT INTO admins (email, password_hash, first_name, last_name, role, permissions) VALUES
('admin@osirix-medical.com', '$2b$10$rKZHbWJmDFJ5K4eEL6d0O.WGZJzJLnzE8TzKp3Uj4K1Wj0p7QC8gm', 'Admin', 'OSIRIX', 'super_admin', ARRAY['all']);

-- Médecin de test (mot de passe: doctor123)
INSERT INTO doctors (email, password_hash, first_name, last_name, speciality, license_number) VALUES
('dr.martin@osirix-medical.com', '$2b$10$rKZHbWJmDFJ5K4eEL6d0O.WGZJzJLnzE8TzKp3Uj4K1Wj0p7QC8gm', 'Dr. Jean', 'Martin', 'Médecine Générale', 'MG123456'),
('dr.durand@osirix-medical.com', '$2b$10$rKZHbWJmDFJ5K4eEL6d0O.WGZJzJLnzE8TzKp3Uj4K1Wj0p7QC8gm', 'Dr. Marie', 'Durand', 'Cardiologie', 'CA789012');

-- Patient de test (mot de passe: patient123)
INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, gender) VALUES
('patient@test.com', '$2b$10$rKZHbWJmDFJ5K4eEL6d0O.WGZJzJLnzE8TzKp3Uj4K1Wj0p7QC8gm', 'Jean', 'Dupont', '0123456789', '1990-05-15', 'M');