import { AuthScreen, Onboarding } from '../components/AuthScreen'
import { BudgetApp } from '../components/BudgetApp'
import { useAuth } from '../context/AuthContext'

function AppRouter() {
  const { auth, data, signIn, completeOnboarding, signOut, ...app } = useAuth()
  if (!auth) return <AuthScreen onAuthenticated={signIn} />
  if (auth.onboarding) return <Onboarding profile={data.profile} onComplete={completeOnboarding} onSignOut={signOut} />
  return <BudgetApp auth={auth} data={data} signOut={signOut} {...app} />
}

export { AppRouter }
