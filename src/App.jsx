import { useEffect, useState }
    from 'react'

import {
    PushNotifications
} from '@capacitor/push-notifications'

import { supabase }
    from './lib/supabase'

import LoginPage
    from './components/LoginPage'

import AdminDashboard
    from './pages/AdminDashboard'

export default function App() {

    const [session, setSession] =
        useState(null)

    const [loading, setLoading] =
        useState(true)

    // PUSH NOTIFICATION
    useEffect(() => {
        console.log(
            'Push effect başladı'
        );
        PushNotifications
            .requestPermissions()

            .then((result) => {

                console.log(
                    'PERMISSION:',
                    result
                );

                if (
                    result.receive ===
                    'granted'
                ) {

                    PushNotifications
                        .register();
                }
            });

        PushNotifications.addListener(
            'registration',

            (token) => {

                console.log(
                    'FCM TOKEN:',
                    token.value
                );
            }
        );

        PushNotifications.addListener(
            'registrationError',

            (err) => {

                console.log(
                    'REGISTER ERROR:',
                    err
                );
            }
        );

        PushNotifications.addListener(
            'pushNotificationReceived',

            (notification) => {

                console.log(
                    'PUSH GELDİ:',
                    notification
                );
            }
        );

    }, []);

    // SESSION CHECK
    useEffect(() => {

        supabase.auth
            .getSession()
            .then(({ data }) => {

                setSession(data.session)

                setLoading(false)
            })

        const {
            data: listener
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {

                setSession(session)
            }
        )

        return () => {

            listener.subscription.unsubscribe()
        }

    }, [])

    // LOADING
    if (loading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                Yükleniyor...

            </div>
        )
    }

    // LOGIN
    if (!session) {

        return (

            <LoginPage />
        )
    }

    // LOGOUT
    async function logout() {

        await supabase.auth.signOut()
    }

    // DASHBOARD
    return (

        <AdminDashboard
            logout={logout}
        />
    )
}