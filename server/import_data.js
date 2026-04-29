const mongoose = require('mongoose');
const XLSX = require('xlsx');
const dotenv = require('dotenv');
const fs = require('fs');
const Classroom = require('./models/Classroom');
const Faculty = require('./models/Faculty');
const Subject = require('./models/Subject');
const Batch = require('./models/Batch');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const importData = async () => {
    console.log('=== Running Data Seed from Excel ===');
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const file = 'timetable_ready_database (1).xlsx';

        if (!fs.existsSync(file)) {
            console.log('Excel file not found — skipping seed (data may already be in DB).');
            return;
        }

        const workbook = XLSX.readFile(file);


        // 1. Import Classrooms
        if (workbook.Sheets['1. Rooms']) {
            const data = XLSX.utils.sheet_to_json(workbook.Sheets['1. Rooms']);
            console.log(`Importing ${data.length} Classrooms...`);
            for (const row of data) {
                await Classroom.findOneAndUpdate(
                    { roomNumber: row.roomNumber },
                    {
                        name: row.roomNumber,
                        roomNumber: row.roomNumber,
                        capacity: row.capacity || 60,
                        type: 'Lecture Hall'
                    },
                    { upsert: true }
                );
            }
        }

        // 2. Import Faculty & Create Users for them
        if (workbook.Sheets['3. Faculty']) {
            const data = XLSX.utils.sheet_to_json(workbook.Sheets['3. Faculty']);
            console.log(`Importing ${data.length} Teachers...`);
            for (const row of data) {
                if (!row.Email) {
                    console.warn(`Skipping faculty with no email: ${row.Faculty_Name}`);
                    continue;
                }
                await Faculty.findOneAndUpdate(
                    { email: row.Email },
                    {
                        name: row.Faculty_Name,
                        email: row.Email,
                        department: row.Department,
                        maxLoad: 12
                    },
                    { upsert: true }
                );
                // Create User entry
                await User.findOneAndUpdate(
                    { email: row.Email },
                    {
                        username: row.Email,
                        password: row.Password || 'password123',
                        role: 'faculty',
                        email: row.Email,
                        department: row.Department
                    },
                    { upsert: true }
                );
            }
        }

        // 3. Import Students
        if (workbook.Sheets['6. Students']) {
            const data = XLSX.utils.sheet_to_json(workbook.Sheets['6. Students']);
            console.log(`Importing ${data.length} Students...`);
            for (const row of data) {
                if (!row.Email) {
                    console.warn(`Skipping student with no email: ${row.Name}`);
                    continue;
                }
                await User.findOneAndUpdate(
                    { email: row.Email },
                    {
                        username: row.Email, // Use email as username to ensure uniqueness
                        password: row.Password || 'password123',
                        role: 'student',
                        email: row.Email,
                        rollNumber: row.Student_ID,
                        department: row.Program,
                        section: row.Section,
                        batch: row.Batch_Year
                    },
                    { upsert: true }
                );
            }
        }

        // 4. Import Subjects
        if (workbook.Sheets['2. Subjects']) {
            const data = XLSX.utils.sheet_to_json(workbook.Sheets['2. Subjects']);
            console.log(`Importing ${data.length} Subjects...`);
            for (const row of data) {
                await Subject.findOneAndUpdate(
                    { code: row.code },
                    {
                        name: row.name,
                        code: row.code,
                        credits: 4,
                        contactHours: 3,
                        type: 'Theory'
                    },
                    { upsert: true }
                );
            }
        }

        // 5. Import Batches
        if (workbook.Sheets['Batches']) {
            const data = XLSX.utils.sheet_to_json(workbook.Sheets['Batches']);
            console.log(`Importing ${data.length} Batches...`);
            for (const row of data) {
                await Batch.findOneAndUpdate(
                    { name: row.name },
                    {
                        name: row.name,
                        department: row.department,
                        section: row.section,
                        size: 60
                    },
                    { upsert: true }
                );
            }
        }

        // 6. Import Timetable
        if (workbook.Sheets['Timetable']) {
            const data = XLSX.utils.sheet_to_json(workbook.Sheets['Timetable']);
            console.log(`Importing ${data.length} Timetable entries...`);
            
            // Clear existing timetable to avoid duplication issues
            await Timetable.deleteMany({});

            for (const row of data) {
                // Resolve Refs
                const [subject, faculty, classroom, batchDoc] = await Promise.all([
                    Subject.findOne({ code: row.subject }),
                    Faculty.findOne({ name: row.teacher }),
                    Classroom.findOne({ roomNumber: row.classroom }),
                    Batch.findOne({ name: row.batch })
                ]);

                if (subject && faculty && classroom && batchDoc) {
                    // Normalize Day
                    const dayMap = {
                        'Mon': 'Monday',
                        'Tue': 'Tuesday',
                        'Wed': 'Wednesday',
                        'Thu': 'Thursday',
                        'Fri': 'Friday',
                        'Sat': 'Saturday',
                        'Sun': 'Sunday'
                    };
                    const fullDay = dayMap[row.day] || row.day;

                    await Timetable.create({
                        batch: batchDoc._id,
                        day: fullDay,
                        slot: `${row.startTime}-${row.endTime}`,
                        subject: subject._id,
                        faculty: faculty._id,
                        classroom: classroom._id
                    });
                } else {
                    console.warn(`Skipping row for ${row.batch} due to missing refs: Subject(${row.subject}), Teacher(${row.teacher}), Classroom(${row.classroom}), Batch(${row.batch})`);
                }
            }
        }

        console.log('=== Data Seed Completed Successfully! ===');
    } catch (err) {
        console.error('Error seeding data:', err);
        throw err;
    }
};

module.exports = importData;
