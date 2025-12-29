import re

# Read file
with open('/home/pvrolo/legal-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add search states after showMenu
old_state = "const [showMenu, setShowMenu] = useState(false);"
new_state = """const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{cases: Case[], clients: any[]}>({cases: [], clients: []});"""

content = content.replace(old_state, new_state)

# 2. Add search function after loadDashboard function
search_func = """
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults({cases: [], clients: []});
      return;
    }
    try {
      const [casesRes, clientsRes] = await Promise.all([
        fetch(\`/api/cases?search=\${encodeURIComponent(query)}\`),
        fetch(\`/api/clients?search=\${encodeURIComponent(query)}\`),
      ]);
      const casesData = await casesRes.json();
      const clientsData = await clientsRes.json();
      setSearchResults({
        cases: casesData.cases || [],
        clients: clientsData || [],
      });
    } catch (e) {
      console.error('Search error:', e);
    }
  };
"""

# Find position after loadDashboard function ends
load_end = content.find("setLoading(false);\n  };")
if load_end > 0:
    insert_pos = load_end + len("setLoading(false);\n  };")
    content = content[:insert_pos] + search_func + content[insert_pos:]

# 3. Add search icon button in header (before desktop nav)
old_nav_start = '{/* Desktop Nav */}'
new_nav_with_search = """{/* Search */}
            <div className="relative">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {showSearch && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-3 border-b">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Buscar casos, clientes..."
                      className="w-full px-4 py-2 bg-slate-100 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  {searchQuery.length >= 2 && (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.cases.length > 0 && (
                        <div className="p-2">
                          <p className="text-xs font-semibold text-slate-400 px-2 mb-1">CASOS</p>
                          {searchResults.cases.slice(0,5).map(c => (
                            <Link key={c.id} href={`/casos/${c.id}`} className="block px-3 py-2 hover:bg-slate-50 rounded-lg" onClick={() => setShowSearch(false)}>
                              <p className="text-sm font-medium text-slate-800">{c.matter}</p>
                              <p className="text-xs text-slate-500">{c.client.name}</p>
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.clients.length > 0 && (
                        <div className="p-2 border-t">
                          <p className="text-xs font-semibold text-slate-400 px-2 mb-1">CLIENTES</p>
                          {searchResults.clients.slice(0,5).map((cl: any) => (
                            <Link key={cl.id} href={`/clientes/${cl.id}`} className="block px-3 py-2 hover:bg-slate-50 rounded-lg" onClick={() => setShowSearch(false)}>
                              <p className="text-sm font-medium text-slate-800">{cl.name}</p>
                              <p className="text-xs text-slate-500">{cl.phone || cl.email}</p>
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.cases.length === 0 && searchResults.clients.length === 0 && (
                        <p className="p-4 text-center text-slate-400 text-sm">No se encontraron resultados</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Nav */}"""

content = content.replace(old_nav_start, new_nav_with_search)

# Write back
with open('/home/pvrolo/legal-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print("Search functionality added!")
