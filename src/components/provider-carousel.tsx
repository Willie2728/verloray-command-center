"use client";
import { motion, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "./icons";
import type { ProviderDefinition, ProviderId } from "@/lib/types";

export function ProviderCarousel({ providers, active, selected, multi, onActive, onSelect }: { providers: ProviderDefinition[]; active: number; selected: ProviderId[]; multi: boolean; onActive: (index: number) => void; onSelect: (id: ProviderId) => void }) {
  const move = (delta: number) => onActive((active + delta + providers.length) % providers.length);
  const dragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => { if (Math.abs(info.offset.x) > 45) move(info.offset.x < 0 ? 1 : -1); };
  return <section className="provider-stage" tabIndex={0} onKeyDown={(e) => { if (e.key === "ArrowRight") move(1); if (e.key === "ArrowLeft") move(-1); }} aria-label="Provider carousel">
    <button className="carousel-arrow left" onClick={() => move(-1)} aria-label="Previous provider"><ChevronLeft/></button>
    <div className="coverflow">
      {providers.map((provider, index) => {
        let offset = index - active; if (offset > providers.length / 2) offset -= providers.length; if (offset < -providers.length / 2) offset += providers.length;
        if (Math.abs(offset) > 3) return null;
        const isActive = offset === 0;
        return <motion.button key={provider.id} className={`provider-tile ${isActive ? "center" : ""} ${selected.includes(provider.id) ? "selected" : ""}`} style={{ "--provider-color": provider.color } as React.CSSProperties} animate={{ x: offset * 180, scale: isActive ? 1 : Math.max(.65, .82 - Math.abs(offset) * .08), rotateY: offset * -42, zIndex: 10 - Math.abs(offset), opacity: Math.abs(offset) > 2 ? .32 : 1 }} transition={{ type: "spring", stiffness: 230, damping: 28 }} drag={isActive ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={.8} onDragEnd={dragEnd} onClick={() => isActive ? onSelect(provider.id) : onActive(index)}>
          <span className="provider-art">{provider.id === "microsoft-copilot" ? <Plus/> : provider.shortName}</span>
          <span className="provider-title">{provider.name}</span>
          <span className={`status ${provider.state}`}>{provider.state.replace("-", " ")}</span>
          {multi && selected.includes(provider.id) && <span className="selected-dot">✓</span>}
        </motion.button>;
      })}
    </div>
    <button className="carousel-arrow right" onClick={() => move(1)} aria-label="Next provider"><ChevronRight/></button>
  </section>;
}
