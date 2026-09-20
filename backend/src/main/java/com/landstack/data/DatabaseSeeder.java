package com.landstack.data;

import com.landstack.entity.*;
import com.landstack.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final ParcelRepository parcelRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final FieldVerificationRepository fieldVerificationRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        ensureTenDepartmentsAndServices();

        if (roleRepository.count() > 0) {
            log.info("Core database tables already seeded. Verified 10 statutory departments and services.");
            return;
        }

        log.info("Seeding LandStack SIH 2026 database...");

        // 1. Roles
        Role adminRole = roleRepository.save(Role.builder().name(RoleType.ADMIN).description("System Administrator").build());
        Role supervisorRole = roleRepository.save(Role.builder().name(RoleType.DEPARTMENT_SUPERVISOR).description("Department Supervisor").build());
        Role officerRole = roleRepository.save(Role.builder().name(RoleType.FIELD_OFFICER).description("Field Verification Officer").build());
        Role citizenRole = roleRepository.save(Role.builder().name(RoleType.CITIZEN).description("Citizen Portal User").build());

        // 2. Departments
        Department deptRevenue = departmentRepository.save(Department.builder()
                .name("Revenue & Disaster Management")
                .code("REV-DM")
                .description("Department responsible for land records, patta, mutation, and revenue collection")
                .active(true)
                .build());

        Department deptSurvey = departmentRepository.save(Department.builder()
                .name("Survey & Settlement")
                .code("SRV-SET")
                .description("Cadastral surveys, ULPIN geocoding, and boundary demarcation")
                .active(true)
                .build());

        Department deptReg = departmentRepository.save(Department.builder()
                .name("Registration & Stamp Revenue")
                .code("REG-STAMP")
                .description("Deed registration, encumbrance certificates, and title conveyancing")
                .active(true)
                .build());

        Department deptTown = departmentRepository.save(Department.builder()
                .name("Town & Country Planning")
                .code("TCP-URB")
                .description("Master plan zoning, land-use conversion, and building layout sanction")
                .active(true)
                .build());

        Department deptMunicipal = departmentRepository.save(Department.builder()
                .name("Municipal Administration")
                .code("MUN-CORP")
                .description("Urban local body property taxation, civic utility NOCs, and trade permits")
                .active(true)
                .build());

        // 3. Demo Users (Password: Demo@123)
        String demoPassword = passwordEncoder.encode("Demo@123");

        User adminUser = userRepository.save(User.builder()
                .fullName("Rajesh Sharma")
                .email("admin@landstack.demo")
                .password(demoPassword)
                .mobile("+91 9876543210")
                .role(adminRole)
                .department(deptRevenue)
                .designation("Principal Secretary (Land Governance)")
                .employeeCode("GOV-ADM-001")
                .active(true)
                .build());

        User supervisorUser = userRepository.save(User.builder()
                .fullName("Ananya Deshmukh")
                .email("supervisor@landstack.demo")
                .password(demoPassword)
                .mobile("+91 9845012345")
                .role(supervisorRole)
                .department(deptRevenue)
                .designation("Tahsildar & Revenue Supervisor")
                .employeeCode("REV-SUP-104")
                .active(true)
                .build());

        User officerUser = userRepository.save(User.builder()
                .fullName("Vikramaditya Rao")
                .email("officer@landstack.demo")
                .password(demoPassword)
                .mobile("+91 9711223344")
                .role(officerRole)
                .department(deptRevenue)
                .designation("Senior Cadastral Inspector")
                .employeeCode("REV-FLD-502")
                .active(true)
                .build());

        User citizenUser = userRepository.save(User.builder()
                .fullName("Karthik Subramanian")
                .email("citizen@landstack.demo")
                .password(demoPassword)
                .mobile("+91 9444123890")
                .role(citizenRole)
                .designation("Citizen")
                .active(true)
                .build());

        // Extra supervisor and officer for Town Planning
        User supTown = userRepository.save(User.builder()
                .fullName("Sunita Mehra")
                .email("supervisor.urban@landstack.demo")
                .password(demoPassword)
                .mobile("+91 9811099887")
                .role(supervisorRole)
                .department(deptTown)
                .designation("Town Planning Officer")
                .employeeCode("TCP-SUP-202")
                .active(true)
                .build());

        User offTown = userRepository.save(User.builder()
                .fullName("Arun Kumar")
                .email("officer.urban@landstack.demo")
                .password(demoPassword)
                .mobile("+91 9922334455")
                .role(officerRole)
                .department(deptTown)
                .designation("Zoning Field Surveyor")
                .employeeCode("TCP-FLD-303")
                .active(true)
                .build());

        // 4. Government Services Catalog
        ServiceEntity s1 = serviceRepository.save(ServiceEntity.builder()
                .serviceCode("SRV-LOC-01")
                .serviceName("Land Ownership Certificate (Patta)")
                .description("Official statutory certification confirming undisputed ownership and title of the designated parcel.")
                .department(deptRevenue)
                .requiredDocuments("Registered Sale Deed, Encumbrance Certificate, Latest Property Tax Receipt, Identity Proof")
                .processingDays(7)
                .feeInr(150.0)
                .active(true)
                .build());

        ServiceEntity s2 = serviceRepository.save(ServiceEntity.builder()
                .serviceCode("SRV-EC-02")
                .serviceName("Encumbrance Certificate (EC)")
                .description("Certificate detailing all registered financial liabilities, mortgages, and transactions on the parcel for up to 30 years.")
                .department(deptReg)
                .requiredDocuments("Previous Deed Copy, Survey Sketch, Aadhaar/Voter ID")
                .processingDays(3)
                .feeInr(100.0)
                .active(true)
                .build());

        ServiceEntity s3 = serviceRepository.save(ServiceEntity.builder()
                .serviceCode("SRV-CONV-03")
                .serviceName("Land Conversion (Agricultural to Non-Agricultural)")
                .description("Statutory permission under Section 47A for reclassifying agricultural land into residential or commercial layouts.")
                .department(deptRevenue)
                .requiredDocuments("Patta/Chitta Extract, FMB Sketch, Soil Quality Certificate, Master Plan Zoning Extract")
                .processingDays(21)
                .feeInr(2500.0)
                .active(true)
                .build());

        ServiceEntity s4 = serviceRepository.save(ServiceEntity.builder()
                .serviceCode("SRV-MUT-04")
                .serviceName("Property Mutation & Jamabandi Entry")
                .description("Updating buyer title and ownership records in the state jamabandi revenue registers following sale or inheritance.")
                .department(deptRevenue)
                .requiredDocuments("Registered Transfer Deed, Death Certificate (if inheritance), No-Calamity Declaration")
                .processingDays(14)
                .feeInr(300.0)
                .active(true)
                .build());

        ServiceEntity s5 = serviceRepository.save(ServiceEntity.builder()
                .serviceCode("SRV-BLD-05")
                .serviceName("Building Permission & Layout Sanction")
                .description("Technical appraisal and municipal approval of architectural and structural blueprints adhering to building bylaws.")
                .department(deptTown)
                .requiredDocuments("Approved Site Plan, Structural Engineer Certificate, Soil Investigation Report, Ownership Patta")
                .processingDays(15)
                .feeInr(4500.0)
                .active(true)
                .build());

        ServiceEntity s6 = serviceRepository.save(ServiceEntity.builder()
                .serviceCode("SRV-SURV-06")
                .serviceName("Cadastral Boundary Demarcation & DGPS Survey")
                .description("On-site physical boundary pegging and differential GPS demarcation to resolve neighbor boundary overlaps.")
                .department(deptSurvey)
                .requiredDocuments("Cadastral Field Measurement Book (FMB), Neighbor Consent / Notice, Patta")
                .processingDays(10)
                .feeInr(800.0)
                .active(true)
                .build());

        ServiceEntity s7 = serviceRepository.save(ServiceEntity.builder()
                .serviceCode("SRV-TAX-07")
                .serviceName("Property Tax Assessment & Name Change")
                .description("Apportioning municipal annual ratable value and registering new property owner for local municipal taxes.")
                .department(deptMunicipal)
                .requiredDocuments("Latest Electricity Bill, Sale Deed, Completion Certificate")
                .processingDays(7)
                .feeInr(200.0)
                .active(true)
                .build());

        ServiceEntity s8 = serviceRepository.save(ServiceEntity.builder()
                .serviceCode("SRV-UTIL-08")
                .serviceName("Water & Sewerage Network NOC")
                .description("Civic utility clearance for connecting residential/commercial structures to the municipal trunk water mains.")
                .department(deptMunicipal)
                .requiredDocuments("Plumbing Layout, Sanctioned Building Plan, Property Tax Receipt")
                .processingDays(7)
                .feeInr(500.0)
                .active(true)
                .build());

        // 5. Realistic 22 Cadastral Parcels with Polygons
        List<Parcel> parcels = new ArrayList<>();

        // Helper to generate polygon GeoJSON around a center lat/lng
        // Target demo parcel: 33TNCHN0000123456 in Tambaram, Chennai
        parcels.add(createParcel(
                "33TNCHN0000123456", "124/3B", "A", "Chennai", "Tambaram", "Selaiyur", "600073",
                12.9249, 80.1472, 2.45, 106722.0, "Residential", "Residential Zone (R2)",
                "Private Individual", "Karthik Subramanian", "XXXX-XXXX-4819", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 18500000.0,
                14.2, "Low", "Clear title history with seamless geo-cadastral alignment."
        ));

        parcels.add(createParcel(
                "33TNTAM0000234567", "89/2A", "1", "Chennai", "Tambaram", "Chromepet", "600044",
                12.9516, 80.1462, 1.15, 50094.0, "Commercial", "Commercial Mixed Zone",
                "Private Individual", "Sundaramurthy Ramasamy", "XXXX-XXXX-9102", "Paid", 2025,
                "Registered", "Verified", "Clear Title", 24000000.0,
                22.0, "Low", "Fully compliant zoning, no road-widening reservations."
        ));

        parcels.add(createParcel(
                "33TNTAM0000345678", "15/4C", "2", "Chennai", "Tambaram", "Medavakkam", "600100",
                12.9185, 80.1912, 4.80, 209088.0, "Agricultural", "Wet Agricultural (Nanjai)",
                "Joint Ownership", "Meenakshi & Brothers", "XXXX-XXXX-3341", "Arrears", 2023,
                "Registered", "Pending Verification", "Mortgage Active", 32000000.0,
                58.5, "Moderate", "Mortgage registered with Canara Bank; physical boundary verification pending."
        ));

        parcels.add(createParcel(
                "33TNKAN0000456789", "202/1A", "B", "Kanchipuram", "Sriperumbudur", "Irungattukottai", "602105",
                12.9810, 79.9740, 12.50, 544500.0, "Industrial", "SIPCOT Industrial Estate",
                "Corporate", "Apex Logistics Parks Pvt Ltd", "XXXX-XXXX-1100", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 98000000.0,
                12.0, "Low", "Industrial clearance secured; environmental buffer compliant."
        ));

        parcels.add(createParcel(
                "33TNKAN0000567890", "305/7B", "3", "Kanchipuram", "Walajabad", "Thenneri", "631604",
                12.8250, 79.8150, 6.20, 270072.0, "Agricultural", "Dry Agricultural (Punjai)",
                "Private Individual", "Elangovan Duraisamy", "XXXX-XXXX-7721", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 15500000.0,
                18.0, "Low", "No disputes, water-table recharge zone noted."
        ));

        parcels.add(createParcel(
                "33TNCHN0000678901", "412/1", "A", "Chennai", "Guindy", "Alandur", "600016",
                12.9975, 80.2010, 0.85, 37026.0, "Commercial", "IT Corridor Commercial",
                "Corporate", "CyberSpace Properties LLP", "XXXX-XXXX-8822", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 62000000.0,
                8.0, "Low", "Direct arterial road access with metro rail buffer compliance."
        ));

        parcels.add(createParcel(
                "33TNCHN0000789012", "78/5B", "C", "Chennai", "Sholinganallur", "Perungudi", "600096",
                12.9620, 80.2450, 1.75, 76230.0, "Residential", "High-Density Residential",
                "Private Individual", "Lakshmi Narayanan", "XXXX-XXXX-9911", "Arrears", 2024,
                "Registered", "Disputed", "Court Injunction", 28000000.0,
                78.0, "High", "Civil Court injunction OS-402/2024 active; succession contest."
        ));

        parcels.add(createParcel(
                "33TNTAM0000890123", "99/1", "1A", "Chennai", "Tambaram", "Pallavaram", "600043",
                12.9675, 80.1490, 0.95, 41382.0, "Residential", "Residential Zone (R1)",
                "Private Individual", "Mohammed Ismail", "XXXX-XXXX-2244", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 14000000.0,
                10.5, "Low", "Airport zone height NOC verified."
        ));

        parcels.add(createParcel(
                "33TNCHN0000901234", "160/2", "B", "Chennai", "Mylapore", "Mandaveli", "600028",
                13.0280, 80.2610, 0.45, 19602.0, "Residential", "Heritage Urban Residential",
                "Private Individual", "Subramanian Swaminathan", "XXXX-XXXX-6532", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 45000000.0,
                15.0, "Low", "Prime heritage precinct; title trace clear for 60 years."
        ));

        parcels.add(createParcel(
                "33TNTAM0001012345", "210/4", "D", "Chennai", "Tambaram", "Guduvanchery", "603202",
                12.8420, 80.0610, 3.10, 135036.0, "Residential", "Plotted Development Scheme",
                "Private Individual", "Praveen Venkatesan", "XXXX-XXXX-3388", "Paid", 2025,
                "Registered", "Pending Verification", "Clear Title", 21000000.0,
                32.0, "Moderate", "New layout; subdivision survey marker check recommended."
        ));

        // Bengaluru region parcels
        parcels.add(createParcel(
                "29KABNG0001123456", "54/2", "1", "Bengaluru Urban", "Bengaluru South", "Electronic City", "560100",
                12.8452, 77.6602, 3.50, 152460.0, "Commercial", "Tech Hub Commercial",
                "Corporate", "IndoTech Realty Solutions", "XXXX-XXXX-4411", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 85000000.0,
                9.5, "Low", "KIADB sanctioned tech estate; all NOCs in order."
        ));

        parcels.add(createParcel(
                "29KABNG0001234567", "112/3", "A", "Bengaluru Urban", "Yelahanka", "Jakkur", "560064",
                13.0780, 77.6040, 2.10, 91476.0, "Residential", "Lake-Facing Residential",
                "Private Individual", "Giridhar Hegde", "XXXX-XXXX-7700", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 38000000.0,
                24.0, "Low", "Complies with NGT 75-meter lake buffer norms."
        ));

        parcels.add(createParcel(
                "29KABNG0001345678", "88/1", "C", "Bengaluru Urban", "K.R. Puram", "Whitefield", "560066",
                12.9698, 77.7499, 1.80, 78408.0, "Commercial", "Mixed Retail & Office",
                "Private Individual", "Naveen Reddy", "XXXX-XXXX-5522", "Arrears", 2024,
                "Registered", "Pending Verification", "Mortgage Active", 52000000.0,
                48.0, "Moderate", "BBMP property tax arrears; HDFC mortgage recorded."
        ));

        // Pune / Maharashtra parcels
        parcels.add(createParcel(
                "27MHPUN0001456789", "45/2B", "1", "Pune", "Haveli", "Hinjawadi", "411057",
                18.5913, 73.7389, 4.20, 182952.0, "Commercial", "Special Economic Zone (IT)",
                "Corporate", "Synergy IT Parks Corp", "XXXX-XXXX-9933", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 110000000.0,
                11.0, "Low", "MIDC notified industrial IT layout."
        ));

        parcels.add(createParcel(
                "27MHPUN0001567890", "19/3", "A", "Pune", "Mulshi", "Pirangut", "412115",
                18.5080, 73.6820, 7.50, 326700.0, "Agricultural", "Semi-Hilly Horticulture",
                "Private Individual", "Ganesh Kulkarni", "XXXX-XXXX-8811", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 22000000.0,
                17.5, "Low", "Green zone verified; slope gradient within permissible bounds."
        ));

        // Additional parcels to reach 22
        parcels.add(createParcel(
                "33TNCHN0001678901", "24/1", "A", "Chennai", "Tambaram", "Madambakkam", "600126",
                12.8940, 80.1620, 1.40, 60984.0, "Residential", "Low-Rise Residential",
                "Private Individual", "Sivakumar Natarajan", "XXXX-XXXX-1122", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 16800000.0,
                13.0, "Low", "Clear Patta with digitized FMB boundary."
        ));

        parcels.add(createParcel(
                "33TNCHN0001789012", "67/3", "B", "Chennai", "Ambattur", "Padi", "600050",
                13.0920, 80.1780, 0.70, 30492.0, "Industrial", "Small Scale Industrial Zone",
                "Private Individual", "Chandrasekaran M.", "XXXX-XXXX-5544", "Paid", 2025,
                "Registered", "Verified", "Clear Title", 19500000.0,
                14.0, "Low", "Pollution Control Board Orange category NOC granted."
        ));

        parcels.add(createParcel(
                "33TNTAM0001890123", "144/2", "2", "Chennai", "Tambaram", "Perungalathur", "600063",
                12.9050, 80.0980, 2.05, 89298.0, "Residential", "CMDA Approved Plotted Layout",
                "Private Individual", "Deepa Balasubramanian", "XXXX-XXXX-9988", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 29000000.0,
                9.0, "Low", "Direct highway access with approved CMDA layout 44/2021."
        ));

        parcels.add(createParcel(
                "33TNKAN0001901234", "83/1", "A", "Kanchipuram", "Kanchipuram", "Orikkai", "631502",
                12.8120, 79.7120, 5.10, 222156.0, "Agricultural", "Silk Weaving Village Agro Zone",
                "Private Individual", "Venkatesan Chettiar", "XXXX-XXXX-3355", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 14500000.0,
                16.0, "Low", "Traditional weaving family estate; mutation verified."
        ));

        parcels.add(createParcel(
                "33TNCHN0002012345", "102/4", "C", "Chennai", "Alandur", "Adambakkam", "600088",
                12.9880, 80.2030, 0.55, 23958.0, "Residential", "Urban Residential",
                "Private Individual", "Srinivasan Parthasarathy", "XXXX-XXXX-7766", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 23000000.0,
                12.5, "Low", "Within 500m of Adambakkam MRTS railway station."
        ));

        parcels.add(createParcel(
                "33TNTAM0002123456", "312/1", "1", "Chennai", "Tambaram", "Vandalur", "600048",
                12.8910, 80.0810, 8.40, 365904.0, "Forest / Institutional", "Eco-Sensitive Buffer",
                "Government Held", "Tamil Nadu Forest Department", "GOV-DEP-FOREST", "Exempt", 2026,
                "Registered", "Verified", "Clear Title", 68000000.0,
                21.0, "Low", "Zoological park peripheral buffer zone."
        ));

        parcels.add(createParcel(
                "33TNCHN0002234567", "501/2", "B", "Chennai", "T. Nagar", "Thyagaraya Nagar", "600017",
                13.0410, 80.2330, 0.38, 16552.0, "Commercial", "Prime Commercial Retail",
                "Corporate", "Grand Silks & Jewels Real Estate", "XXXX-XXXX-0099", "Paid", 2026,
                "Registered", "Verified", "Clear Title", 72000000.0,
                11.5, "Low", "Premier retail shopping hub with complete structural clearance."
        ));

        parcelRepository.saveAll(parcels);

        // 6. Pre-seed Sample Service Applications across stages
        Parcel mainDemoParcel = parcels.get(0); // 33TNCHN0000123456
        Parcel secondDemoParcel = parcels.get(1); // 33TNTAM0000234567
        Parcel thirdDemoParcel = parcels.get(2); // 33TNTAM0000345678

        // App 1: An older approved application for demo parcel
        ServiceRequest app1 = ServiceRequest.builder()
                .applicationNumber("LS-2026-00001")
                .citizen(citizenUser)
                .parcel(mainDemoParcel)
                .service(s2) // Encumbrance Certificate
                .department(deptReg)
                .status(ApplicationStatus.COMPLETED)
                .citizenRemarks("Need 15-year non-encumbrance certificate for mortgage redemption.")
                .supervisorRemarks("Verified from SRO Tambaram digitised registry. Title clean.")
                .certificateNumber("CERT-20260215-001")
                .certificateUrl("/api/certificates/LS-2026-00001.pdf")
                .certificateGeneratedAt(LocalDateTime.now().minusDays(10))
                .build();
        app1 = serviceRequestRepository.save(app1);

        documentRepository.save(ApplicationDocument.builder()
                .serviceRequest(app1)
                .documentType("Sale Deed")
                .documentName("SaleDeed_2018_Reg412.pdf")
                .fileSize("2.4 MB")
                .verified(true)
                .aiDocumentClassification("REGISTERED_SALE_DEED_MATCH_99%")
                .build());

        // App 2: An existing pending application under Town Planning
        ServiceRequest app2 = ServiceRequest.builder()
                .applicationNumber("LS-2026-00002")
                .citizen(citizenUser)
                .parcel(secondDemoParcel)
                .service(s5) // Building Permission
                .department(deptTown)
                .supervisor(supTown)
                .fieldOfficer(offTown)
                .status(ApplicationStatus.FIELD_VERIFICATION)
                .citizenRemarks("Applying for commercial G+3 floor office layout approval.")
                .supervisorRemarks("Assigned officer for site setback inspection.")
                .build();
        app2 = serviceRequestRepository.save(app2);

        documentRepository.save(ApplicationDocument.builder()
                .serviceRequest(app2)
                .documentType("Sanctioned Site Plan")
                .documentName("SiteBlueprint_Architect_Sign.pdf")
                .fileSize("4.1 MB")
                .verified(false)
                .aiDocumentClassification("ARCHITECTURAL_BLUEPRINT_VALID")
                .build());

        // App 3: Sample field verification completed
        ServiceRequest app3 = ServiceRequest.builder()
                .applicationNumber("LS-2026-00003")
                .citizen(citizenUser)
                .parcel(thirdDemoParcel)
                .service(s3) // Land Conversion
                .department(deptRevenue)
                .supervisor(supervisorUser)
                .fieldOfficer(officerUser)
                .status(ApplicationStatus.VERIFIED)
                .citizenRemarks("Applying for conversion from Nanjai agro to commercial plotting.")
                .supervisorRemarks("Field inspection completed by officer. Reviewing buffer norms.")
                .fieldOfficerRemarks("Site physically surveyed using DGPS. No encroachment on public irrigation canal.")
                .build();
        app3 = serviceRequestRepository.save(app3);

        FieldVerification fv3 = FieldVerification.builder()
                .serviceRequest(app3)
                .fieldOfficer(officerUser)
                .inspectionDate(LocalDateTime.now().minusDays(1))
                .gpsLatitude(thirdDemoParcel.getLatitude())
                .gpsLongitude(thirdDemoParcel.getLongitude())
                .gpsCoordinatesVerified(true)
                .boundaryMatchesRecord(true)
                .encroachmentDetected(false)
                .remarks("Site physically visited. Stones numbered 1 to 4 intact as per FMB sketch 15/4C.")
                .photoUrls("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800")
                .verificationResult("VERIFIED_COMPLIANT")
                .build();
        fieldVerificationRepository.save(fv3);
        app3.setFieldVerification(fv3);
        serviceRequestRepository.save(app3);

        // 7. Seed Notifications
        notificationRepository.save(Notification.builder()
                .recipient(citizenUser)
                .title("Welcome to LandStack DPI Portal")
                .message("Your citizen digital identity has been verified. You can now explore cadastral records and apply for 10+ integrated land services.")
                .type("INFO")
                .referenceId("ONBOARDING")
                .isRead(true)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(citizenUser)
                .title("Certificate Ready: LS-2026-00001")
                .message("Your Encumbrance Certificate has been approved and issued by the Sub-Registrar.")
                .type("STATUS_UPDATE")
                .referenceId("LS-2026-00001")
                .isRead(false)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(supervisorUser)
                .title("New Review Task: LS-2026-00003")
                .message("Field Officer Vikramaditya Rao has completed site verification for parcel " + thirdDemoParcel.getUlpin() + ". Final review pending.")
                .type("ACTION_REQUIRED")
                .referenceId("LS-2026-00003")
                .isRead(false)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(officerUser)
                .title("Inspection Scheduled: LS-2026-00002")
                .message("Assigned for physical site verification at Chromepet (ULPIN: " + secondDemoParcel.getUlpin() + ").")
                .type("ACTION_REQUIRED")
                .referenceId("LS-2026-00002")
                .isRead(false)
                .build());

        // 8. Seed Initial Audit Logs
        auditLogRepository.save(AuditLog.builder()
                .userId(adminUser.getId())
                .userEmail(adminUser.getEmail())
                .role("ADMIN")
                .action("SYSTEM_INITIALIZATION")
                .entityType("SYSTEM")
                .entityId("ROOT")
                .description("LandStack SIH 2026 platform initialized with ULPIN cadastral data layers")
                .ipAddress("127.0.0.1")
                .timestamp(LocalDateTime.now().minusDays(2))
                .build());

        auditLogRepository.save(AuditLog.builder()
                .userId(adminUser.getId())
                .userEmail(adminUser.getEmail())
                .role("ADMIN")
                .action("CREATE_SERVICE")
                .entityType("SERVICE")
                .entityId("SRV-LOC-01")
                .description("Created Land Ownership Certificate service with 7-day SLA")
                .ipAddress("127.0.0.1")
                .timestamp(LocalDateTime.now().minusDays(1))
                .build());

        log.info("Database seeding completed successfully! Pre-seeded {} parcels and {} services.", parcels.size(), 8);
    }

    private Parcel createParcel(
            String ulpin, String surveyNo, String subDiv, String district, String taluk, String village, String pincode,
            double lat, double lng, double areaAcre, double areaSqFt, String landType, String landUse,
            String ownershipStatus, String ownerName, String maskedAadhaar, String taxStatus, int taxYear,
            String regStatus, String verifStatus, String encumbrance, double valuation,
            double aiRisk, String riskCategory, String aiNotes) {

        // Generate realistic GeoJSON polygon around lat, lng
        double delta = 0.0015 * Math.sqrt(areaAcre);
        String geoJson = String.format(
                "{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[%f,%f],[%f,%f],[%f,%f],[%f,%f],[%f,%f]]]},\"properties\":{\"ulpin\":\"%s\",\"surveyNumber\":\"%s\",\"areaAcre\":%f,\"ownerName\":\"%s\"}}",
                lng - delta, lat - delta,
                lng + delta, lat - (delta * 0.7),
                lng + (delta * 1.1), lat + delta,
                lng - delta, lat + (delta * 0.9),
                lng - delta, lat - delta,
                ulpin, surveyNo, areaAcre, ownerName
        );

        return Parcel.builder()
                .ulpin(ulpin)
                .surveyNumber(surveyNo)
                .subDivision(subDiv)
                .district(district)
                .taluk(taluk)
                .village(village)
                .pincode(pincode)
                .latitude(lat)
                .longitude(lng)
                .areaAcre(areaAcre)
                .areaSqFt(areaSqFt)
                .landType(landType)
                .landUse(landUse)
                .ownershipStatus(ownershipStatus)
                .ownerName(ownerName)
                .ownerAadhaarMasked(maskedAadhaar)
                .propertyTaxStatus(taxStatus)
                .lastTaxPaidYear(taxYear)
                .registrationStatus(regStatus)
                .verificationStatus(verifStatus)
                .encumbranceStatus(encumbrance)
                .marketValuationInr(valuation)
                .boundaryGeoJson(geoJson)
                .aiRiskScore(aiRisk)
                .aiRiskCategory(riskCategory)
                .aiRiskNotes(aiNotes)
                .build();
    }

    private void ensureTenDepartmentsAndServices() {
        Department deptRevenue = getOrCreateDept("Revenue", "REV", "Land administration, jamabandi records, patta, mutation, and revenue collection");
        Department deptSurvey = getOrCreateDept("Survey & Land Records", "SRV-LR", "Cadastral surveys, ULPIN geocoding, boundary demarcation, and FMB verification");
        Department deptReg = getOrCreateDept("Registration", "REG", "Deed registration, encumbrance certificates (EC), and legal title conveyancing");
        Department deptTown = getOrCreateDept("Town & Country Planning", "TCP", "Master plan zoning, land-use reclassification, and layout sanction");
        Department deptLocal = getOrCreateDept("Local Body", "LOC-BODY", "Municipal and panchayat local governance, trade licenses, and civic infrastructure");
        Department deptBuilding = getOrCreateDept("Building & Planning", "BLD-PLAN", "Structural blueprint sanction, architectural bylaws appraisal, and building permits");
        Department deptHighways = getOrCreateDept("Highways", "HWY", "Road widening alignments, highway setback verification, and access NOCs");
        Department deptForest = getOrCreateDept("Forest", "FOR", "Ecological buffer zones, reserve forest boundary demarcations, and environmental clearance");
        Department deptElectricity = getOrCreateDept("Electricity", "ELEC", "Power grid connection NOC, transmission line corridor easements, and transformer clearance");
        Department deptWater = getOrCreateDept("Water & Sewerage", "WAT-SEW", "Municipal trunk water supply, drainage network clearance, and effluent discharge NOC");

        getOrCreateService("SRV-LOC-01", "Land Ownership Certificate (Patta)",
                "Official statutory certification confirming undisputed ownership and title of the designated parcel.",
                deptRevenue, "Registered Sale Deed, Encumbrance Certificate, Latest Property Tax Receipt, Identity Proof", 7, 150.0);

        getOrCreateService("SRV-CONV-03", "Land Conversion (Agricultural to Non-Agricultural)",
                "Statutory permission for reclassifying agricultural land into residential or commercial layouts.",
                deptRevenue, "Patta/Chitta Extract, FMB Sketch, Soil Quality Certificate, Master Plan Extract", 21, 2500.0);

        getOrCreateService("SRV-MUT-04", "Property Mutation & Jamabandi Entry",
                "Updating buyer title and ownership records in the state jamabandi revenue registers following sale or inheritance.",
                deptRevenue, "Registered Transfer Deed, Death Certificate (if inheritance), No-Calamity Declaration", 14, 300.0);

        getOrCreateService("SRV-SURV-06", "Cadastral Boundary Demarcation & DGPS Survey",
                "On-site physical boundary pegging and differential GPS demarcation to resolve neighbor boundary overlaps.",
                deptSurvey, "Cadastral Field Measurement Book (FMB), Neighbor Notice, Patta", 10, 800.0);

        getOrCreateService("SRV-EC-02", "Encumbrance Certificate (EC)",
                "Certificate detailing all registered financial liabilities, mortgages, and transactions on the parcel for up to 30 years.",
                deptReg, "Previous Deed Copy, Survey Sketch, Aadhaar/Voter ID", 3, 100.0);

        getOrCreateService("SRV-TCP-09", "Master Plan Zoning NOC & Land Reclassification",
                "Comprehensive planning clearance evaluating parcel alignment with master development plan land-use matrices.",
                deptTown, "Site Master Plan Sketch, Patta Extract, Topographical Contour Map", 14, 2000.0);

        getOrCreateService("SRV-TAX-07", "Property Tax Assessment & Municipal Khata Transfer",
                "Apportioning municipal annual ratable value and registering new property owner for local municipal taxes.",
                deptLocal, "Latest Property Tax Receipt, Sale Deed, Completion Certificate", 7, 200.0);

        getOrCreateService("SRV-BLD-05", "Building Permission & Layout Sanction",
                "Technical appraisal and municipal approval of architectural and structural blueprints adhering to building bylaws.",
                deptBuilding, "Approved Site Plan, Structural Engineer Certificate, Soil Investigation Report, Ownership Patta", 15, 4500.0);

        getOrCreateService("SRV-HWY-10", "National & State Highway Access Setback NOC",
                "Statutory clearance verifying ribbon development norms, highway right-of-way (RoW), and safe vehicular access points.",
                deptHighways, "Georeferenced Road Frontage Survey, Access Road Engineering Plan, Patta Copy", 10, 1200.0);

        getOrCreateService("SRV-FOR-11", "Eco-Sensitive Buffer & Reserve Forest Clearance",
                "Ecological compliance verification ensuring parcel boundary is clear of declared forest land and national park buffer perimeters.",
                deptForest, "Cadastral Map with GPS Boundary, Tree Census Extract, Title Document", 21, 1000.0);

        getOrCreateService("SRV-ELEC-12", "High-Tension Corridor NOC & Power Substation Clearance",
                "Right-of-way safety appraisal verifying electrical clearance from high-tension power transmission lines.",
                deptElectricity, "Site Electrical Layout, Power Load Sanction Request, Cadastral FMB Sketch", 7, 750.0);

        getOrCreateService("SRV-UTIL-08", "Water & Sewerage Network NOC",
                "Civic utility clearance for connecting residential/commercial structures to the municipal trunk water mains.",
                deptWater, "Plumbing Layout, Sanctioned Building Plan, Property Tax Receipt", 7, 500.0);
    }

    private Department getOrCreateDept(String name, String code, String description) {
        return departmentRepository.findByName(name)
                .orElseGet(() -> departmentRepository.findByCode(code)
                        .map(existing -> {
                            existing.setName(name);
                            existing.setDescription(description);
                            return departmentRepository.save(existing);
                        })
                        .orElseGet(() -> departmentRepository.save(Department.builder()
                                .name(name)
                                .code(code)
                                .description(description)
                                .active(true)
                                .build())));
    }

    private ServiceEntity getOrCreateService(String code, String name, String desc, Department dept, String docs, int days, double fee) {
        return serviceRepository.findByServiceCode(code)
                .map(existing -> {
                    existing.setServiceName(name);
                    existing.setDescription(desc);
                    existing.setDepartment(dept);
                    return serviceRepository.save(existing);
                })
                .orElseGet(() -> serviceRepository.save(ServiceEntity.builder()
                        .serviceCode(code)
                        .serviceName(name)
                        .description(desc)
                        .department(dept)
                        .requiredDocuments(docs)
                        .processingDays(days)
                        .feeInr(fee)
                        .active(true)
                        .build()));
    }
}
