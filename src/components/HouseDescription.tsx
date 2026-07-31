'use client'

import { motion } from 'framer-motion'
import { MapPin, Waves, Mountain, Trees, Flame, Wind } from 'lucide-react'

const highlights = [
  { icon: Waves, label: 'Sobre laguna', desc: 'Vista directa al agua' },
  { icon: Mountain, label: 'Pileta XL + jacuzzi', desc: 'Doble, con vista panorámica' },
  { icon: Flame, label: 'Fogón y parrilla', desc: 'Noches al aire libre' },
  { icon: Trees, label: 'Golf, tenis, fútbol', desc: 'Acceso gratuito en el barrio' },
  { icon: Wind, label: 'Luminosa y abierta', desc: 'Ventanales y vigas de madera' },
  { icon: MapPin, label: '40 min de CABA', desc: 'Privacidad total' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const reviews = [
  {
    name: 'Josefina',
    text: 'Tuvimos una estadía más que perfecta. La casa es muy hermosa, cómoda y disfrutable. Victoria una gran anfitriona, atenta y cálida. Ojalá podamos volver pronto.',
  },
  {
    name: 'Luxury Hosting',
    text: 'Todo excelente. La casa es hermosa, súper cómoda y cuidada en cada detalle. La pasamos increíble. Súper recomendable.',
  },
  {
    name: 'Andrea',
    text: 'Hermosa casa, amplia, de diseñador, el patio impecable, la piscina bellísima, mantenida, excelente vista, confortable. Volvería a alojarme.',
  },
  {
    name: 'Gabe',
    text: 'La casa de Victoria fue la joya de nuestro viaje. La escapada perfecta para nuestra familia. Tiene la combinación perfecta de interior y exterior. El barrio es súper tranquilo. Nuestra hija se divirtió mucho en la pileta y viendo a los patos en el lago. Recomiendo este lugar a cualquiera que busque un hogar cómodo para relajarse.',
  },
]

export default function HouseDescription() {
  return (
    <section className="relative px-4 lg:px-12 pt-24 lg:pt-32 pb-16 lg:pb-20 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* ── Editorial headline ─────────────────────────── */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
            La Propiedad
          </span>
          <h2 className="font-heading text-4xl lg:text-6xl text-foreground mt-4 leading-tight">
            Despertarse con la laguna
            <span className="block text-muted text-2xl lg:text-3xl font-light mt-2">
              frente a tus ojos
            </span>
          </h2>
        </motion.div>

        {/* ── Evocative description ──────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 mb-16">
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-base lg:text-lg text-foreground/80 leading-relaxed">
              Tomar el primer café mientras el agua refleja el amanecer, y pasar el día
              entre la pileta infinita y el jacuzzi doble con vistas al agua. Todo
              esto a 40 minutos de Buenos Aires, en un entorno de absoluta privacidad
              y silencio sobre laguna con pileta XL, fogonero y parrilla.
            </p>
            <p className="text-base lg:text-lg text-foreground/80 leading-relaxed mt-6">
              Amplia, luminosa y rodeada de naturaleza. Acceso gratuito a golf, tenis
              y fútbol dentro del barrio.
            </p>
          </motion.div>

          <motion.div
            className="lg:col-span-2 border-l border-border pl-6 lg:pl-10"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <span className="text-7xl lg:text-8xl font-heading font-bold text-accent/20 leading-none block -mt-2">
              &rsquo;22
            </span>
            <p className="text-sm text-foreground/60 mt-2 leading-relaxed">
              Casa de diseño Mid-Century Modern inaugurada en 2022. Una planta en &ldquo;L&rdquo;
              con amplios ventanales, techos con vigas de madera y una paleta de colores
              que la hace irrepetible.
            </p>
          </motion.div>
        </div>

        {/* ── Divider ────────────────────────────────────── */}
        <div className="w-16 h-px bg-accent/40 mb-16" />

        {/* ── Key highlights grid ────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
          {highlights.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <Icon size={18} className="text-accent" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {item.label}
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* ── Reviews from Airbnb ────────────────────────── */}
        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
              Reseñas
            </span>
            <h3 className="font-heading text-3xl lg:text-4xl text-foreground mt-3 mb-2">
              Lo que dicen los huéspedes
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {reviews.map((review, i) => (
              <motion.div
                key={review.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group relative border border-border/40 rounded-xl p-6 lg:p-8 bg-background hover:border-accent/20 transition-colors"
              >
                {/* Decorative quote */}
                <span className="absolute top-4 left-5 text-5xl leading-none text-accent/10 font-serif select-none pointer-events-none">
                  &ldquo;
                </span>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg
                      key={s}
                      className="w-4 h-4 text-accent"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review text */}
                <p className="text-sm lg:text-base text-foreground/80 leading-relaxed relative z-10">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Reviewer name */}
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-heading font-semibold text-accent">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-heading font-semibold text-foreground">
                    {review.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer: disclaimer + link */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-xs text-muted leading-relaxed">
              Reseñas extraídas de la publicación en{' '}
              <a
                href="https://www.airbnb.com.ar/rooms/684320818134699916/reviews?source_impression_id=p3_1785456774_P3hRqm2UsNa0UTnb&review_page_entrypoint=show_all"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-accent transition-colors"
              >
                Airbnb
              </a>
              .
            </p>

            <a
              href="https://www.airbnb.com.ar/rooms/684320818134699916/reviews?source_impression_id=p3_1785456774_P3hRqm2UsNa0UTnb&review_page_entrypoint=show_all"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-heading font-semibold tracking-wide uppercase text-accent border border-accent/30 rounded-full px-5 py-2 hover:bg-accent hover:text-white transition-colors shrink-0"
            >
              Ver todas las reseñas
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* ── Location map ──────────────────────────────── */}
        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
              Ubicación
            </span>
            <h3 className="font-heading text-3xl lg:text-4xl text-foreground mt-3 mb-2">
              El Cantón, Belén de Escobar
            </h3>
            <p className="text-sm text-muted">
              A 40 minutos de Buenos Aires
            </p>
          </motion.div>

          {/* Map embed */}
          <motion.div
            className="mt-8 relative overflow-hidden rounded-xl border border-border/40"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="aspect-[21/9] w-full">
              <iframe
                src="https://www.google.com/maps?q=Mid-Century+Veek+Bel%C3%A9n+de+Escobar&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </motion.div>

          {/* Open in Maps link */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a
              href="https://maps.app.goo.gl/VU8UBxGEK4tH6sAM9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-heading font-semibold tracking-wide uppercase text-accent border border-accent/30 rounded-full px-5 py-2 hover:bg-accent hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Abrir en Google Maps
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
