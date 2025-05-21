import React, { useState } from 'react';

type SocialLink = {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
};

const DEFAULT_SOCIALS: SocialLink[] = [
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/yourusername',
    icon: '🐙',
    color: '#24292e'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/yourusername',
    icon: '💼',
    color: '#0077b5'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    url: 'https://twitter.com/yourusername',
    icon: '🐦',
    color: '#1DA1F2'
  },
  {
    id: 'email',
    name: 'Email',
    url: 'mailto:your@email.com',
    icon: '✉️',
    color: '#D44638'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    url: 'https://yourportfolio.com',
    icon: '🌐',
    color: '#9C27B0'
  }
];

interface BoardProps {
  socials?: SocialLink[];
}

const Board: React.FC<BoardProps> = ({ socials = DEFAULT_SOCIALS }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  return (
    <div className="flex flex-col gap-2.5 z-10 p-4 min-w-[200px]">
      {socials.map(social => {
        const isHovered = hoveredCard === social.id;
        
        return (
          <a 
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center p-3 rounded border-l-4 text-white no-underline
              transition-all duration-200 shadow-md overflow-hidden
              whitespace-nowrap text-ellipsis cursor-pointer
              w-full max-w-[220px]
              ${isHovered ? 'shadow-lg' : ''}
              ${isHovered ? '-translate-x-1' : ''}
              
              md:max-w-[400px] md:w-[90%]
              ${isHovered ? 'md:-translate-y-1' : ''}
              
              sm:min-w-[40px] sm:max-w-[40px] sm:justify-center
              ${isHovered ? 'sm:min-w-[180px] sm:max-w-[180px] sm:justify-start' : ''}
            `}
            style={{
              backgroundColor: isHovered ? `${social.color}30` : `${social.color}15`,
              borderColor: social.color
            }}
            onMouseEnter={() => setHoveredCard(social.id)}
            onMouseLeave={() => setHoveredCard(null)}
            aria-label={`${social.name} link`}
          >
            <div className="text-xl mr-2.5 min-w-[20px] flex justify-center">
              {social.icon}
            </div>
            <span className='text-sm font-medium'>
              {social.name}
            </span>
          </a>
        );
      })}
    </div>
  );
};

export default Board;
