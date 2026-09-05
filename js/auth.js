const SUPABASE_URL = 'https://tpeqgjgeeyrepaijdcuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZXFnamdlZXlyZXBhaWpkY3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NzczMjMsImV4cCI6MjEwNDE1MzMyM30.YEAcpOlAiaFdYHniMZdzM684NYiF5fVPVXUaRGWraC4';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false // Disables URL fragment parsing loops on mobile
  }
});

let currentUserProfile = null;

// Lock down page: redirect to login if no active session
async function requireAuth() {
  const { data: { session } } = await db.auth.getSession();
  
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  // Fetch username from profiles table
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  currentUserProfile = profile;
  updateHeaderNav(profile ? profile.username : 'User');
  return session.user;
}

// Update header to display username and a logout button
function updateHeaderNav(username) {
  const nav = document.querySelector('header nav');
  if (nav && !document.getElementById('logoutBtn')) {
    const userBadge = document.createElement('span');
    userBadge.style.cssText = 'color: var(--accent-color); font-weight: bold; margin-left: 1rem;';
    userBadge.textContent = `@${username}`;

    const logoutBtn = document.createElement('a');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.href = '#';
    logoutBtn.style.color = '#ef4444';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = async () => {
      await db.auth.signOut();
      window.location.href = 'login.html';
    };

    nav.appendChild(userBadge);
    nav.appendChild(logoutBtn);
  }
}

// Run auth check automatically when the page loads
requireAuth();
