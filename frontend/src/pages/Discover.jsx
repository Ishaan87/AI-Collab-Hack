import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Search, MapPin, Users, Calendar, Loader2, Trophy, ArrowRight } from 'lucide-react';

const tabsData = [
  { id: 'hackathons', label: 'Hackathons', type: 'hackathon', imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca46a2e87f778fe899f3b_am_6_personas_sellers%202.avif', glow: 'from-[#E8400D] via-[#FFEED8] to-[#D0B2FF]' },
  { id: 'case-competitions', label: 'Case Competitions', type: 'case_study', imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca8430056a00245b85bf7_am_7_personas_sales_leaders%202.avif', glow: 'from-[#FFEED8] via-[#FFD7F0] to-[#D0B2FF]' },
  { id: 'design-challenges', label: 'Design Challenges', type: 'design', imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca84f860e0b6ca0cabcda_am_8_personas_founders_2%202.avif', glow: 'from-[#99FFF9] via-[#C6ECE9] to-[#D0B2FF]' },
  { id: 'coding-contests', label: 'Coding Contests', type: 'coding', imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca84f1064e578674a4da0_am_9_personas_revops%202.avif', glow: 'from-[#B7EFB2] via-[#FFEF99] to-[#99FFF9]' },
  { id: 'other-events', label: 'Other Events', type: 'other', imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca84f84f3bc82100d704e_am_10_personas_marketers%202.avif', glow: 'from-[#E8400D] via-[#FFEED8] to-[#99FFF9]' }
];

const Discover = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const type = tabsData[activeTab].type;
      const res = await api.get(`/competitions?type=${type}&search=${search}&limit=20`);
      setCompetitions(res.competitions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCompetitions();
    }, 300);
    return () => clearTimeout(delay);
  }, [activeTab, search]);

  return (
    <section className="bg-[#fcfcfc] dark:bg-[#0f0f0f] py-8 relative overflow-hidden font-sans min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Discover Events</h1>
            <p className="text-gray-500 mt-1">Find and join the best STEM competitions.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, tag, or host..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Categories / Tabs Container */}
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2a2a2a] rounded-3xl p-2 flex overflow-x-auto hide-scrollbar gap-2 mb-10 shadow-sm">
          {tabsData.map((tab, index) => {
            const isActive = activeTab === index;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`relative flex-1 min-w-[180px] h-[200px] flex flex-col items-center pt-5 rounded-[20px] transition-all duration-300 cursor-pointer overflow-hidden ${isActive
                  ? 'bg-gray-50 border border-gray-200 shadow-inner'
                  : 'border border-transparent hover:bg-gray-50/50'
                  }`}
              >
                <span className={`text-[15px] font-bold z-10 transition-colors duration-300 ${isActive ? 'text-indigo-900' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
                <img
                  src={tab.imgSrc}
                  alt={tab.label}
                  className={`mt-auto w-auto h-[120px] object-contain z-10 transition-all duration-300 ${isActive ? 'opacity-100 scale-105' : 'opacity-50 grayscale'}`}
                />
                <div className={`absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[120px] h-[80px] bg-gradient-to-r ${tab.glow} blur-[20px] rounded-[100%] transition-opacity duration-500 z-0 ${isActive ? 'opacity-80' : 'opacity-0'}`} />
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No events found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {competitions.map((comp) => (
              <div key={comp.id} className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer" onClick={() => navigate(`/competitions/${comp.id}`)}>
                {/* Banner Banner */}
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  {comp.banner_url ? (
                    <img src={comp.banner_url} alt={comp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100"></div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {comp.prize_pool ? `$${comp.prize_pool.toLocaleString()}` : 'No Prize'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Organizer info */}
                  <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    {comp.organizer_logo_url && <img src={comp.organizer_logo_url} className="w-4 h-4 rounded-full" />}
                    <span>{comp.organizer || 'Independent'}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {comp.title}
                  </h3>

                  <div className="space-y-2 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm tracking-tight text-gray-500">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(comp.start_date).toLocaleDateString()} - {new Date(comp.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm tracking-tight text-gray-500">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {comp.is_online ? 'Online / Remote' : (comp.location || 'Location TBA')}
                    </div>
                    <div className="flex items-center text-sm tracking-tight text-gray-500">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {comp.registered_count} Registered (Teams of {comp.min_team_size}-{comp.max_team_size})
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Discover;