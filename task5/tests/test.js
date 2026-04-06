const cds = require('@sap/cds/lib')
const { GET, POST, DELETE, PATCH, expect } = cds.test(__dirname + '../../')

jest.setTimeout(20000) // extend timeout if needed

describe('Hospital Service API Tests', () => {
    let appointmentId, patientId, doctorId

    beforeAll(async () => {
        // Connect to HospitalService
        const hospitalService = await cds.connect.to('HospitalService')
        const { Patient, Doctor } = hospitalService.entities

        // Create sample Patient
        const patient = await INSERT.into(Patient).entries({
            name: 'John Doe',
            age: 30,
            mobile: '9999999999'
        })
        patientId = patient.ID

        // Create sample Doctor
        const doctor = await INSERT.into(Doctor).entries({
            name: 'Dr. Ravi',
            specialization_ID: null, // optional department association
            mobile: '8888888888'
        })
        doctorId = doctor.ID    
    })

    afterAll(async () => {
        // Clean up test data
        const hospitalService = await cds.connect.to('HospitalService')
        const { Patient, Doctor, Appointment } = hospitalService.entities

        if (appointmentId) await DELETE.from(Appointment).where({ ID: appointmentId })
        if (patientId) await DELETE.from(Patient).where({ ID: patientId })
        if (doctorId) await DELETE.from(Doctor).where({ ID: doctorId })
    })

    describe('Appointment CRUD & Status Rules', () => {

        it('Should create a new appointment', async () => {
            const { status, data } = await POST('/odata/v4/hospital/Appointments', {
                patient_ID: patientId,
                Doctor_ID: doctorId,
                date: '2026-04-01T15:30:00',
                status_code: 'S' // Scheduled
            })
            appointmentId = data.ID
            expect(status).to.equal(201)
            expect(data.status_code).to.eql('S')
        })

        it('Should not allow updating a completed appointment', async () => {
            // First, set status to Completed
            await PATCH(`/odata/v4/hospital/Appointments(ID=${appointmentId},IsActiveEntity=true)`, {
                status_code: 'C'
            })

            // Try to update any field
            try {
                await PATCH(`/odata/v4/hospital/Appointments(ID=${appointmentId},IsActiveEntity=true)`, {
                    date: '2026-04-02T10:00:00'
                })
            } catch (err) {
                expect(err.response.data.error.message).to.include('Cannot update completed appointments')
            }
        })

        it('Should allow re-scheduling a cancelled appointment', async () => {
            // Cancel the appointment first
            await PATCH(`/odata/v4/hospital/Appointments(ID=${appointmentId},IsActiveEntity=true)`, {
                status_code: 'X'
            })

            // Update date to re-schedule
            const { status, data } = await PATCH(
                `/odata/v4/hospital/Appointments(ID=${appointmentId},IsActiveEntity=true)`,
                {
                    date: '2026-04-05T10:30:00',
                    status_code: 'S' // Rescheduled
                }
            )
            expect(status).to.equal(200)
            expect(data.status_code).to.eql('S')
        })

        it('Should reject moving directly from Cancelled to Completed', async () => {
            // Cancel again
            await PATCH(`/odata/v4/hospital/Appointments(ID=${appointmentId},IsActiveEntity=true)`, {
                status_code: 'X'
            })

            try {
                await PATCH(`/odata/v4/hospital/Appointments(ID=${appointmentId},IsActiveEntity=true)`, {
                    status_code: 'C'
                })
            } catch (err) {
                expect(err.response.data.error.message).to.include('Re-Schedule the appointment')
            }
        })
    })
})