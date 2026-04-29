import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Base, BriefingLevelDef, LevelResult } from "../types";
import { layout, palette, typography } from "../theme";
import { Callout } from "../components/Callout";
import { PrimaryButton } from "../components/PrimaryButton";
import { BaseGlyph } from "../components/BaseGlyph";
import { PhosphateGlyph, SugarGlyph } from "../components/PartGlyph";
import { DraggablePart } from "../components/DraggablePart";
import { StabilityMeter } from "../components/StabilityMeter";
import { newLevelDraft } from "../store";
import { baseFullName } from "../game/pairing";

interface Props {
  level: BriefingLevelDef;
  onComplete: (result: LevelResult) => void;
}

type PartKind = "phosphate" | "sugar" | "base";

interface Vec2 {
  x: number;
  y: number;
}

interface BoardSize {
  w: number;
  h: number;
}

interface Placed {
  phosphate: boolean;
  sugar: boolean;
  base: Base | null;
}

interface FeedbackState {
  msg: string;
  tone: "info" | "success" | "warn";
}

const PART_SIZE = 64;
const ZONE_RADIUS = 80;
const BASES_TRAY: Base[] = ["A", "T", "G", "C"];

interface BriefingLayout {
  zones: { phosphate: Vec2; sugar: Vec2; base: Vec2 };
  trayPhosphate: Vec2;
  traySugar: Vec2;
  trayBases: Record<Base, Vec2>;
  padW: number;
  padH: number;
  trayX: number;
  trayW: number;
  partSize: number;
}

const computeLayout = (size: BoardSize): BriefingLayout => {
  const padW = Math.floor(size.w * 0.55);
  const padH = size.h;

  const padCenterX = padW / 2 - PART_SIZE / 2;
  const trayX = padW + 16;
  const trayInnerW = Math.max(size.w - trayX - 16, 240);

  const zones = {
    phosphate: { x: padCenterX, y: padH * 0.18 },
    sugar: { x: padCenterX, y: padH * 0.42 },
    base: { x: padCenterX, y: padH * 0.66 },
  };

  const trayPhosphateX = trayX + trayInnerW * 0.3 - PART_SIZE / 2;
  const traySugarX = trayX + trayInnerW * 0.7 - PART_SIZE / 2;
  const trayPartsY = padH * 0.32;

  const trayBaseY1 = padH * 0.58;
  const trayBaseY2 = padH * 0.78;
  const baseColX1 = trayX + trayInnerW * 0.3 - PART_SIZE / 2;
  const baseColX2 = trayX + trayInnerW * 0.7 - PART_SIZE / 2;

  return {
    zones,
    trayPhosphate: { x: trayPhosphateX, y: trayPartsY },
    traySugar: { x: traySugarX, y: trayPartsY },
    trayBases: {
      A: { x: baseColX1, y: trayBaseY1 },
      T: { x: baseColX2, y: trayBaseY1 },
      G: { x: baseColX1, y: trayBaseY2 },
      C: { x: baseColX2, y: trayBaseY2 },
      U: { x: 0, y: 0 },
    },
    padW,
    padH,
    trayX,
    trayW: trayInnerW,
    partSize: PART_SIZE,
  };
};

const centerFromTopLeft = (p: Vec2, size: number): Vec2 => ({
  x: p.x + size / 2,
  y: p.y + size / 2,
});

