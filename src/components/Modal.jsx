export default function Modal({

    isOpen,

    onClose,

    type,

    item,

    formData,

    setFormData,

    onSubmit

}) {

    if (!isOpen) return null

    return (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center p-6 border-b">

                    <h2 className="text-2xl font-bold">

                        Düzenle

                    </h2>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 transition"
                    >

                        ✕

                    </button>

                </div>

                {/* CONTENT */}
                <div className="p-6 space-y-4">

                    {/* SERVICE */}
                    {type === 'service' && (

                        <>

                            <input
                                type="text"
                                placeholder="Hizmet Adı"

                                value={formData.title || ''}

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value
                                    })
                                }

                                className="w-full bg-gray-100 p-4 rounded-xl outline-none"
                            />

                            <input
                                type="number"
                                placeholder="Süre"

                                value={
                                    formData.duration_minutes || ''
                                }

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        duration_minutes:
                                            e.target.value
                                    })
                                }

                                className="w-full bg-gray-100 p-4 rounded-xl outline-none"
                            />

                            <input
                                type="number"
                                placeholder="Fiyat"

                                value={formData.price || ''}

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price: e.target.value
                                    })
                                }

                                className="w-full bg-gray-100 p-4 rounded-xl outline-none"
                            />

                        </>
                    )}

                    {/* EMPLOYEE */}
                    {type === 'employee' && (

                        <>

                            <input
                                type="text"
                                placeholder="Uzman Adı"

                                value={formData.full_name || ''}

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        full_name: e.target.value
                                    })
                                }

                                className="w-full bg-gray-100 p-4 rounded-xl outline-none"
                            />

                            <input
                                type="text"
                                placeholder="Telefon"

                                value={formData.phone || ''}

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value
                                    })
                                }

                                className="w-full bg-gray-100 p-4 rounded-xl outline-none"
                            />

                        </>
                    )}

                    {/* APPOINTMENT */}
                    {type === 'appointment' && (

                        <>

                            <div className="bg-rose-50 p-4 rounded-2xl">

                                <p className="font-bold">

                                    {item?.customer_name}

                                </p>

                                <p className="text-sm text-rose-600">

                                    {item?.appointment_date}
                                    {' | '}
                                    {item?.start_time}

                                </p>

                            </div>

                            <select
                                value={formData.status || ''}

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value
                                    })
                                }

                                className="w-full bg-gray-100 p-4 rounded-xl outline-none"
                            >

                                <option value="Bekliyor">
                                    Bekliyor
                                </option>

                                <option value="Onaylandı">
                                    Onaylandı
                                </option>

                                <option value="İptal">
                                    İptal
                                </option>

                            </select>

                        </>
                    )}

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            onClick={onClose}

                            className="px-5 py-3 rounded-xl bg-gray-100 font-semibold"
                        >

                            Vazgeç

                        </button>

                        <button
                            onClick={onSubmit}

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