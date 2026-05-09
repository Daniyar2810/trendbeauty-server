export default function Header({

    logout

}) {

    return (

        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row gap-4 md:gap-0 justify-between md:items-center shrink-0 shadow-sm">

            {/* LEFT */}
            <div className="flex items-center gap-2">

                <div>

                    <h1 className="font-bold text-lg text-gray-800 leading-tight">

                        Güzellik Merkezi

                    </h1>

                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">

                        Yönetim Paneli

                    </p>

                </div>

            </div>

            {/* RIGHT */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 w-full md:w-auto">

                <button
                    className="text-sm font-medium text-gray-500 hover:text-rose-600 transition px-3 py-2"
                >

                    Siteyi Görüntüle

                </button>

                <button
                    onClick={logout}

                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-lg transition font-semibold text-sm"
                >

                    Güvenli Çıkış

                </button>

            </div>

        </header>
    )
}