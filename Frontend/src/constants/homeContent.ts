export type NavItem = {
  label: string
  to: string
}

export type StatItem = {
  label: string
  value: string
}

export type AboutCard = {
  id: string
  type: 'paragraph' | 'highlight'
  title?: string
  paragraphs: string[]
}

export const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Academics', to: '/academics' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Campus Life', to: '/campus-life' },
]

export const homeStats: StatItem[] = [
  { label: 'Students', value: '12,500+' },
  { label: 'Programs', value: '80+' },
  { label: 'Faculty', value: '650+' },
  { label: 'Employability', value: '94%' },
]

export const aboutCards: AboutCard[] = [
  {
    id: 'about-description',
    type: 'paragraph',
    paragraphs: [
      'Aura Heights University was established in 2005 and is located in the heart of the city. It is accredited by the National Accreditation Board and offers a wide range of programs to cater to diverse interests. The university is known for its commitment to academic excellence and innovation, providing students with a dynamic learning environment.',
    ],
  },
  {
    id: 'about-courses',
    type: 'paragraph',
    paragraphs: [
      'Our main courses include STEM disciplines, business administration, humanities, and nursing, ensuring that students are well-prepared for their future careers.',
      'Aura Heights University is a premier institution dedicated to academic excellence, innovation, and leadership. Founded on the principles of integrity, diversity, and lifelong learning, AHU offers a dynamic environment where students thrive academically and personally.',
    ],
  },
  {
    id: 'about-vision',
    type: 'highlight',
    title: 'Our Vision',
    paragraphs: [
      'To be a leading institution of higher learning recognized for excellence in education, research, and community engagement.',
    ],
  },
  {
    id: 'about-mission',
    type: 'highlight',
    title: 'Our Mission',
    paragraphs: [
      'To provide quality education that empowers students to become innovative leaders and responsible global citizens.',
    ],
  },
]

export const roleHomePathMap: Record<string, string> = {
  ADMIN: '/admin',
  STUDENT: '/student',
  FACULTY: '/faculty',
}