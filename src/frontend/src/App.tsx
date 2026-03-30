import { Canvas, useFrame } from "@react-three/fiber";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  ChevronDown,
  Clock,
  Facebook,
  Fish,
  Flame,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Star,
  Truck,
  UtensilsCrossed,
  X,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { MenuItem } from "./backend.d";
import { useActor } from "./hooks/useActor";

// Fish: mapped by dish name to the correct real food photo
const FISH_IMAGE_MAP: Record<string, string> = {
  "Malai Karil Boneless":
    "/assets/uploads/screenshot_20260328-220912_1-019d3949-6b05-774a-8853-06eb4200b9cb-9.jpg", // grilled/pan-fried fish fillets
  "Rohu Tandoori":
    "/assets/uploads/screenshot_20260329-073421_1-019d3949-6936-749f-95d2-e5dcc1a75718-8.jpg", // grilled whole fish tandoori-style
  "Rohu Karil Qash":
    "/assets/uploads/screenshot_20260328-221455_1-019d3949-6c19-721f-8517-a26ab370fe42-10.jpg", // prawn/seafood masala curry
  "Rohu Fried Qash":
    "/assets/uploads/screenshot_20260329-073403_1-019d3949-6f5f-722b-a786-8d88e88d9e03-11.jpg", // fried fish pieces
  "Malai Boti":
    "/assets/uploads/screenshot_20260329-073303_1-019d3949-74d4-72d2-bc06-2e199366c871-12.jpg", // fish tikka cubes
  Tikka:
    "/assets/uploads/screenshot_20260329-073324_1-019d3949-67a0-701a-931a-e29964fb35ce-5.jpg", // grilled spiced fish
  "Malai Boti Boneless":
    "/assets/uploads/screenshot_20260329-073303_1-019d3949-74d4-72d2-bc06-2e199366c871-12.jpg", // fish tikka cubes (boneless)
  "Tikka Boneless":
    "/assets/uploads/screenshot_20260328-220912_1-019d3949-6b05-774a-8853-06eb4200b9cb-9.jpg", // grilled fish fillets (boneless)
};
const FISH_FALLBACK =
  "/assets/uploads/screenshot_20260329-073421_1-019d3949-6936-749f-95d2-e5dcc1a75718-8.jpg";

// Chicken: mapped by dish name to the correct real food photo
const CHICKEN_IMAGE_MAP: Record<string, string> = {
  "Chicken Tikka":
    "/assets/uploads/screenshot_20260329-073259_1-019d3949-623d-7744-b9c3-9b47752ba3c9-2.jpg", // chicken tikka skewers on grill
  "Leg Piece":
    "/assets/uploads/screenshot_20260328-222002_2-019d3949-6607-778e-a27c-720be4308f2e-4.jpg", // roasted chicken leg quarter
  "Malai Boti":
    "/assets/uploads/screenshot_20260329-073315_1-019d3949-694b-70ac-a136-d725f2b49b52-7.jpg", // chicken boti skewers with naan
  "Achari Tikka":
    "/assets/uploads/screenshot_20260328-222002_3-019d3949-6412-7236-bc5b-6065a611ed42-3.jpg", // crispy chicken tenders
  "Malai Piece":
    "/assets/uploads/screenshot_20260328-221957_1-019d3949-5f0f-7535-be7a-6386094664e9-1.jpg", // fried chicken broast
  "Reshmi Kabab":
    "/assets/uploads/screenshot_20260329-073315_1-019d3949-694b-70ac-a136-d725f2b49b52-7.jpg", // chicken skewers
  "Afghani Kabab":
    "/assets/uploads/screenshot_20260329-073259_1-019d3949-623d-7744-b9c3-9b47752ba3c9-2.jpg", // grilled chicken skewers
};
const CHICKEN_FALLBACK =
  "/assets/uploads/screenshot_20260329-073259_1-019d3949-623d-7744-b9c3-9b47752ba3c9-2.jpg";

