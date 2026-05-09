import { Calendar, momentLocalizer }
    from 'react-big-calendar'

import moment
    from 'moment'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer =
    momentLocalizer(moment)

export default function AppointmentCalendar({

    appointments,

    services,

    employees

}) {

    // EVENTS
    const events = appointments.map(app => {

        const service =
            services.find(
                s => s.id === app.service_id
            )

        const employee =
            employees.find(
                e => e.id === app.employee_id
            )

        // START
        const start =
            new Date(
                `${app.appointment_date}T${app.appointment_start_time}`
            )

        // END
        const end =
            new Date(
                `${app.appointment_date}T${app.end_time}`
            )

        return {

            title:

                `${app.customer_name}
         - ${service?.title}
         - ${employee?.full_name}`,

            start,

            end
        }
    })

    return (

        <div className="bg-white p-4 rounded-2xl shadow border border-gray-200 h-[700px]">

            <Calendar
                localizer={localizer}

                events={events}

                startAccessor="start"

                endAccessor="end"

                style={{
                    height: '100%'
                }}
            />

        </div>
    )
}