export default function EmployeeTable({

    employees,

    openModal,

    deleteItem

}) {

    return (

        <div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-extrabold text-gray-800">

                        Uzman Portföyü

                    </h2>

                    <p className="text-gray-500 text-sm">

                        Merkez kadrosundaki çalışanları yönetin.

                    </p>

                </div>

                <button
                    onClick={() =>
                        openModal('employee')
                    }

                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shadow-lg"
                >

                    Uzman Ekle

                </button>

            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">

                <table className="w-full text-left border-collapse">

                    <thead>

                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">

                            <th className="p-4">
                                Uzman Adı
                            </th>

                            <th className="p-4">
                                İletişim
                            </th>

                            <th className="p-4 text-right">
                                İşlem
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">

                        {employees.map(employee => (

                            <tr
                                key={employee.id}
                                className="hover:bg-gray-50"
                            >

                                <td className="p-4 font-bold text-gray-800">

                                    {employee.full_name}

                                </td>

                                <td className="p-4 text-gray-500">

                                    {employee.phone}

                                </td>

                                <td className="p-4 text-right space-x-2">

                                    <button
                                        onClick={() =>
                                            openModal(
                                                'employee',
                                                employee
                                            )
                                        }

                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                    >

                                        Düzenle

                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteItem(
                                                'employee',
                                                employee.id
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