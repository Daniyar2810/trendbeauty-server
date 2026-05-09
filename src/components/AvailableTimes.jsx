import { useEffect, useState }
    from 'react'

import { supabase }
    from '../lib/supabase'

export default function AvailableTimes({

    employeeId,

    appointmentDate,

    service

}) {

    const [availableTimes, setAvailableTimes] =
        useState([])

    const [loading, setLoading] =
        useState(false)

    // TÜM SAATLER
    const allTimes = [

        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00"

    ]

    // LOAD
    async function loadAvailableTimes() {

        // BOŞ KONTROL
        if (
            !employeeId ||
            !appointmentDate
        ) {

            setAvailableTimes([])

            return
        }

        setLoading(true)

        // DATABASE
        const {
            data: appointments,
            error
        } = await supabase
            .from('appointments')
            .select('*')
            .eq(
                'employee_id',
                employeeId
            )

        if (error) {

            console.log(error)

            setLoading(false)

            return
        }

        console.log(
            'DATABASE:',
            appointments
        )

        // MÜSAİT DİZİ
        let filteredTimes = []

        // TÜM SAATLERİ KONTROL ET
        allTimes.forEach(time => {

            let isBusy = false

            // SAATİ DAKİKAYA ÇEVİR
            const timeMinutes =

                parseInt(
                    time.split(':')[0]
                ) * 60 +

                parseInt(
                    time.split(':')[1]
                )

            // TÜM RANDEVULAR
            appointments.forEach(app => {

                // GÜVENLİK
                if (
                    !app.appointment_start_time ||
                    !app.end_time
                ) {

                    return
                }

                // DB SAATLERİ
                const start =
                    app.appointment_start_time.slice(0, 5)

                const end =
                    app.end_time.slice(0, 5)

                // DAKİKAYA ÇEVİR
                const startMinutes =

                    parseInt(
                        start.split(':')[0]
                    ) * 60 +

                    parseInt(
                        start.split(':')[1]
                    )

                const endMinutes =

                    parseInt(
                        end.split(':')[0]
                    ) * 60 +

                    parseInt(
                        end.split(':')[1]
                    )

                console.log({

                    time,

                    start,

                    end,

                    timeMinutes,

                    startMinutes,

                    endMinutes

                })                // ÇAKIŞIYORSA
                if (

                    timeMinutes >= startMinutes &&

                    timeMinutes < endMinutes

                ) {

                    console.log(
                        'DOLU:',
                        time
                    )

                    isBusy = true
                }

            })

            // BOŞSA EKLE
            if (!isBusy) {

                filteredTimes.push(time)
            }

        })

        console.log(
            'MÜSAİT:',
            filteredTimes
        )

        setAvailableTimes(filteredTimes)

        setLoading(false)
    }

    // WATCH
    useEffect(() => {

        loadAvailableTimes()

    }, [

        employeeId,

        appointmentDate,

        service

    ])

    return (

        <div>

            <h2 className="font-bold mb-4 text-lg">

                Müsait Saatler

            </h2>

            {/* LOADING */}
            {loading && (

                <p>

                    Yükleniyor...

                </p>
            )}

            {/* TIMES */}
            {!loading && (

                <div className="grid grid-cols-3 gap-3">

                    {availableTimes.map(time => (

                        <button
                            key={time}

                            className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl py-3 font-semibold transition"
                        >

                            {time}

                        </button>
                    ))}

                </div>
            )}

        </div>
    )
}