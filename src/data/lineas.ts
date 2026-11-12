import { Droplets, Scale, ShieldCheck, Sparkles, Brain, Dumbbell } from 'lucide-react'

// Líneas del catálogo, en el orden en que se muestran (portada y catálogo).
// Desde el 11-11-2026 la web es de todo el catálogo: Sport va al final.
// linea = valor del campo «linea» en catalogo.ts · color = acento de la línea (ver DESIGN.md)
export const LINEAS = [
  {
    id: 'cat-base',
    linea: 'Sistema Base',
    color: '#0094DE',
    icon: Droplets,
    titulo: 'Sistema Base',
    desc: 'Tu rutina diaria: vitaminas, fibra, probióticos y energía de base.',
  },
  {
    id: 'cat-fit',
    linea: 'Línea Fit',
    color: '#16A34A',
    icon: Scale,
    titulo: 'Fit',
    desc: 'Proteínas, cafés y bebidas para acompañar tu ejercicio y tu alimentación.',
  },
  {
    id: 'cat-defensas',
    linea: 'Bebidas de bienestar',
    color: '#F59E0B',
    icon: ShieldCheck,
    titulo: 'Bienestar',
    desc: 'Tés, cafés y bebidas con ganoderma, aloe y betaglucanos.',
  },
  {
    id: 'cat-belleza',
    linea: 'Línea Belleza',
    color: '#E11D74',
    icon: Sparkles,
    titulo: 'Belleza',
    desc: 'Colágeno, antioxidantes y bebidas para tu rutina de cuidado.',
  },
  {
    id: 'cat-mental',
    linea: 'Línea Vigor Mental',
    color: '#7C3AED',
    icon: Brain,
    titulo: 'Enfoque Mental',
    desc: 'Bebidas y gránulos con aminoácidos para tus días intensos.',
  },
  {
    id: 'cat-sport',
    linea: 'Línea Sport',
    color: '#F58220',
    icon: Dumbbell,
    titulo: 'Sport',
    desc: 'Bebidas para antes, durante y después de entrenar.',
  },
]

// Evento para abrir una línea del catálogo desde otra sección (detail = id de la línea)
export const EVENTO_LINEA = 'elegir-linea'