const distance = (a: Vec2, b: Vec2): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const BriefingLevel: React.FC<Props> = ({ level, onComplete }) => {
  const [boardSize, setBoardSize] = useState<BoardSize>({ w: 0, h: 0 });
  const [placed, setPlaced] = useState<Placed>({
    phosphate: false,
    sugar: false,
    base: null,
  });
  const [swappedCount, setSwappedCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const draftRef = useRef<LevelResult>(newLevelDraft(level.id));

  useEffect(() => {
    draftRef.current = newLevelDraft(level.id);
    startedAtRef.current = Date.now();
  }, [level.id]);

  const onBoardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoardSize({ w: width, h: height });
  };

  const layoutCalc: BriefingLayout | null = useMemo(() => {
    if (boardSize.w === 0 || boardSize.h === 0) return null;
    return computeLayout(boardSize);
  }, [boardSize]);

  const placedCount =
    (placed.phosphate ? 1 : 0) +
    (placed.sugar ? 1 : 0) +
    (placed.base ? 1 : 0);
  const meterValue = placedCount / 3;
  const fullyAssembled = placed.phosphate && placed.sugar && placed.base !== null;
  const readyToContinue = fullyAssembled && swappedCount >= 1;

  const handleDrop = (kind: PartKind, base: Base | null) =>
    (dropX: number, dropY: number) => {
      if (!layoutCalc) return;
      const dropCenter: Vec2 = {
        x: dropX + layoutCalc.partSize / 2,
        y: dropY + layoutCalc.partSize / 2,
      };
      const zoneCenters = {
        phosphate: centerFromTopLeft(layoutCalc.zones.phosphate, layoutCalc.partSize),
        sugar: centerFromTopLeft(layoutCalc.zones.sugar, layoutCalc.partSize),
        base: centerFromTopLeft(layoutCalc.zones.base, layoutCalc.partSize),
      };
      const distances = {
        phosphate: distance(dropCenter, zoneCenters.phosphate),
        sugar: distance(dropCenter, zoneCenters.sugar),
        base: distance(dropCenter, zoneCenters.base),
      };
      let nearestZone: PartKind | null = null;
      let nearestDist = Infinity;
      (["phosphate", "sugar", "base"] as PartKind[]).forEach((z) => {
        if (distances[z] < nearestDist) {
          nearestDist = distances[z];
          nearestZone = z;
        }
      });
      if (!nearestZone || nearestDist > ZONE_RADIUS) {
        setFeedback({
          msg: "Drop the part onto one of the dashed targets in the assembly pad.",
          tone: "info",
        });
        return;
      }
      if (nearestZone !== kind) {
        setFeedback({
          msg: explainWrongZone(kind, nearestZone),
          tone: "warn",
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        draftRef.current = {
          ...draftRef.current,
          attempts: draftRef.current.attempts + 1,
        };
        return;
      }
      // Correct zone. Place the part.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      draftRef.current = {
        ...draftRef.current,
        attempts: draftRef.current.attempts + 1,
      };
      if (kind === "phosphate") {
        const wasPlaced = placed.phosphate;
        setPlaced((s) => ({ ...s, phosphate: true }));
        setFeedback({
          msg: wasPlaced
            ? "Phosphate already attached."
            : "Phosphate attached. Phosphates link nucleotides into a continuous backbone.",
          tone: "success",
        });
      } else if (kind === "sugar") {
        const wasPlaced = placed.sugar;
        setPlaced((s) => ({ ...s, sugar: true }));
        setFeedback({
          msg: wasPlaced
            ? "Sugar already attached."
            : "Sugar (deoxyribose) is the central scaffold. It connects to the phosphate of the next nucleotide.",
          tone: "success",
        });
      } else if (kind === "base" && base) {
        const wasPlaced = placed.base !== null;
        const wasSame = placed.base === base;
        setPlaced((s) => ({ ...s, base }));
        if (wasPlaced && !wasSame) {
          setSwappedCount((c) => c + 1);
          setFeedback({
            msg: `Base swapped to ${baseFullName(base)}. The backbone stayed the same; only the information changed.`,
            tone: "success",
          });
        } else if (wasPlaced && wasSame) {
          setFeedback({
            msg: `${baseFullName(base)} is already in place. Try a different base to see the information change.`,
            tone: "info",
          });
        } else {
          setFeedback({
            msg: `${baseFullName(base)} attached. Different bases carry different information.`,
            tone: "success",
          });
        }
      }
    };

  const finish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result: LevelResult = {
      ...draftRef.current,
      durationMs: Date.now() - startedAtRef.current,
      completed: true,
    };
    onComplete(result);
  };

  return (
    <View style={styles.root} onLayout={onBoardLayout}>
      {/* Brief strip at very top */}
      <View style={styles.briefStrip}>
        <Text style={styles.modeLabel}>Briefing</Text>
        <Text style={styles.briefText}>
          Build a nucleotide. Drag each part from the tray on the right to the
          matching dashed target on the left. Try a second base after you
          finish.
        </Text>
      </View>

      {layoutCalc && (
        <>
          {/* Assembly pad backbone line */}
          <View
            style={[
              styles.backboneLine,
              {
                left: layoutCalc.zones.phosphate.x + layoutCalc.partSize / 2 - 1,
                top: layoutCalc.zones.phosphate.y + layoutCalc.partSize / 2,
                height:
                  layoutCalc.zones.base.y +
                  layoutCalc.partSize / 2 -
                  (layoutCalc.zones.phosphate.y + layoutCalc.partSize / 2),
              },
            ]}
          />

          {/* Pad / tray divider */}
          <View
            style={[
              styles.divider,
              {
                left: layoutCalc.padW,
                height: layoutCalc.padH - 60,
                top: 60,
              },
            ]}
          />

          {/* Pad header */}
          <View style={[styles.padHeader, { width: layoutCalc.padW }]}>
            <Text style={styles.padTitle}>Assembly pad</Text>
            <Text style={styles.padSub}>
              Each target accepts a specific kind of part.
            </Text>
          </View>

          {/* Zones */}
          <Zone
            kind="phosphate"
            label="phosphate"
            sublabel="backbone link"
            position={layoutCalc.zones.phosphate}
            size={layoutCalc.partSize}
            placed={placed.phosphate}
          >
            <PhosphateGlyph size={48} />
          </Zone>
          <Zone
            kind="sugar"
            label="sugar"
            sublabel="central scaffold"
            position={layoutCalc.zones.sugar}
            size={layoutCalc.partSize}
            placed={placed.sugar}
          >
            <SugarGlyph size={52} />
          </Zone>
          <Zone
            kind="base"
            label="base"
            sublabel="information"
            position={layoutCalc.zones.base}
            size={layoutCalc.partSize}
            placed={placed.base !== null}
          >
            {placed.base ? (
              <BaseGlyph base={placed.base} size={layoutCalc.partSize} />
            ) : null}
          </Zone>

          {/* Tray header */}
          <View
            style={[
              styles.trayHeader,
              { left: layoutCalc.trayX, width: layoutCalc.trayW },
            ]}
          >
            <Text style={styles.padTitle}>Lab objective</Text>
            <Text style={styles.padSub}>
              Build one nucleotide ({placedCount} of 3 parts attached).
            </Text>
            <View style={{ marginTop: 10 }}>
              <StabilityMeter
                value={meterValue}
                label="Assembly progress"
                hint={
                  fullyAssembled
                    ? readyToContinue
                      ? "Nucleotide complete. Ready for the lab."
                      : "Try a different base to see the information change."
                    : "Drag the next part to its dashed target."
                }
                width={undefined as unknown as number}
              />
            </View>
          </View>

          {/* Tray parts (draggable) */}
          <DraggablePart
            key="tray-phosphate"
            targetX={layoutCalc.trayPhosphate.x}
            targetY={layoutCalc.trayPhosphate.y}
            size={layoutCalc.partSize}
            onDrop={handleDrop("phosphate", null)}
          >
            <PhosphateGlyph size={48} />
          </DraggablePart>
          <DraggablePart
            key="tray-sugar"
            targetX={layoutCalc.traySugar.x}
            targetY={layoutCalc.traySugar.y}
            size={layoutCalc.partSize}
            onDrop={handleDrop("sugar", null)}
          >
            <SugarGlyph size={52} />
          </DraggablePart>
          {BASES_TRAY.map((b) => (
            <DraggablePart
              key={`tray-${b}`}
              targetX={layoutCalc.trayBases[b].x}
              targetY={layoutCalc.trayBases[b].y}
              size={layoutCalc.partSize}
              onDrop={handleDrop("base", b)}
            >
              <BaseGlyph base={b} size={layoutCalc.partSize} />
            </DraggablePart>
          ))}

          {/* Tray labels above each part */}
          <TrayCaption
            position={layoutCalc.trayPhosphate}
            size={layoutCalc.partSize}
            text="phosphate"
          />
          <TrayCaption
            position={layoutCalc.traySugar}
            size={layoutCalc.partSize}
            text="sugar"
          />
          {BASES_TRAY.map((b) => (
            <TrayCaption
              key={`cap-${b}`}
              position={layoutCalc.trayBases[b]}
              size={layoutCalc.partSize}
              text={`${b} — ${baseFullName(b)}`}
            />
          ))}
        </>
      )}

      {/* Feedback bubble */}
      {feedback ? (
        <View
          style={[
            styles.feedback,
            feedback.tone === "warn" && {
              backgroundColor: palette.warnSoft,
              borderColor: palette.warn,
            },
            feedback.tone === "success" && {
              backgroundColor: palette.successSoft,
              borderColor: palette.success,
            },
            feedback.tone === "info" && {
              backgroundColor: palette.accentSoft,
              borderColor: palette.accent,
            },
          ]}
        >
          <Text style={styles.feedbackText}>{feedback.msg}</Text>
        </View>
      ) : null}

      {/* Continue panel */}
      {readyToContinue && (
        <View style={styles.continuePanel}>
          <Callout
            figure="Lab note"
            title="You built a nucleotide"
            body={level.successDebrief}
            tone="success"
          />
          <View style={styles.continueActions}>
            <PrimaryButton label="Continue to the lab" onPress={finish} />
          </View>
        </View>
      )}
    </View>
  );
};