// Sides: mapped by dish name to the correct real food photo
const SIDES_IMAGE_MAP: Record<string, string> = {
  "Mineral Water":
    "/assets/uploads/images-019d39c8-576f-72f3-b028-9d09c1743214-3.jpeg", // mineral water bottle
  "Chips with Ketchup":
    "/assets/uploads/download_3-019d396d-8144-72a4-82b6-76bfa9ba7c73-2.jpeg", // french fries with ketchup
  "Aloo Bukhara Chutney":
    "/assets/uploads/download-019d39c6-a702-7413-8af4-bb56ba820859-1.jpeg", // aloo bukhara chutney
  "Special Hot Tea":
    "/assets/uploads/download_1-019d39c6-a805-706b-8592-27a9af90cb3d-2.jpeg", // tea cup
  "Roti / Naan":
    "/assets/uploads/download_4-019d396d-8143-77b9-815f-cdada44281ba-3.jpeg", // roti / naan flatbread
  "Fresh Salad":
    "/assets/uploads/download_5-019d396d-813e-703b-b23a-77e72bd61ea6-4.jpeg", // fresh salad
  "Cold Drink 1L":
    "/assets/uploads/download_2-019d396d-80d2-7176-8899-c19ca8303f38-1.jpeg", // cold drink bottles
  "Cold Drink 1.5L":
    "/assets/uploads/download_2-019d396d-80d2-7176-8899-c19ca8303f38-1.jpeg", // cold drink bottles
};
const SIDES_FALLBACK =
  "/assets/uploads/download_2-019d396d-80d2-7176-8899-c19ca8303f38-1.jpeg";

const HERO_IMAGE =
  "/assets/uploads/screenshot_20260329-073421_1-019d3949-6936-749f-95d2-e5dcc1a75718-8.jpg";

const WHATSAPP_URL = "https://wa.me/923312151472";
const MAPS_URL = "https://maps.app.goo.gl/y8tMB4bT17v7SG7m8";

const FALLBACK_FISH: MenuItem[] = [
  {
    name: "Malai Karil Boneless",
    price: 2000,
    unit: "kg",
    description: "ملائی کرل بونلیس",
    category: "fish",
  },
  {
    name: "Rohu Tandoori",
    price: 1400,
    unit: "kg",
    description: "رہو تندوری",
    category: "fish",
  },
  {
    name: "Rohu Karil Qash",
    price: 1500,
    unit: "kg",
    description: "رہو کرل قش",
    category: "fish",
  },
  {
    name: "Rohu Fried Qash",
    price: 1200,
    unit: "kg",
    description: "رہو فرائیڈ قش",
    category: "fish",
  },
  {
    name: "Malai Boti",
    price: 300,
    unit: "seekh / Rs.1500 plate",
    description: "1 Seekh Rs.300 | 1 Plate Rs.1500",
    category: "fish",
  },
  {
    name: "Tikka",
    price: 300,
    unit: "seekh / Rs.1500 plate",
    description: "1 Seekh Rs.300 | 1 Plate Rs.1500",
    category: "fish",
  },
  {
    name: "Malai Boti Boneless",
    price: 360,
    unit: "seekh / Rs.1800 plate",
    description: "1 Seekh Rs.360 | 1 Plate Rs.1800",
    category: "fish",
  },
  {
    name: "Tikka Boneless",
    price: 360,
    unit: "seekh / Rs.1800 plate",
    description: "1 Seekh Rs.360 | 1 Plate Rs.1800",
    category: "fish",
  },
];

const FALLBACK_CHICKEN: MenuItem[] = [
  {
    name: "Chicken Tikka",
    price: 150,
    unit: "piece",
    description: "چکن تکہ",
    category: "chicken",
  },
  {
    name: "Leg Piece",
    price: 350,
    unit: "piece",
    description: "لیگ پیس",
    category: "chicken",
  },
  {
    name: "Malai Boti",
    price: 280,
    unit: "portion",
    description: "ملائی بوٹی",
    category: "chicken",
  },
  {
    name: "Achari Tikka",
    price: 180,
    unit: "piece",
    description: "اچاری تکہ",
    category: "chicken",
  },
  {
    name: "Malai Piece",
    price: 400,
    unit: "piece",
    description: "ملائی پیس",
    category: "chicken",
  },
  {
    name: "Reshmi Kabab",
    price: 200,
    unit: "piece",
    description: "ریشمی کباب",
    category: "chicken",
  },
  {
    name: "Afghani Kabab",
    price: 180,
    unit: "piece",
    description: "افغانی کباب",
    category: "chicken",
  },
];

const FALLBACK_SIDES: MenuItem[] = [
  {
    name: "Mineral Water",
    price: 100,
    unit: "bottle",
    description: "منرل واٹر",
    category: "sides",
  },
  {
    name: "Chips with Ketchup",
    price: 60,
    unit: "pack",
    description: "چپس کیچاپ کے ساتھ",
    category: "sides",
  },
  {
    name: "Aloo Bukhara Chutney",
    price: 350,
    unit: "serving",
    description: "آلو بخارہ چٹنی",
    category: "sides",
  },
  {
    name: "Special Hot Tea",
    price: 80,
    unit: "cup",
    description: "اسپیشل گرمائی چائے",
    category: "sides",
  },
  {
    name: "Roti / Naan",
    price: 14,
    unit: "piece",
    description: "روٹی / نان",
    category: "sides",
  },
  {
    name: "Fresh Salad",
    price: 100,
    unit: "plate",
    description: "فریش سلاد",
    category: "sides",
  },
  {
    name: "Cold Drink 1L",
    price: 170,
    unit: "bottle",
    description: "کولڈ ڈرنک 1 لیٹر",
    category: "sides",
  },
  {
    name: "Cold Drink 1.5L",
    price: 220,
    unit: "bottle",
    description: "کولڈ ڈرنک 1.5 لیٹر",
    category: "sides",
  },
];

