import { LoginScreen, Messenger } from './components';
import { useCredentials } from './hooks';

export function App() {
  const { creds, login, logout } = useCredentials();

  return creds ? <Messenger key={creds.idInstance} creds={creds} onLogout={logout} /> : <LoginScreen onLogin={login} />;
}
