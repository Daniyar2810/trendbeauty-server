import { sendWhatsAppMessage } from "../lib/whatsapp"; // Dosya yolunu kontrol et

export default function Modal({
    isOpen,
    onClose,
    type,
    item,
    formData,
    setFormData,
    onSubmit,
    employees,
    services
}) {
    if (!isOpen) return null

    // WhatsApp Mesaj Gönderme Mantığı
    const handleSaveWithNotification = async () => {
        // Önce normal kaydetme işlemini yap
        await onSubmit();

        // Eğer bir randevu düzenleniyorsa ve durumu "Onaylandı" yapıldıysa
        if (type === 'appointment' && formData.status === 'Onaylandı') {

            // 1. MÜŞTERİYE MESAJ
            if (item?.customer_phone) {
                const customerMsg = `Merhaba *${item.customer_name}*,\n\nRandevunuz onaylanmıştır. ✅\n\n📅 Tarih: ${formData.appointment_date}\n⏰ Saat: ${formData.appointment_start_time}\n📍 Yer: Güzellik Merkezimiz\n\nSizi görmek için sabırsızlanıyoruz!`;

                await sendWhatsAppMessage({
                    phone: item.customer_phone,
                    message: customerMsg
                });
            }

            // 2. UZMANA MESAJ
            const selectedEmployee = employees?.find(e => e.id === formData.employee_id);
            if (selectedEmployee && selectedEmployee.phone) {
                const expertMsg = `🚀 *Yeni İş Ataması*\n\nSayın *${selectedEmployee.full_name}*,\n\nSize yeni bir randevu atandı.\n\nMüşteri: ${item.customer_name}\nSaat: ${formData.appointment_start_time}\nLütfen hazırlıklı olun.`;

                await sendWhatsAppMessage({
                    phone: selectedEmployee.phone,
                    message: expertMsg
                });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* HEADER */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Düzenle</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 transition">✕</button>
                </div>

                {/* CONTENT */}
                <div className="p-6 space-y-4">
                    {/* ... SERVICE VE EMPLOYEE bölümleri aynı kalıyor ... */}

                    {/* APPOINTMENT BÖLÜMÜ (Zaten sende var) */}
                    {type === 'appointment' && (
                        <>
                            <div className="bg-rose-50 p-4 rounded-2xl">
                                <p className="font-bold">{item?.customer_name}</p>
                                <p className="text-sm text-rose-600">
                                    {item?.appointment_date} | {item?.appointment_start_time}
                                </p>
                            </div>

                            <select
                                value={formData.status || ''}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-gray-100 p-4 rounded-xl outline-none"
                            >
                                <option value="Bekliyor">Bekliyor</option>
                                <option value="Onaylandı">Onaylandı</option>
                                <option value="İptal">İptal</option>
                            </select>

                            {/* Tarih ve Saat Inputları (Sende olan kısımlar) */}
                            <div>
                                <label className="block mb-2 text-sm font-medium">Randevu Tarihi</label>
                                <input
                                    type="date"
                                    value={formData.appointment_date || ''}
                                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                    className="w-full bg-gray-100 p-4 rounded-xl outline-none"
                                />
                            </div>

                            {/* ... Diğer Saat ve Uzman Seçimi Inputları Aynı ... */}
                        </>
                    )}

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} className="px-5 py-3 rounded-xl bg-gray-100 font-semibold">Vazgeç</button>
                        <button
                            onClick={handleSaveWithNotification} // Değişen buton fonksiyonu
                            className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold"
                        >
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}