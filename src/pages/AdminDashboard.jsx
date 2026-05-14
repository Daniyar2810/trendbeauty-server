import { useEffect, useState } from 'react';
import { requestNotificationPermission } from '../lib/firebase';
import { sendWhatsAppMessage } from '../lib/whatsapp';
import { supabase } from '../lib/supabase';

// Bileşenler
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MobileTabs from '../components/MobileTabs';
import AppointmentTable from '../components/AppointmentTable';
import ServiceTable from '../components/ServiceTable';
import EmployeeTable from '../components/EmployeeTable';
import Modal from '../components/Modal';
import AvailableTimes from '../components/AvailableTimes';

export default function AdminDashboard({ logout }) {
    // STATES
    const [activeTab, setActiveTab] = useState('appointments');
    const [services, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [employeeId, setEmployeeId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [service, setService] = useState('');

    // MODAL STATES
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});

    // VERİLERİ YÜKLE
    async function loadDatabase() {
        const { data: sData } = await supabase.from('services').select('*');
        setServices(sData || []);

        const { data: eData } = await supabase.from('employees').select('*');
        setEmployees(eData || []);

        const { data: aData } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
        setAppointments(aData || []);
    }

    useEffect(() => {
        requestNotificationPermission();
        loadDatabase();
    }, []);

    // REAL-TIME DİNLEME
    useEffect(() => {
        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async (payload) => {
                loadDatabase(); // Herhangi bir değişiklikte listeyi yenile

                // Sadece yeni randevu düştüğünde bildirim gönder
                if (payload.eventType === 'INSERT') {
                    new Notification('Yeni Randevu 📅', {
                        body: `${payload.new.customer_name} yeni bir randevu oluşturdu.`,
                    });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // MODAL İŞLEMLERİ
    function openModal(type, item = null) {
        setModalType(type);
        setSelectedItem(item);
        setFormData(item || {});
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    // SİLME İŞLEMİ
    async function deleteItem(type, id) {
        const confirmDelete = window.confirm("Bu kaydı silmek istediğinize emin misiniz?");
        if (!confirmDelete) return;

        let tableName = type === 'service' ? 'services' : type === 'employee' ? 'employees' : 'appointments';
        await supabase.from(tableName).delete().eq('id', id);
        loadDatabase();
    }

    // WHATSAPP MESAJ FORMATLAYICI (iOS UYUMLU)
    const formatAndSendWhatsApp = async (phone, message) => {
        if (!phone) return;
        const cleanPhone = `90${phone.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '')}`;
        return await sendWhatsAppMessage({ phone: cleanPhone, message });
    };

    // TABLODAN HIZLI ONAY FONKSİYONU
    async function handleApproveQuick(app, serviceObj, employeeObj) {
        const confirmApprove = window.confirm(`${app.customer_name} randevusu onaylansın ve WhatsApp mesajları gönderilsin mi?`);
        if (!confirmApprove) return;

        try {
            // 1. Veritabanı Güncelle
            const { error } = await supabase.from('appointments').update({ status: 'Onaylandı' }).eq('id', app.id);
            if (error) throw error;

            // 2. Müşteri Mesajı
            const customerMsg = `*Trend Beauty* ✅\n\nMerhaba *${app.customer_name}*,\n${app.appointment_date} tarihindeki *${serviceObj?.title}* randevunuz onaylanmıştır.\n\n⏰ Saat: ${app.appointment_start_time}\n\nSizi bekliyoruz!`;
            await formatAndSendWhatsApp(app.customer_phone, customerMsg);

            // 3. Uzman Mesajı
            if (employeeObj?.phone) {
                const empMsg = `*Yeni İş Ataması!* 💇\n\nMüşteri: ${app.customer_name}\nTarih: ${app.appointment_date}\nSaat: ${app.appointment_start_time}\nHizmet: ${serviceObj?.title}`;
                await formatAndSendWhatsApp(employeeObj.phone, empMsg);
            }

            alert("Onaylandı ve Bildirimler Gönderildi!");
            loadDatabase();
        } catch (err) {
            console.error(err);
            alert("İşlem başarısız.");
        }
    }

    // MODAL KAYDETME (DÜZENLEME VE EKLEME)
    async function handleSave() {
        try {
            if (modalType === 'service') {
                if (selectedItem) await supabase.from('services').update(formData).eq('id', selectedItem.id);
                else await supabase.from('services').insert([formData]);
            }

            else if (modalType === 'employee') {
                if (selectedItem) await supabase.from('employees').update(formData).eq('id', selectedItem.id);
                else await supabase.from('employees').insert([formData]);
            }

            else if (modalType === 'appointment') {
                await supabase.from('appointments').update({
                    status: formData.status,
                    appointment_date: formData.appointment_date,
                    appointment_start_time: formData.appointment_start_time,
                    end_time: formData.end_time,
                    employee_id: formData.employee_id
                }).eq('id', selectedItem.id);

                // Modal'dan "Onaylandı" seçildiyse de mesaj gönder
                if (formData.status === 'Onaylandı') {
                    const s = services.find(x => x.id === selectedItem.service_id);
                    const e = employees.find(x => x.id === formData.employee_id);

                    const msg = `*Trend Beauty* ✅\n\nMerhaba *${selectedItem.customer_name}*,\nRandevunuz *Onaylanmıştır.*\n\nTarih: ${formData.appointment_date}\nSaat: ${formData.appointment_start_time}\nUzman: ${e?.full_name || '-'}`;
                    await formatAndSendWhatsApp(selectedItem.customer_phone, msg);
                }
            }

            closeModal();
            loadDatabase();
        } catch (error) {
            console.error(error);
            alert("Kaydedilirken bir hata oluştu.");
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">
            {/* SIDEBAR DESKTOP */}
            <div className="hidden md:block">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header logout={logout} />

                {/* MOBILE TABS */}
                <div className="md:hidden">
                    <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                <main className="flex-1 p-3 md:p-6 overflow-y-auto">
                    {/* APPOINTMENTS TAB */}
                    {activeTab === 'appointments' && (
                        <div className="space-y-6">
                            <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-200">
                                <AppointmentTable
                                    key={JSON.stringify(appointments)}
                                    appointments={appointments}
                                    services={services}
                                    employees={employees}
                                    openModal={openModal}
                                    deleteItem={deleteItem}
                                    onApprove={handleApproveQuick} // Hızlı onay prop'u
                                />
                            </div>
                        </div>
                    )}

                    {/* CALENDAR TAB */}
                    {activeTab === 'calendar' && (
                        <div className="mt-6 bg-white p-4 md:p-6 rounded-2xl shadow border border-gray-200 overflow-hidden">
                            <h2 className="text-xl md:text-2xl font-bold mb-6">Randevu Takvimi</h2>
                            <AppointmentCalendar appointments={appointments} services={services} employees={employees} />
                        </div>
                    )}

                    {/* AVAILABLE TIMES TAB */}
                    {activeTab === 'available-times' && (
                        <div className="mt-6 bg-white p-4 md:p-6 rounded-2xl shadow border border-gray-200 overflow-hidden">
                            <h2 className="text-xl md:text-2xl font-bold mb-6">Canlı Müsait Saat Sistemi</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <select value={service} onChange={(e) => setService(e.target.value)} className="border rounded-xl p-3 w-full">
                                    <option value="">Hizmet Seç</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="border rounded-xl p-3 w-full">
                                    <option value="">Uzman Seç</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                                </select>
                                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="border rounded-xl p-3 w-full" />
                            </div>
                            <AvailableTimes employeeId={employeeId} appointmentDate={appointmentDate} service={service} />
                        </div>
                    )}

                    {/* SERVICES TAB */}
                    {activeTab === 'services' && (
                        <ServiceTable services={services} openModal={openModal} deleteItem={deleteItem} />
                    )}

                    {/* EMPLOYEES TAB */}
                    {activeTab === 'employees' && (
                        <EmployeeTable employees={employees} openModal={openModal} deleteItem={deleteItem} />
                    )}
                </main>
            </div>

            {/* GLOBAL MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                type={modalType}
                item={selectedItem}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSave}
                employees={employees}
            />
        </div>
    );
}