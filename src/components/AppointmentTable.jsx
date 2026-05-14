import React from 'react';
import { supabase } from '../lib/supabase'; // Supabase istemcini buraya dahil et
import { sendWhatsAppMessage } from '../lib/whatsapp'; // Daha önce düzenlediğimiz dosya

export default function AppointmentTable({
    appointments,
    services,
    employees,
    openModal,
    deleteItem,
    refreshData // Verileri yenilemek için bir fonksiyonun varsa ekle
}) {

    const handleApprove = async (app, service, employee) => {
        const confirmApprove = window.confirm(`${app.customer_name} isimli müşterinin randevusu onaylansın mı?`);
        if (!confirmApprove) return;

        try {
            // 1. ADIM: VERİTABANINI GÜNCELLE
            const { error: dbError } = await supabase
                .from('appointments')
                .update({ status: 'Onaylandı' })
                .eq('id', app.id);

            if (dbError) throw dbError;

            // 2. ADIM: MÜŞTERİYE WHATSAPP GÖNDER
            if (app.customer_phone) {
                const customerMsg = `*Trend Beauty Randevu Onayı* ✅\n\nMerhaba *${app.customer_name}*,\n${app.appointment_date} tarihindeki *${service?.title}* randevunuz onaylanmıştır.\n\n⏰ Saat: ${app.appointment_start_time}\n📍 Konum: Trend Beauty Salon\n\nSizi bekliyoruz!`;

                await sendWhatsAppMessage({
                    phone: app.customer_phone,
                    message: customerMsg
                });
            }

            // 3. ADIM: UZMANA WHATSAPP GÖNDER
            if (employee?.phone) {
                const expertMsg = `*Yeni İş Ataması!* 💇\n\n👤 Müşteri: ${app.customer_name}\n📅 Tarih: ${app.appointment_date}\n🕒 Saat: ${app.appointment_start_time}\n✨ Hizmet: ${service?.title}`;

                await sendWhatsAppMessage({
                    phone: employee.phone,
                    message: expertMsg
                });
            }

            alert("Randevu onaylandı ve bildirimler gönderildi! ✅");

            // Eğer varsa listeyi yenile
            if (refreshData) refreshData();
            else window.location.reload(); // En kaba yöntemle sayfayı yenile

        } catch (error) {
            console.error("İşlem Hatası:", error);
            alert("Bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
        }
    };

    return (
        <div className="p-4">
            {/* Üst Kısım (Header) */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-800">Randevu Takvimi</h2>
                    <p className="text-gray-500 text-sm">Gelecek randevuları ve müşteri taleplerini izleyin.</p>
                </div>
            </div>

            {/* Tablo Yapısı */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                            <th className="p-4 font-bold">Müşteri</th>
                            <th className="p-4 font-bold">Hizmet & Uzman</th>
                            <th className="p-4 font-bold">Zamanlama</th>
                            <th className="p-4 font-bold">Tutar</th>
                            <th className="p-4 font-bold">Durum</th>
                            <th className="p-4 font-bold text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {(appointments || []).map(app => {
                            const service = services.find(s => String(s.id) === String(app.service_id));
                            const employee = employees.find(e => String(e.id) === String(app.employee_id));

                            return (
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{app.customer_name}</div>
                                        <div className="text-xs text-blue-600 font-medium">{app.customer_phone}</div>
                                    </td>

                                    <td className="p-4">
                                        <div className="font-semibold text-rose-600">{service?.title || 'Bilinmeyen Hizmet'}</div>
                                        <div className="text-xs text-gray-500">{employee?.full_name || 'Atanmamış'}</div>
                                    </td>

                                    <td className="p-4">
                                        <div className="font-medium">{app.appointment_date}</div>
                                        <div className="text-xs text-gray-400">{app.appointment_start_time} - {app.end_time}</div>
                                    </td>

                                    <td className="p-4 font-bold text-gray-900">₺{app.total_price}</td>

                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'Onaylandı' ? 'bg-green-100 text-green-700' :
                                                app.status === 'İptal' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {app.status || 'Beklemede'}
                                        </span>
                                    </td>

                                    <td className="p-4 text-right space-x-2">
                                        {/* HIZLI ONAY BUTONU */}
                                        {app.status === 'Bekliyor' && (
                                            <button
                                                onClick={() => handleApprove(app, service, employee)}
                                                className="px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all shadow-sm"
                                            >
                                                Hızlı Onay
                                            </button>
                                        )}

                                        <button
                                            onClick={() => openModal('appointment', app)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                                        >
                                            Düzenle
                                        </button>

                                        <button
                                            onClick={() => deleteItem('appointment', app.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}