function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Home", href: "#home" },
    { label: "Menu", href: "#menu" },
    { label: "About", href: "#about" },
    { label: "Gallery", href: "#gallery" },
    { label: "Delivery", href: "#delivery" },
    { label: "Contact", href: "#contact" },
  ];

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/95 shadow-lg backdrop-blur-sm"
          : "bg-[#111111]/80 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNav("#home")}
          className="font-cinzel text-xl font-bold tracking-widest text-gold cursor-pointer bg-transparent border-0 p-0"
          data-ocid="nav.link"
        >
          QALANDRI DERA
        </button>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(l.href);
                }}
                className="font-inter text-sm font-medium text-[#F2F2F2] hover:text-gold transition-colors tracking-wider uppercase"
                data-ocid="nav.link"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:+923312151472"
            className="font-cinzel text-xs font-semibold px-4 py-2 border border-gold text-gold hover:bg-gold hover:text-[#111] transition-all tracking-wider"
            data-ocid="nav.primary_button"
          >
            CALL NOW
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="font-cinzel text-xs font-semibold px-4 py-2 bg-red-accent text-white hover:bg-[#a01e1e] transition-all tracking-wider"
            data-ocid="nav.secondary_button"
          >
            ORDER
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden text-[#F2F2F2] p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-[#0a0a0a] border-t border-[#222] px-4 py-6"
          >
            <ul className="flex flex-col gap-4">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(l.href);
                    }}
                    className="font-inter text-base font-medium text-[#F2F2F2] hover:text-gold transition-colors block py-1 tracking-wider"
                    data-ocid="nav.link"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-6">
              <a
                href="tel:+923312151472"
                className="flex-1 text-center font-cinzel text-xs font-semibold px-4 py-3 border border-gold text-gold"
                data-ocid="nav.primary_button"
              >
                CALL NOW
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center font-cinzel text-xs font-semibold px-4 py-3 bg-red-accent text-white"
                data-ocid="nav.secondary_button"
              >
                ORDER
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function FogLayer({
  z,
  speed,
  opacity,
  scale,
  offset,
}: {
  z: number;
  speed: number;
  opacity: number;
  scale: number;
  offset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, "rgba(30,30,35,0.95)");
    grad.addColorStop(0.4, "rgba(15,15,18,0.5)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    meshRef.current.position.x = Math.sin(t * 0.3) * 2.5;
    meshRef.current.position.y = Math.cos(t * 0.2) * 1.2;
    meshRef.current.rotation.z = Math.sin(t * 0.15) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, z]} scale={[scale, scale, 1]}>
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function HeroBackground3D() {
  return (
    <Canvas
      frameloop="always"
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
      className="w-full h-full"
      gl={{ antialias: false, alpha: true }}
    >
      <FogLayer z={-3} speed={0.15} opacity={0.6} scale={3.5} offset={0} />
      <FogLayer z={-1.5} speed={0.12} opacity={0.5} scale={2.8} offset={2.1} />
      <FogLayer z={0} speed={0.18} opacity={0.4} scale={2.2} offset={4.5} />
      <FogLayer z={1} speed={0.1} opacity={0.35} scale={1.8} offset={1.7} />
      <FogLayer z={2} speed={0.22} opacity={0.25} scale={1.5} offset={3.3} />
      <FogLayer z={2.5} speed={0.08} opacity={0.2} scale={1.2} offset={5.9} />
    </Canvas>
  );
}