const Zone: React.FC<{
  kind: PartKind;
  label: string;
  sublabel: string;
  position: Vec2;
  size: number;
  placed: boolean;
  children: React.ReactNode;
}> = ({ position, size, placed, label, sublabel, children }) => (
  <View
    pointerEvents="none"
    style={[
      styles.zoneWrap,
      {
        left: position.x,
        top: position.y,
        width: size,
        height: size,
      },
    ]}
  >
    {!placed && (
      <View
        style={[
          styles.zoneOutline,
          {
            width: size,
            height: size,
            borderRadius: size * 0.22,
          },
        ]}
      />
    )}
    {placed && <View style={styles.zoneFilled}>{children}</View>}
    <View style={[styles.zoneCaption, { top: size + 6, width: size + 60, left: -30 }]}>
      <Text style={styles.zoneLabel}>{label}</Text>
      <Text style={styles.zoneSublabel}>{sublabel}</Text>
    </View>
  </View>
);

const TrayCaption: React.FC<{
  position: Vec2;
  size: number;
  text: string;
}> = ({ position, size, text }) => (
  <View
    pointerEvents="none"
    style={[
      styles.trayCaption,
      {
        left: position.x - 10,
        top: position.y - 18,
        width: size + 20,
      },
    ]}
  >
    <Text style={styles.trayCaptionText}>{text}</Text>
  </View>
);

