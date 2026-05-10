import { useEffect, useState } from 'react'
import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from './lib/supabase'
import LoginPage from './components/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'

export default function App() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    // PUSH NOTIFICATION
    useEffect(() => {
        const setupPush = async () => {
            try {
                // Listener'ları ÖNCE ekle
                await PushNotifications.addListener('registration', async (token) => {
                    console.log('FCM TOKEN:', token.value)

                    // Token'ı Supabase'e kaydet
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                        await supabase
                            .from('user_tokens')
                            .upsert({
                                user_id: user.id,
                                fcm_token: token.value,
                                updated_at: new Date().toISOString()
                            })
                    }
                })

                await PushNotifications.addListener('registrationError', (err) => {
                    console.log('REGISTER ERROR:', err)
                })

                await PushNotifications.addListener('pushNotificationReceived', (notification) => {
                    console.log('PUSH GELDİ:', notification)
                })

                await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                    console.log('BİLDİRİME TIKLANDI:', action)
                })

                // İzin iste
                const result = await PushNotifications.requestPermissions()
                console.log('PERMISSION:', result)

                if (result.receive === 'granted') {
                    await PushNotifications.register()
                } else {
                    console.log('Bildirim izni reddedildi')
                }

            } catch (error) {
                console.error('Push setup hatası:', error)
            }
        }

        setupPush()

        return () => {
            PushNotifications.removeAllListeners()
        }
    }, [])

    // SESSION CHECK
    useEffect(() => {
        supabase.auth
            .getSession()
            .then(({ data }) => {
                setSession(data.session)
                setLoading(false)
            })

        const { data: listener } = supabase.auth.onAuthStateChange(
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
        return <LoginPage />
    }

    // LOGOUT
    async function logout() {
        await supabase.auth.signOut()
    }

    // DASHBOARD
    return (
        <AdminDashboard logout={logout} />
    )
}