function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #050505 0%, #0a0a0a 50%, #0d0d0d 100%)",
      }}
    >
      {/* 3D Ember Background */}
      <div className="absolute inset-0 z-0">
        <HeroBackground3D />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <p className="font-inter text-sm font-medium tracking-[0.3em] uppercase text-gold mb-4">
            Fresh • Authentic • Delicious
          </p>
          <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-[#F2F2F2]">FRESH FISH</span>
            <br />
            <span className="text-gold">&amp; BBQ</span>
            <br />
            <span className="text-[#F2F2F2]">DESI TASTE</span>
          </h1>
          <p className="font-inter text-base text-[#A6A6A6] leading-relaxed mb-8 max-w-md">
            Enjoy the finest fresh fish, sizzling chicken BBQ, seekh kabab, and
            traditional desi flavors — delivered hot to your doorstep in Jhang.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-cinzel text-sm font-semibold px-8 py-4 bg-red-accent text-white hover:bg-[#a01e1e] transition-all tracking-wider cursor-pointer"
              data-ocid="hero.primary_button"
            >
              VIEW MENU
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="font-cinzel text-sm font-semibold px-8 py-4 border-2 border-gold text-gold hover:bg-gold hover:text-[#111] transition-all tracking-wider flex items-center gap-2"
              data-ocid="hero.secondary_button"
            >
              <MessageCircle size={16} />
              ORDER ON WHATSAPP
            </a>
          </div>
          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-[#222]">
            <div>
              <p className="font-cinzel text-2xl font-bold text-gold">100%</p>
              <p className="font-inter text-xs text-[#A6A6A6] mt-1">
                Fresh Daily
              </p>
            </div>
            <div>
              <p className="font-cinzel text-2xl font-bold text-gold">Fast</p>
              <p className="font-inter text-xs text-[#A6A6A6] mt-1">
                Home Delivery
              </p>
            </div>
            <div>
              <p className="font-cinzel text-2xl font-bold text-gold">Best</p>
              <p className="font-inter text-xs text-[#A6A6A6] mt-1">
                Taste in Jhang
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right - Real food image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div
            className="relative rounded-lg overflow-hidden"
            style={{ boxShadow: "0 0 60px rgba(201,162,74,0.2)" }}
          >
            <img
              src={HERO_IMAGE}
              alt="Fresh fish and BBQ dishes at Qalandri Dera"
              className="w-full h-[400px] sm:h-[500px] object-cover"
              style={{ objectPosition: "center 30%" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, #111111 0%, transparent 50%)",
              }}
            />
          </div>
          {/* Floating badge */}
          <div className="absolute bottom-6 left-6 bg-[#1A1A1A] border border-gold px-4 py-2">
            <p className="font-cinzel text-xs text-gold tracking-wider">
              JHANG, PAKISTAN
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#A6A6A6]">
        <p className="font-inter text-xs tracking-widest">SCROLL</p>
        <ChevronDown size={18} className="animate-bounce" />
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const features = [
    {
      icon: Fish,
      title: "Fresh Fish Daily",
      desc: "We source the freshest fish every day, ensuring top quality in every bite.",
    },
    {
      icon: Flame,
      title: "Delicious BBQ Taste",
      desc: "Authentic smoky BBQ flavor with traditional spices and expert grilling.",
    },
    {
      icon: Truck,
      title: "Fast Home Delivery",
      desc: "Hot food delivered quickly to your door anywhere in Jhang.",
    },
    {
      icon: Star,
      title: "Affordable Prices",
      desc: "Premium quality at prices that won't break the bank. Value for everyone.",
    },
  ];

  return (
    <section className="py-20 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-inter text-xs tracking-[0.3em] text-gold uppercase mb-3">
            Our Promise
          </p>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F2F2F2] uppercase tracking-wide">
            Why Choose <span className="text-gold">Qalandri Dera</span>
          </h2>
          <div className="w-20 h-0.5 bg-gold mx-auto mt-4" />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[#1A1A1A] p-8 border-t-2 border-gold hover:border-red-accent transition-colors group"
            >
              <f.icon
                size={36}
                className="text-gold mb-4 group-hover:text-[#C62828] transition-colors"
              />
              <h3 className="font-cinzel text-base font-semibold text-[#F2F2F2] mb-3 uppercase tracking-wide">
                {f.title}
              </h3>
              <p className="font-inter text-sm text-[#A6A6A6] leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuSection() {
  const { actor, isFetching } = useActor();
  const [activeTab, setActiveTab] = useState<"fish" | "chicken" | "sides">(
    "fish",
  );

  const { data: allItems } = useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });

  const getFishItems = () => {
    const fromBackend = allItems?.filter((i) => i.category === "fish");
    return fromBackend && fromBackend.length > 0 ? fromBackend : FALLBACK_FISH;
  };
  const getChickenItems = () => {
    const fromBackend = allItems?.filter((i) => i.category === "chicken");
    return fromBackend && fromBackend.length > 0
      ? fromBackend
      : FALLBACK_CHICKEN;
  };
  const getSidesItems = () => {
    const fromBackend = allItems?.filter((i) => i.category === "sides");
    return fromBackend && fromBackend.length > 0 ? fromBackend : FALLBACK_SIDES;
  };

  const currentItems =
    activeTab === "fish"
      ? getFishItems()
      : activeTab === "chicken"
        ? getChickenItems()
        : getSidesItems();

  const tabs = [
    { key: "fish" as const, label: "Fish (مچھلی)", icon: Fish },
    { key: "chicken" as const, label: "Chicken (چکن)", icon: Flame },
    {
      key: "sides" as const,
      label: "Side Items (دیگر)",
      icon: UtensilsCrossed,
    },
  ];

  return (
    <section id="menu" className="py-20 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-inter text-xs tracking-[0.3em] text-gold uppercase mb-3">
            Our Selection
          </p>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F2F2F2] uppercase tracking-wide">
            Our <span className="text-gold">Menu</span>
          </h2>
          <p
            className="font-inter text-base text-gold/70 mt-2 tracking-widest"
            style={{ fontFamily: "serif" }}
          >
            ہمارا مینو
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-px bg-gold/40" />
            <div className="w-20 h-0.5 bg-gold" />
            <div className="w-12 h-px bg-gold/40" />
          </div>
        </motion.div>

        {/* Premium Tabs */}
        <div
          className="flex flex-wrap justify-center gap-4 mb-12"
          data-ocid="menu.tab"
        >
          {tabs.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative flex items-center gap-2 px-8 py-3.5 font-cinzel text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                activeTab === t.key
                  ? "text-[#111] bg-gold shadow-[0_0_20px_rgba(201,162,74,0.45)]"
                  : "border border-[#333] text-[#A6A6A6] hover:border-gold hover:text-gold"
              }`}
              data-ocid={`menu.tab.${t.key}`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Menu Cards */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {currentItems.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-[#1A1A1A] overflow-hidden group border border-transparent hover:border-gold/50 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(201,162,74,0.15)] flex flex-col"
              data-ocid={`menu.item.${idx + 1}`}
            >
              {/* Food image */}
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <img
                  src={
                    activeTab === "sides"
                      ? (SIDES_IMAGE_MAP[item.name] ?? SIDES_FALLBACK)
                      : activeTab === "fish"
                        ? (FISH_IMAGE_MAP[item.name] ?? FISH_FALLBACK)
                        : (CHICKEN_IMAGE_MAP[item.name] ?? CHICKEN_FALLBACK)
                  }
                  alt={item.name}
                  className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                />
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="font-inter text-[9px] tracking-[0.2em] uppercase text-gold/80 bg-[#111]/70 border border-gold/20 px-2 py-0.5 backdrop-blur-sm">
                    {activeTab === "fish"
                      ? "مچھلی"
                      : activeTab === "chicken"
                        ? "چکن"
                        : "دیگر"}
                  </span>
                </div>
                {/* Price badge */}
                <div className="absolute top-3 right-3 bg-gold text-[#111] px-3 py-1.5 shadow-[0_2px_10px_rgba(201,162,74,0.4)]">
                  <span className="font-cinzel text-xs font-bold tracking-wide">
                    Rs. {item.price.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Gold separator */}
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A24A] to-transparent" />
              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                {/* Gold accent bar + title */}
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-0.5 h-10 bg-gold flex-shrink-0 mt-0.5" />
                  <h3 className="font-cinzel text-sm font-semibold text-[#F2F2F2] uppercase tracking-wide leading-tight">
                    {item.name}
                  </h3>
                </div>
                <p className="font-inter text-xs text-[#888] mb-4 leading-relaxed flex-1">
                  {item.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                  <span className="font-inter text-[10px] tracking-widest text-[#666] uppercase">
                    per {item.unit}
                  </span>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-cinzel text-[10px] font-semibold tracking-wider uppercase bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-[#111] transition-all duration-200 px-3 py-1.5"
                    data-ocid={`menu.item.${idx + 1}.button`}
                  >
                    <MessageCircle size={11} />
                    Order
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View full menu CTA */}
        <div className="text-center mt-12">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-cinzel text-sm font-semibold px-8 py-4 border border-gold text-gold hover:bg-gold hover:text-[#111] hover:shadow-[0_0_20px_rgba(201,162,74,0.4)] transition-all tracking-wider"
            data-ocid="menu.primary_button"
          >
            <MessageCircle size={16} />
            ORDER VIA WHATSAPP
          </a>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="font-inter text-xs tracking-[0.3em] text-gold uppercase mb-3">
              Our Story
            </p>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F2F2F2] uppercase tracking-wide mb-6">
              About <span className="text-gold">Qalandri Dera</span>
            </h2>
            <div className="w-20 h-0.5 bg-red-accent mb-6" />
            <p className="font-inter text-base text-[#A6A6A6] leading-relaxed mb-5">
              Qalandri Dera is a beloved local food destination in Jhang,
              serving the freshest fish, flavorful BBQ, and authentic Pakistani
              desi dishes. We are passionate about quality taste and have become
              a trusted name for families and food lovers across Jhang.
            </p>
            <p className="font-inter text-base text-[#A6A6A6] leading-relaxed mb-8">
              Whether you're craving grilled tawa fish, smoky seekh kabab,
              creamy chicken malai boti, or a rich karahi — Qalandri Dera
              delivers unforgettable flavors with every meal. We use fresh
              ingredients daily and prepare every order with care.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                ["Fresh Ingredients", "Sourced daily for the best taste"],
                ["Authentic Recipes", "Traditional spices and methods"],
                ["Family Friendly", "Welcoming environment for all"],
                ["Home Delivery", "Fast delivery across Jhang"],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3">
                  <CheckCircle
                    size={18}
                    className="text-gold mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-cinzel text-xs font-semibold text-[#F2F2F2] uppercase tracking-wide">
                      {title}
                    </p>
                    <p className="font-inter text-xs text-[#A6A6A6] mt-0.5">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="tel:+923312151472"
              className="inline-flex items-center gap-2 font-cinzel text-sm font-semibold px-8 py-4 bg-gold text-[#111] hover:bg-[#b8922e] transition-all tracking-wider"
              data-ocid="about.primary_button"
            >
              <Phone size={16} />
              CALL US NOW
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const images = [
    {
      src: "/assets/uploads/screenshot_20260328-213654_1-019d3553-34ab-720f-8325-79087da37c7d-1.jpg",
      alt: "Qalandri Dera restaurant exterior daytime",
    },
    {
      src: "/assets/uploads/screenshot_20260328-213701_1-019d3553-3713-740c-a6e9-196ef1eddc28-2.jpg",
      alt: "Qalandri Dera stall with sign close-up",
    },
    {
      src: "/assets/uploads/screenshot_20260328-213627-019d3553-3d8f-720b-b704-a6af8874cb04-3.jpg",
      alt: "Guests dining at Qalandri Dera",
    },
    {
      src: "/assets/uploads/screenshot_20260328-213641_1-019d3553-3d63-713d-900a-cff6926b13dc-4.jpg",
      alt: "Qalandri Dera night stall with green banner",
    },
  ];

  return (
    <section id="gallery" className="py-20 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-inter text-xs tracking-[0.3em] text-gold uppercase mb-3">
            Visual Feast
          </p>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F2F2F2] uppercase tracking-wide">
            Our <span className="text-gold">Gallery</span>
          </h2>
          <div className="w-20 h-0.5 bg-gold mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative overflow-hidden group rounded-sm"
              data-ocid={`gallery.item.${i + 1}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover group-hover:scale-110 transition-transform duration-500"
                style={{ height: "300px" }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="font-inter text-xs text-white/90 truncate">
                  {img.alt}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeliverySection() {
  const steps = [
    {
      num: "01",
      title: "Choose Your Order",
      desc: "Browse our menu and pick your favorites",
    },
    {
      num: "02",
      title: "Call or WhatsApp",
      desc: "Contact us at +92 331 2151472",
    },
    {
      num: "03",
      title: "Freshly Prepared",
      desc: "We prepare your order fresh with care",
    },
    {
      num: "04",
      title: "Delivered to You",
      desc: "Hot food delivered to your doorstep",
    },
  ];

  return (
    <section id="delivery" className="py-20 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-inter text-xs tracking-[0.3em] text-gold uppercase mb-3">
            Order &amp; Delivery
          </p>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F2F2F2] uppercase tracking-wide">
            Fast Home <span className="text-gold">Delivery</span>
          </h2>
          <div className="w-20 h-0.5 bg-gold mx-auto mt-4" />
          <p className="font-inter text-base text-[#A6A6A6] mt-6 max-w-xl mx-auto">
            Get your favorite fish, chicken BBQ, and desi dishes delivered fresh
            and hot anywhere in Jhang.
          </p>
        </motion.div>

        {/* Delivery banner */}
        <div
          className="rounded-lg p-8 sm:p-12 mb-14 border border-gold/30"
          style={{
            background: "linear-gradient(135deg, #1A0A0A 0%, #1A1A1A 100%)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#F2F2F2] uppercase tracking-wide mb-4">
                HOT &amp; FRESH FOOD
                <span className="text-gold block">
                  DELIVERED TO YOUR DOORSTEP
                </span>
              </h3>
              <p className="font-inter text-sm text-[#A6A6A6] mb-6">
                Order your favorite fish, chicken BBQ, and desi dishes with fast
                local delivery in Jhang.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+923312151472"
                  className="flex items-center gap-2 font-cinzel text-xs font-semibold px-6 py-3 bg-red-accent text-white hover:bg-[#a01e1e] transition-all tracking-wider"
                  data-ocid="delivery.primary_button"
                >
                  <Phone size={14} /> CALL TO ORDER
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-cinzel text-xs font-semibold px-6 py-3 border border-gold text-gold hover:bg-gold hover:text-[#111] transition-all tracking-wider"
                  data-ocid="delivery.secondary_button"
                >
                  <MessageCircle size={14} /> WHATSAPP ORDER
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Clock,
                  label: "Delivery Hours",
                  value: "11am – 11pm Daily",
                },
                { icon: MapPin, label: "Coverage", value: "All Jhang City" },
                { icon: Phone, label: "Call Now", value: "+92 331 2151472" },
                {
                  icon: MessageCircle,
                  label: "WhatsApp",
                  value: "+92 344 1750781",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#111] border border-[#222] p-4"
                >
                  <item.icon size={20} className="text-gold mb-2" />
                  <p className="font-inter text-xs text-[#A6A6A6]">
                    {item.label}
                  </p>
                  <p className="font-cinzel text-xs font-semibold text-[#F2F2F2] mt-1">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-2 border-gold flex items-center justify-center mx-auto mb-4">
                <span className="font-cinzel text-xl font-bold text-gold">
                  {step.num}
                </span>
              </div>
              <h4 className="font-cinzel text-sm font-semibold text-[#F2F2F2] uppercase tracking-wide mb-2">
                {step.title}
              </h4>
              <p className="font-inter text-xs text-[#A6A6A6]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const reviews = [
    {
      name: "Ahmed Raza",
      rating: 5,
      text: "Best fish in Jhang! The tawa fish is absolutely amazing. Fresh and full of flavor every time.",
    },
    {
      name: "Fatima Khan",
      rating: 5,
      text: "Qalandri Dera never disappoints. The seekh kababs are perfectly spiced and the delivery is always fast.",
    },
    {
      name: "Muhammad Ali",
      rating: 5,
      text: "We order from here every week for family gatherings. The chicken karahi and BBQ are unmatched in Jhang.",
    },
  ];

  return (
    <section className="py-20 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-inter text-xs tracking-[0.3em] text-gold uppercase mb-3">
            Happy Customers
          </p>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F2F2F2] uppercase tracking-wide">
            Customer <span className="text-gold">Reviews</span>
          </h2>
          <div className="w-20 h-0.5 bg-gold mx-auto mt-4" />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-[#1A1A1A] p-6 border-b-2 border-gold"
              data-ocid={`reviews.item.${i + 1}`}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.rating }).map((_, j) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: star rating index
                  <Star key={j} size={14} className="text-gold fill-gold" />
                ))}
              </div>
              <p className="font-inter text-sm text-[#A6A6A6] leading-relaxed mb-4 italic">
                "{r.text}"
              </p>
              <p className="font-cinzel text-xs font-semibold text-[#F2F2F2] uppercase tracking-wide">
                — {r.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-inter text-xs tracking-[0.3em] text-gold uppercase mb-3">
            Get In Touch
          </p>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F2F2F2] uppercase tracking-wide">
            Contact <span className="text-gold">Us</span>
          </h2>
          <div className="w-20 h-0.5 bg-gold mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Details */}
          <div>
            <h3 className="font-cinzel text-xl font-semibold text-[#F2F2F2] uppercase tracking-wide mb-6">
              Contact Information
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <MapPin size={20} className="text-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="font-cinzel text-xs font-semibold text-[#F2F2F2] uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <p className="font-inter text-sm text-[#A6A6A6]">
                    782F+8R2, Jhang, Pakistan
                  </p>
                </div>
              </div>
              {[
                { num: "+92 331 2151472", label: "Primary" },
                { num: "+92 344 1750781", label: "Secondary" },
                { num: "+92 301 7670781", label: "Alt Line" },
              ].map((p) => (
                <div key={p.num} className="flex items-start gap-4">
                  <Phone size={20} className="text-gold mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-cinzel text-xs font-semibold text-[#F2F2F2] uppercase tracking-wide mb-1">
                      {p.label}
                    </p>
                    <a
                      href={`tel:${p.num.replace(/\s/g, "")}`}
                      className="font-inter text-sm text-[#A6A6A6] hover:text-gold transition-colors"
                    >
                      {p.num}
                    </a>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-4">
                <Mail size={20} className="text-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="font-cinzel text-xs font-semibold text-[#F2F2F2] uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:kafsh786@gmail.com"
                    className="font-inter text-sm text-[#A6A6A6] hover:text-gold transition-colors"
                  >
                    kafsh786@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="tel:+923312151472"
                className="flex items-center gap-2 font-cinzel text-xs font-semibold px-5 py-3 bg-gold text-[#111] hover:bg-[#b8922e] transition-all tracking-wider"
                data-ocid="contact.primary_button"
              >
                <Phone size={14} /> CALL NOW
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-cinzel text-xs font-semibold px-5 py-3 bg-red-accent text-white hover:bg-[#a01e1e] transition-all tracking-wider"
                data-ocid="contact.secondary_button"
              >
                <MessageCircle size={14} /> WHATSAPP
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-cinzel text-xs font-semibold px-5 py-3 border border-[#333] text-[#A6A6A6] hover:border-gold hover:text-gold transition-all tracking-wider"
                data-ocid="contact.link"
              >
                <MapPin size={14} /> DIRECTIONS
              </a>
            </div>

            {/* Social */}
            <div className="mt-8 pt-6 border-t border-[#222]">
              <p className="font-cinzel text-xs font-semibold text-[#F2F2F2] uppercase tracking-wider mb-4">
                Follow Us
              </p>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com/QalandriDera"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 border border-[#333] flex items-center justify-center text-[#A6A6A6] hover:border-gold hover:text-gold transition-all"
                  data-ocid="contact.link"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://instagram.com/kafshofficial1"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 border border-[#333] flex items-center justify-center text-[#A6A6A6] hover:border-gold hover:text-gold transition-all"
                  data-ocid="contact.link"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://youtube.com/@KafshOfficial"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 border border-[#333] flex items-center justify-center text-[#A6A6A6] hover:border-gold hover:text-gold transition-all"
                  data-ocid="contact.link"
                >
                  <Youtube size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Google Map */}
          <div
            className="rounded-lg overflow-hidden border border-[#222]"
            style={{ minHeight: "400px" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27217.17!2d72.3232!3d31.2685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392269e5c62e7f63%3A0xf021cd91e15f73a3!2sJhang%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Qalandri Dera Location - Jhang"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { label: "Home", href: "#home" },
    { label: "Menu", href: "#menu" },
    { label: "About", href: "#about" },
    { label: "Gallery", href: "#gallery" },
    { label: "Delivery", href: "#delivery" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <h3 className="font-cinzel text-2xl font-bold text-gold tracking-widest mb-3">
              QALANDRI DERA
            </h3>
            <p className="font-inter text-sm text-[#A6A6A6] leading-relaxed mb-4">
              Fresh fish, delicious BBQ, and authentic desi food in Jhang,
              Pakistan. Taste the tradition with every bite.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/QalandriDera"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 border border-[#333] flex items-center justify-center text-[#A6A6A6] hover:border-gold hover:text-gold transition-all"
              >
                <Facebook size={14} />
              </a>
              <a
                href="https://instagram.com/kafshofficial1"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 border border-[#333] flex items-center justify-center text-[#A6A6A6] hover:border-gold hover:text-gold transition-all"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://youtube.com/@KafshOfficial"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 border border-[#333] flex items-center justify-center text-[#A6A6A6] hover:border-gold hover:text-gold transition-all"
              >
                <Youtube size={14} />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-cinzel text-sm font-semibold text-[#F2F2F2] uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .querySelector(l.href)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="font-inter text-sm text-[#A6A6A6] hover:text-gold transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="font-cinzel text-sm font-semibold text-[#F2F2F2] uppercase tracking-widest mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              <p className="font-inter text-sm text-[#A6A6A6] flex items-center gap-2">
                <MapPin size={14} className="text-gold flex-shrink-0" />
                782F+8R2, Jhang, Pakistan
              </p>
              <p className="font-inter text-sm text-[#A6A6A6] flex items-center gap-2">
                <Phone size={14} className="text-gold flex-shrink-0" />
                +92 331 2151472
              </p>
              <p className="font-inter text-sm text-[#A6A6A6] flex items-center gap-2">
                <Mail size={14} className="text-gold flex-shrink-0" />
                kafsh786@gmail.com
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-inter text-xs text-[#555]">
            © {year} Qalandri Dera. All Rights Reserved.
          </p>
          <p className="font-inter text-xs text-[#555]">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:scale-110 transition-transform"
      style={{ backgroundColor: "#25D366" }}
      aria-label="Order on WhatsApp"
      data-ocid="whatsapp.button"
    >
      <MessageCircle size={28} className="text-white" />
    </a>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main>
        <HeroSection />
        <MenuSection />
        <WhyChooseUs />
        <AboutSection />
        <GallerySection />
        <DeliverySection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
