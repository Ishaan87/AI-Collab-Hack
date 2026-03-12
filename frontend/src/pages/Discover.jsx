import React, { useState } from 'react';

const tabsData = [
  {
    id: 'hackathons',
    label: 'Hackathons',
    imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca46a2e87f778fe899f3b_am_6_personas_sellers%202.avif',
    glow: 'from-[#E8400D] via-[#FFEED8] to-[#D0B2FF]',
    content: {
      title: 'Build winning hackathon teams',
      linkText: 'Explore Hackathons',
      feature1Title: 'Match by tech stack',
      feature1Desc: 'Find the perfect mix of frontend, backend, and UI/UX talent based on verified GitHub activity and skill weighting.',
      feature2Title: 'Checkpoint verification',
      feature2Desc: 'Keep your team accountable and on track with milestone tracking, reducing the dreaded hackathon drop-out rate.'
    }
  },
  {
    id: 'case-competitions',
    label: 'Case Competitions',
    imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca8430056a00245b85bf7_am_7_personas_sales_leaders%202.avif',
    glow: 'from-[#FFEED8] via-[#FFD7F0] to-[#D0B2FF]',
    content: {
      title: 'Form strategic consulting squads',
      linkText: 'Explore Case Competitions',
      feature1Title: 'Interdisciplinary matching',
      feature1Desc: 'Combine analytical minds with presentation experts to tackle complex business cases effectively.',
      feature2Title: 'Past performance weighting',
      feature2Desc: 'Use our Elo-style peer review system to find reliable teammates with proven strategic and presentation acumen.'
    }
  },
  {
    id: 'design-challenges',
    label: 'Design Challenges',
    imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca84f860e0b6ca0cabcda_am_8_personas_founders_2%202.avif',
    glow: 'from-[#99FFF9] via-[#C6ECE9] to-[#D0B2FF]',
    content: {
      title: 'Connect with creative visionaries',
      linkText: 'Explore Design Challenges',
      feature1Title: 'Portfolio-backed matching',
      feature1Desc: 'Team up with UX researchers, UI designers, and 3D artists with verified creative credentials and peer ratings.',
      feature2Title: 'Domain-specific podiums',
      feature2Desc: 'Showcase your specific design skills and climb the leaderboards in creative-first competitions.'
    }
  },
  {
    id: 'coding-contests',
    label: 'Coding Contests',
    imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca84f1064e578674a4da0_am_9_personas_revops%202.avif',
    glow: 'from-[#B7EFB2] via-[#FFEF99] to-[#99FFF9]',
    content: {
      title: 'Dominate algorithmic programming',
      linkText: 'Explore Coding Contests',
      feature1Title: 'Verified Codeforces stats',
      feature1Desc: "Don't rely on self-reported skills. We sync directly with LeetCode and Codeforces APIs to verify competitive programming ranks.",
      feature2Title: 'Complementary logic pairing',
      feature2Desc: "Find partners whose algorithmic strengths cover your weaknesses to maximize your team's overall point totals."
    }
  },
  {
    id: 'other-events',
    label: 'Other Events',
    imgSrc: 'https://cdn.prod.website-files.com/6350808bc45bd0c902af10e6/66aca84f84f3bc82100d704e_am_10_personas_marketers%202.avif',
    glow: 'from-[#E8400D] via-[#FFEED8] to-[#99FFF9]',
    content: {
      title: 'Custom team formation for anything',
      linkText: 'Explore Custom Events',
      feature1Title: 'Adaptable skill clustering',
      feature1Desc: "Whether it's a robotics build or a research paper, define your custom parameters and let AI build the optimal squad.",
      feature2Title: 'Build your STEM reputation',
      feature2Desc: 'Accumulate reliability ratings across all event types to become the most sought-after collaborator on campus.'
    }
  }
];

const Discover = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-white dark:bg-[#0f0f0f] py-16 relative overflow-hidden font-sans transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Tabs Container */}
        <div className="bg-[#fcfcfc] dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-[20px] p-2 flex overflow-x-auto hide-scrollbar gap-2 mb-12 shadow-sm dark:shadow-none">
          {tabsData.map((tab, index) => {
            const isActive = activeTab === index;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`relative flex-1 min-w-[180px] h-[240px] flex flex-col items-center pt-6 rounded-[16px] transition-all duration-300 cursor-pointer overflow-hidden ${isActive
                  ? 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] shadow-sm'
                  : 'border border-transparent hover:bg-gray-100/50 dark:hover:bg-[#1e1e1e]'
                  }`}
              >
                <span className={`text-[17px] font-medium z-10 transition-colors duration-300 ${isActive
                  ? 'text-gray-900 dark:text-[#f5f5f4]'
                  : 'text-gray-400 dark:text-[#555]'
                  }`}>
                  {tab.label}
                </span>

                <img
                  src={tab.imgSrc}
                  alt={tab.label}
                  className={`mt-auto w-auto h-[140px] object-contain z-10 transition-all duration-300 dark:invert ${isActive
                    ? 'opacity-100'
                    : 'opacity-40 dark:opacity-50 mix-blend-multiply dark:mix-blend-normal'
                    }`}
                />

                {/* Gradient glow blob — active only */}
                <div className={`absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[120px] h-[80px] bg-gradient-to-r ${tab.glow} blur-[20px] rounded-[100%] transition-opacity duration-500 z-0 ${isActive ? 'opacity-80' : 'opacity-0'}`} />
              </div>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24 pt-6 animate-fade-in">

          {/* Left: Title + CTA */}
          <div className="flex-[0.8] flex flex-col items-start">
            <h3 className="text-[32px] md:text-[40px] leading-[1.1] font-medium text-[#1a1a1a] dark:text-[#f5f5f4] mb-8 tracking-tight">
              {tabsData[activeTab].content.title}
            </h3>
            <button className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] shadow-sm text-black dark:text-[#f5f5f4] px-6 py-3 rounded-full font-medium text-[15px] hover:bg-gray-50 dark:hover:bg-[#252525] hover:border-[#7856FF] dark:hover:border-[#7856FF] hover:text-[#7856FF] dark:hover:text-[#c4b5fd] transition-all inline-flex items-center gap-2">
              {tabsData[activeTab].content.linkText}
              <span className="text-gray-400 dark:text-[#555]">&rarr;</span>
            </button>
          </div>

          {/* Right: Features */}
          <div className="flex-[1.2] flex flex-col sm:flex-row gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="flex-1">
              <h4 className="text-[20px] font-medium text-[#1a1a1a] dark:text-[#f5f5f4] mb-3">
                {tabsData[activeTab].content.feature1Title}
              </h4>
              <p className="text-[16px] text-gray-500 dark:text-[#9ca3af] leading-[1.6]">
                {tabsData[activeTab].content.feature1Desc}
              </p>
            </div>

            {/* Vertical divider */}
            <div className="hidden sm:block w-px bg-gray-200 dark:bg-[#2a2a2a]" />
            <div className="sm:hidden w-full h-px bg-gray-200 dark:bg-[#2a2a2a]" />

            {/* Feature 2 */}
            <div className="flex-1">
              <h4 className="text-[20px] font-medium text-[#1a1a1a] dark:text-[#f5f5f4] mb-3">
                {tabsData[activeTab].content.feature2Title}
              </h4>
              <p className="text-[16px] text-gray-500 dark:text-[#9ca3af] leading-[1.6]">
                {tabsData[activeTab].content.feature2Desc}
              </p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.35s ease-out forwards; }
      `}</style>
    </section>
  );
};

export default Discover;