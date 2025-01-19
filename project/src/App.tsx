import React, { useEffect, useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {!session ? <Auth /> : <Dashboard />}
    </div>
  );
}

export default App;