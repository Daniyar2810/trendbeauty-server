import { useEffect, useState }
    from 'react'
import {
    requestNotificationPermission
} from '../lib/firebase'
import {
    sendWhatsAppMessage
}
    from '../lib/whatsapp'
import { supabase }
    from '../lib/supabase'
import AppointmentCalendar
    from '../components/calendar/AppointmentCalendar'
import Sidebar
    from '../components/Sidebar'

import Header
    from '../components/Header'

import MobileTabs
    from '../components/MobileTabs'

import AppointmentTable
    from '../components/AppointmentTable'

import ServiceTable
    from '../components/ServiceTable'

import EmployeeTable
    from '../components/EmployeeTable'

import Modal
    from '../components/Modal'
import AvailableTimes
    from '../components/AvailableTimes'

export default function AdminDashboard({

    logout

}) {

    // STATES
    const [activeTab, setActiveTab] =
        useState('appointments')

    const [services, setServices] =
        useState([])

    const [employees, setEmployees] =
        useState([])

    const [appointments, setAppointments] =
        useState([])
    const [employeeId, setEmployeeId] =
        useState('')

    const [appointmentDate, setAppointmentDate] =
        useState('')

    const [service, setService] =
        useState('')

    // MODAL
    const [isModalOpen, setIsModalOpen] =
        useState(false)

    const [modalType, setModalType] =
        useState('')

    const [selectedItem, setSelectedItem] =
        useState(null)

    const [formData, setFormData] =
        useState({})

    // LOAD DATABASE
    async function loadDatabase() {

        // SERVICES
        const {
            data: servicesData
        } = await supabase
            .from('services')
            .select('*')

        setServices(
            servicesData || []
        )

        // EMPLOYEES
        const {
            data: employeesData
        } = await supabase
            .from('employees')
            .select('*')

        setEmployees(
            employeesData || []
        )

        // APPOINTMENTS
        const {
            data: appointmentsData
        } = await supabase
            .from('appointments')
            .select('*')

        setAppointments(
            appointmentsData || []
        )
    }

    useEffect(() => {
    console.log("USE EFFECT ÇALIŞTI");

       

        loadDatabase()

    }, [])

    useEffect(() => {

        const channel = supabase
            .channel('test-channel')

            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                },
                async (payload) => {

                    console.log(
                        'EVENT GELDİ',
                        payload
                    );

                    const {
                        data,
                        error
                    } = await supabase
                        .from('appointments')
                        .select('*')
                        .order('created_at', {
                            ascending: false
                        });

                    if (!error) {

                        setAppointments([
                            ...(data || [])
                        ]);
                    }

                    new Notification(
                        'Yeni Randevu 📅',
                        {
                            body:
                                payload.new.customer_name +
                                ' yeni randevu oluşturdu',
                        }
                    );
                }
            )

            .subscribe((status) => {

                console.log(
                    'STATUS:',
                    status
                );
            });

        return () => {

            supabase.removeChannel(channel);
        };

    }, []);
    function openModal(type, item = null) {

        setModalType(type)

        setSelectedItem(item)

        setFormData(item || {})

        setIsModalOpen(true)
    }

    // CLOSE MODAL
    function closeModal() {

        setIsModalOpen(false)
    }

    // DELETE
    async function deleteItem(type, id) {

        let tableName = ''

        if (type === 'service') {
            tableName = 'services'
        }

        if (type === 'employee') {
            tableName = 'employees'
        }

        if (type === 'appointment') {
            tableName = 'appointments'
        }

        await supabase
            .from(tableName)
            .delete()
            .eq('id', id)

        loadDatabase()
    }

    // SAVE
    async function handleSave() {

        // SERVICE
        if (modalType === 'service') {

            if (selectedItem) {

                await supabase
                    .from('services')
                    .update(formData)
                    .eq('id', selectedItem.id)

            } else {

                await supabase
                    .from('services')
                    .insert([formData])
            }
        }

        // EMPLOYEE
        if (modalType === 'employee') {

            if (selectedItem) {

                await supabase
                    .from('employees')
                    .update(formData)
                    .eq('id', selectedItem.id)

            } else {

                await supabase
                    .from('employees')
                    .insert([formData])
            }
        }

        // APPOINTMENT
        if (modalType === 'appointment') {

            await supabase
                .from('appointments')
                .update({
                    status: formData.status
                })
                .eq('id', selectedItem.id)

            // STATUS APPROVED OLUNCA WHATSAPP GÖNDER
            if (formData.status === 'approved') {

                await sendWhatsAppMessage({

                    phone: selectedItem.phone,

                    message: `
🌸 Trend Beauty

Randevunuz onaylandı ✅

📅 Tarih: ${selectedItem.date}
🕒 Saat: ${selectedItem.time}

Sizi bekliyoruz 💖
`
                })
            }
        }

        closeModal()

        loadDatabase()
    }

    return (

        <div className="min-h-screen bg-gray-50 flex">

            {/* SIDEBAR */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* CONTENT */}
            <div className="flex-1 flex flex-col">

                <Header
                    logout={logout}
                />

                <MobileTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <main className="flex-1 p-4 md:p-6 overflow-y-auto">

                    {/* APPOINTMENTS */}
                    {activeTab === 'appointments' && (

                        <AppointmentTable
                            key={JSON.stringify(appointments)}
                            appointments={[...appointments]}
                            services={services}
                            employees={employees}
                            openModal={openModal}
                            deleteItem={deleteItem}
                       
                        />
                    )}
                    {activeTab === 'appointments' && (

                        <div className="mt-10">

                            <AppointmentCalendar
                                appointments={appointments}
                                services={services}
                                employees={employees}
                            />

                        </div>
                    )}
                    <div className="mt-10 bg-white p-6 rounded-2xl shadow border border-gray-200">

                        <h2 className="text-2xl font-bold mb-6">


                            Canlı Müsait Saat Sistemi

                        </h2>

                        <div className="grid md:grid-cols-3 gap-4 mb-6">

                            {/* SERVICE */}
                            <select
                                value={service}

                                onChange={(e) =>
                                    setService(e.target.value)
                                }

                                className="border rounded-xl p-3"
                            >

                                <option value="">
                                    Hizmet Seç
                                </option>

                                {services.map(service => (

                                    <option
                                        key={service.id}
                                        value={service.id}
                                    >

                                        {service.title}

                                    </option>
                                ))}

                            </select>

                            {/* EMPLOYEE */}
                            <select
                                value={employeeId}

                                onChange={(e) =>
                                    setEmployeeId(e.target.value)
                                }

                                className="border rounded-xl p-3"
                            >

                                <option value="">
                                    Uzman Seç
                                </option>

                                {employees.map(employee => (

                                    <option
                                        key={employee.id}
                                        value={employee.id}
                                    >

                                        {employee.full_name}

                                    </option>
                                ))}

                            </select>

                            {/* DATE */}
                            <input
                                type="date"

                                value={appointmentDate}

                                onChange={(e) =>
                                    setAppointmentDate(e.target.value)
                                }

                                className="border rounded-xl p-3"
                            />

                        </div>

                        {/* AVAILABLE TIMES */}
                        <AvailableTimes
                            employeeId={employeeId}
                            appointmentDate={appointmentDate}
                            service={service}
                        />
                        <button

                            onClick={() =>

                                sendWhatsAppMessage({

                                    phone: '905431492802',

                                    message: `
TEST MESAJI 🌸

Trend Beauty
`
                                })

                            }

                            className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition"
                        >

                            WhatsApp Test Gönder

                        </button>

                    </div>

                    {/* SERVICES */}
                    {activeTab === 'services' && (

                        <ServiceTable
                            services={services}
                            openModal={openModal}
                            deleteItem={deleteItem}
                        />
                    )}

                    {/* EMPLOYEES */}
                    {activeTab === 'employees' && (

                        <EmployeeTable
                            employees={employees}
                            openModal={openModal}
                            deleteItem={deleteItem}
                        />
                    )}

                </main>

            </div>

            {/* MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                type={modalType}
                item={selectedItem}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSave}
            />

        </div>

    )

}