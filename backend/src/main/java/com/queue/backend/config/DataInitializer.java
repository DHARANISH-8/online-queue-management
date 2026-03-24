package com.queue.backend.config;

import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Configuration
public class DataInitializer {

    @Value("${SEED_ADMIN_PASSWORD}")
    private String seedAdminPassword;

    @Value("${SEED_DOCTOR_PASSWORD}")
    private String seedDoctorPassword;

    @Bean
    CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin if not exists
            if (!userRepository.existsByEmail("admin@qflow.com")) {
                User admin = new User("System Admin", "admin@qflow.com", "1234567890", "ADMIN");
                admin.setPassword(passwordEncoder.encode(seedAdminPassword));
                userRepository.save(admin);
                System.out.println("Admin user seeded.");
            }

            // Seed Doctor Members by specialty (Tamil male/female names)
            System.out.println("Checking for doctor members to seed...");
            for (DoctorSeed doctor : doctorsToSeed()) {
                seedDoctor(userRepository, passwordEncoder, doctor);
            }
            assignFallbackSpecialtyToExistingDoctors(userRepository);
            System.out.println("Seeding process completed.");
        };
    }

    private void seedDoctor(UserRepository userRepository, PasswordEncoder passwordEncoder, DoctorSeed doctorSeed) {
        Optional<User> existing = userRepository.findByEmail(doctorSeed.email());
        if (existing.isPresent()) {
            User doctor = existing.get();
            boolean updated = false;
            if (!"DOCTOR".equalsIgnoreCase(doctor.getRole())) {
                doctor.setRole("DOCTOR");
                updated = true;
            }
            if (doctor.getSpecialty() == null || doctor.getSpecialty().isBlank()) {
                doctor.setSpecialty(doctorSeed.specialty());
                updated = true;
            }
            if (updated) {
                userRepository.save(doctor);
                System.out.println("Doctor member updated: " + doctorSeed.name());
            }
            return;
        }

        User doctor = new User(doctorSeed.name(), doctorSeed.email(), doctorSeed.phone(), "DOCTOR");
        doctor.setSpecialty(doctorSeed.specialty());
        doctor.setPassword(passwordEncoder.encode(seedDoctorPassword));
        userRepository.save(doctor);
        System.out.println("Doctor member seeded: " + doctorSeed.name() + " (" + doctorSeed.specialty() + ")");
    }

    private List<DoctorSeed> doctorsToSeed() {
        return List.of(
                new DoctorSeed("Dr Arun Kumar", "arun.kumar.general@qflow.com", "9000001001", "General Medicine"),
                new DoctorSeed("Dr Kavitha R", "kavitha.general@qflow.com", "9000001002", "General Medicine"),
                new DoctorSeed("Dr Pradeep S", "pradeep.general@qflow.com", "9000001003", "General Medicine"),
                new DoctorSeed("Dr Nithya M", "nithya.general@qflow.com", "9000001004", "General Medicine"),
                new DoctorSeed("Dr Senthil V", "senthil.general@qflow.com", "9000001005", "General Medicine"),

                new DoctorSeed("Dr Prakash V", "prakash.cardiology@qflow.com", "9000001006", "Cardiology"),
                new DoctorSeed("Dr Meena S", "meena.cardiology@qflow.com", "9000001007", "Cardiology"),
                new DoctorSeed("Dr Dinesh K", "dinesh.cardiology@qflow.com", "9000001008", "Cardiology"),
                new DoctorSeed("Dr Priya R", "priya.cardiology@qflow.com", "9000001009", "Cardiology"),
                new DoctorSeed("Dr Karthi B", "karthi.cardiology@qflow.com", "9000001010", "Cardiology"),

                new DoctorSeed("Dr Suresh B", "suresh.neuro@qflow.com", "9000001011", "Neurology"),
                new DoctorSeed("Dr Nivetha K", "nivetha.neuro@qflow.com", "9000001012", "Neurology"),
                new DoctorSeed("Dr Ganesan R", "ganesan.neuro@qflow.com", "9000001013", "Neurology"),
                new DoctorSeed("Dr Aarthi P", "aarthi.neuro@qflow.com", "9000001014", "Neurology"),
                new DoctorSeed("Dr Muthukumar T", "muthukumar.neuro@qflow.com", "9000001015", "Neurology"),

                new DoctorSeed("Dr Rajasekar P", "rajasekar.ortho@qflow.com", "9000001016", "Orthopedics"),
                new DoctorSeed("Dr Priyanka D", "priyanka.ortho@qflow.com", "9000001017", "Orthopedics"),
                new DoctorSeed("Dr Balaji N", "balaji.ortho@qflow.com", "9000001018", "Orthopedics"),
                new DoctorSeed("Dr Gayathri S", "gayathri.ortho@qflow.com", "9000001019", "Orthopedics"),
                new DoctorSeed("Dr Siva Kumar", "sivakumar.ortho@qflow.com", "9000001020", "Orthopedics"),

                new DoctorSeed("Dr Elango M", "elango.pediatrics@qflow.com", "9000001021", "Pediatrics"),
                new DoctorSeed("Dr Keerthana L", "keerthana.pediatrics@qflow.com", "9000001022", "Pediatrics"),
                new DoctorSeed("Dr Manoj C", "manoj.pediatrics@qflow.com", "9000001023", "Pediatrics"),
                new DoctorSeed("Dr Hema V", "hema.pediatrics@qflow.com", "9000001024", "Pediatrics"),
                new DoctorSeed("Dr Dhanush R", "dhanush.pediatrics@qflow.com", "9000001025", "Pediatrics"),

                new DoctorSeed("Dr Karthik N", "karthik.derma@qflow.com", "9000001026", "Dermatology"),
                new DoctorSeed("Dr Anitha J", "anitha.derma@qflow.com", "9000001027", "Dermatology"),
                new DoctorSeed("Dr Ramesh P", "ramesh.derma@qflow.com", "9000001028", "Dermatology"),
                new DoctorSeed("Dr Deepika M", "deepika.derma@qflow.com", "9000001029", "Dermatology"),
                new DoctorSeed("Dr Naren K", "naren.derma@qflow.com", "9000001030", "Dermatology"),

                new DoctorSeed("Dr Saravanan T", "saravanan.ent@qflow.com", "9000001031", "ENT"),
                new DoctorSeed("Dr Divya M", "divya.ent@qflow.com", "9000001032", "ENT"),
                new DoctorSeed("Dr Vignesh R", "vignesh.ent@qflow.com", "9000001033", "ENT"),
                new DoctorSeed("Dr Swathi P", "swathi.ent@qflow.com", "9000001034", "ENT"),
                new DoctorSeed("Dr Arunmozhi K", "arunmozhi.ent@qflow.com", "9000001035", "ENT"),

                new DoctorSeed("Dr Gokul R", "gokul.ophthal@qflow.com", "9000001036", "Ophthalmology"),
                new DoctorSeed("Dr Revathi A", "revathi.ophthal@qflow.com", "9000001037", "Ophthalmology"),
                new DoctorSeed("Dr Sathish M", "sathish.ophthal@qflow.com", "9000001038", "Ophthalmology"),
                new DoctorSeed("Dr Nandhini V", "nandhini.ophthal@qflow.com", "9000001039", "Ophthalmology"),
                new DoctorSeed("Dr Bharath S", "bharath.ophthal@qflow.com", "9000001040", "Ophthalmology"),

                new DoctorSeed("Dr Manikandan S", "manikandan.gyn@qflow.com", "9000001041", "Gynecology"),
                new DoctorSeed("Dr Janani V", "janani.gyn@qflow.com", "9000001042", "Gynecology"),
                new DoctorSeed("Dr Prasanna K", "prasanna.gyn@qflow.com", "9000001043", "Gynecology"),
                new DoctorSeed("Dr Ramya N", "ramya.gyn@qflow.com", "9000001044", "Gynecology"),
                new DoctorSeed("Dr Thiru M", "thiru.gyn@qflow.com", "9000001045", "Gynecology"),

                new DoctorSeed("Dr Harish K", "harish.dent@qflow.com", "9000001046", "Dentistry"),
                new DoctorSeed("Dr Vaishnavi P", "vaishnavi.dent@qflow.com", "9000001047", "Dentistry"),
                new DoctorSeed("Dr Lokesh R", "lokesh.dent@qflow.com", "9000001048", "Dentistry"),
                new DoctorSeed("Dr Nisha B", "nisha.dent@qflow.com", "9000001049", "Dentistry"),
                new DoctorSeed("Dr Kavin S", "kavin.dent@qflow.com", "9000001050", "Dentistry"));
    }

    private void assignFallbackSpecialtyToExistingDoctors(UserRepository userRepository) {
        List<User> doctors = userRepository.findByRole("DOCTOR");
        for (User doctor : doctors) {
            if (doctor.getSpecialty() == null || doctor.getSpecialty().isBlank()) {
                doctor.setSpecialty("General Medicine");
                userRepository.save(doctor);
            }
        }
    }

    record DoctorSeed(String name, String email, String phone, String specialty) {
    }
}
