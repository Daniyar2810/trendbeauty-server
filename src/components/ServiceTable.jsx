export default function ServiceTable({

    services,

    openModal,

    deleteItem

}) {

    return (

        <div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-extrabold text-gray-800">

                        Hizmet Yönetimi

                    </h2>

                    <p className="text-gray-500 text-sm">

                        Fiyatlandırma ve süre bilgilerini güncelleyin.

                    </p>

                </div>

                <button
                    onClick={() =>
                        openModal('service')
                    }

                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shadow-lg"
                >

                    Hizmet Ekle

                </button>

            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">

                <table className="w-full text-left border-collapse">

                    <thead>

                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">

                            <th className="p-4">
                                Hizmet Adı
                            </th>

                            <th className="p-4">
                                Süre
                            </th>

                            <th className="p-4">
                                Ücret
                            </th>

                            <th className="p-4 text-right">
                                İşlem
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">

                        {services.map(service => (

                            <tr
                                key={service.id}
                                className="hover:bg-gray-50"
                            >

                                <td className="p-4 font-bold text-gray-800">

                                    {service.title}

                                </td>

                                <td className="p-4 text-gray-500">

                                    {service.duration_minutes}
                                    dk

                                </td>

                                <td className="p-4 font-bold text-gray-900">

                                    ₺ {service.price}

                                </td>

                                <td className="p-4 text-right space-x-2">

                                    <button
                                        onClick={() =>
                                            openModal(
                                                'service',
                                                service
                                            )
                                        }

                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                    >

                                        Düzenle

                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteItem(
                                                'service',
                                                service.id
                                            )
                                        }

                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >

                                        Sil

                                    </button>

                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    )
}