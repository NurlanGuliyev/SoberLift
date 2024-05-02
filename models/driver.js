import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    name: String,
    surname: String,
    contact_nuumber: String,
    email: String,
    password: String,
    locationId: Object,
    isActive: {
        type: Boolean,
        default: false,
      },
    rating: [Number],
    status: String,
    drivingLicense: String
}, { versionKey: false });

const Driver = mongoose.model('Driver', driverSchema, 'Driver');

async function insertDrivers() {

    const sampleDrivers = [
        {
            name: 'John',
            surname: 'Doe',
            contact_number: '1234567890',
            email: 'john@example.com',
            password: 'password123',
            locationId: '5fecb3a2c048954f789e5f34', // Example location ID (ObjectID)
            rating: [4, 5, 3],
            status: 'active',
            drivingLicense: 'ABC123'
        },
        {
            name: 'Jane',
            surname: 'Smith',
            contact_number: '9876543210',
            email: 'jane@example.com',
            password: 'password456',
            locationId: '5fecb3a2c048954f789e5f35', // Example location ID (ObjectID)
            rating: [5, 5, 4],
            status: 'inactive',
            drivingLicense: 'ABC123'
        },
        {
            name: 'Alice',
            surname: 'Johnson',
            contact_number: '4567890123',
            email: 'alice@example.com',
            password: 'password789',
            locationId: '5fecb3a2c048954f789e5f36', // Example location ID (ObjectID)
            rating: [3, 4, 3],
            status: 'active',
            drivingLicense: 'ABC123'
        },
        {
            name: 'Bob',
            surname: 'Brown',
            contact_number: '7890123456',
            email: 'bob@example.com',
            password: 'passwordabc',
            locationId: '5fecb3a2c048954f789e5f37', // Example location ID (ObjectID)
            rating: [5, 4, 5],
            status: 'active',
            drivingLicense: 'ABC123'
        },
        {
            name: 'Emily',
            surname: 'Taylor',
            contact_number: '2345678901',
            email: 'emily@example.com',
            password: 'passwordxyz',
            locationId: '5fecb3a2c048954f789e5f38', // Example location ID (ObjectID)
            rating: [4, 3, 4],
            status: 'inactive',
            drivingLicense: 'ABC123'
        }
    ];
    
    try {
        const insertedDrivers = await Driver.insertMany(sampleDrivers);
        console.log("Inserted documents:", insertedDrivers);
    } catch (error) {
        console.error("Error inserting documents:", error);
    }
}

export { Driver, insertDrivers };