const explainWrongZone = (kind: PartKind, nearest: PartKind): string => {
  const partName =
    kind === "phosphate" ? "phosphate" : kind === "sugar" ? "sugar" : "base";
  const zoneName =
    nearest === "phosphate"
      ? "phosphate"
      : nearest === "sugar"
      ? "sugar"
      : "base";
  return `That target accepts a ${zoneName}, not a ${partName}.`;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    borderRadius: layout.cardRadius,
    overflow: "hidden",
    position: "relative",
  },
  briefStrip: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 5,
  },
  modeLabel: {
    ...typography.caption,
    color: palette.accent,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  briefText: {
    ...typography.body,
    fontSize: 13,
    color: palette.inkSoft,
    flexShrink: 1,
  },
  divider: {
    position: "absolute",
    width: 1,
    backgroundColor: palette.rule,
  },
  backboneLine: {
    position: "absolute",
    width: 2,
    backgroundColor: palette.rule,
  },
  padHeader: {
    position: "absolute",
    top: 50,
    left: 16,
    paddingRight: 24,
  },
  padTitle: {
    ...typography.title,
    fontSize: 16,
  },
  padSub: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  trayHeader: {
    position: "absolute",
    top: 50,
    paddingHorizontal: 16,
  },
  zoneWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  zoneOutline: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: palette.accent,
    backgroundColor: "rgba(59,110,143,0.06)",
  },
  zoneFilled: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  zoneCaption: {
    position: "absolute",
    alignItems: "center",
  },
  zoneLabel: {
    ...typography.caption,
    color: palette.inkSoft,
    fontSize: 11,
  },
  zoneSublabel: {
    ...typography.figure,
    fontSize: 11,
    color: palette.inkSoft,
  },
  trayCaption: {
    position: "absolute",
    alignItems: "center",
  },
  trayCaptionText: {
    ...typography.caption,
    fontSize: 10,
    color: palette.inkSoft,
  },
  feedback: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    left: 24,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  feedbackText: {
    ...typography.body,
    fontSize: 13,
    textAlign: "center",
  },
  continuePanel: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 60,
    backgroundColor: palette.panel,
    borderRadius: layout.cardRadius,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.rule,
  },
  continueActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
