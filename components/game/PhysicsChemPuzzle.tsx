"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { ComboNotice, ReactionLog, ResultSummary, TokenSymbol } from "@/types/game";
import { INITIAL_CURRENT, INITIAL_QUEUE, MAX_LOG } from "@/lib/game/config";
import { DEFAULT_GAME_ATOMS } from "@/lib/game/periodic";
import { getWeightedToken } from "@/lib/game/scoring";
import { EFFECT_STYLES, TOKENS } from "@/lib/game/tokens";
import { createAtomEntity, type PhysicsEntity, type PhysicsReaction, resolvePhysicsReaction } from "@/lib/game/physicsChemistry";

export type PhysicsGameSnapshot = {
  holdToken: TokenSymbol | null;
  nextQueue: TokenSymbol[];
  reactionLog: ReactionLog[];
  comboNotice: ComboNotice | null;
  score: number;
  level: number;
  gameOver: boolean;
  isRunning: boolean;
  canUseTokenAction: boolean;
  resultSummary: ResultSummary;
};

export type PhysicsGameHandle = {
  resetGame: () => void;
  toggleRunning: () => void;
  holdCurrent: () => void;
  swapWithNext: () => void;
};

const WIDTH = 560;
const HEIGHT = 640;
const LEFT_WALL = 12;
const RIGHT_WALL = WIDTH - 12;
const DROP_Y = 62;

type PhaserModule = typeof import("phaser");
type MatterImage = Phaser.Physics.Matter.Image;
type EntityRecord = PhysicsEntity & { body: MatterImage; label: Phaser.GameObjects.Text; bornAt: number };
type MatterBodyWithGameObject = MatterJS.BodyType & {
  gameObject?: Phaser.GameObjects.GameObject & { getData: (key: string) => unknown };
};
type CollisionEvent = {
  pairs: Array<{
    bodyA: MatterBodyWithGameObject;
    bodyB: MatterBodyWithGameObject;
  }>;
};

const TOKEN_COLORS: Record<TokenSymbol, { fill: number; stroke: number; text: string }> = {
  H: { fill: 0xbae6fd, stroke: 0x0284c7, text: "#082f49" },
  O: { fill: 0xfecdd3, stroke: 0xe11d48, text: "#4c0519" },
  Li: { fill: 0xffe4e6, stroke: 0xfb7185, text: "#4c0519" },
  Be: { fill: 0xecfccb, stroke: 0x84cc16, text: "#1a2e05" },
  C: { fill: 0x27272a, stroke: 0x71717a, text: "#ffffff" },
  N: { fill: 0xc7d2fe, stroke: 0x4f46e5, text: "#1e1b4b" },
  P: { fill: 0xd9f99d, stroke: 0x65a30d, text: "#1a2e05" },
  B: { fill: 0xfbcfe8, stroke: 0xdb2777, text: "#500724" },
  F: { fill: 0xa7f3d0, stroke: 0x059669, text: "#022c22" },
  S: { fill: 0xfef08a, stroke: 0xca8a04, text: "#422006" },
  Cl: { fill: 0xbbf7d0, stroke: 0x16a34a, text: "#052e16" },
  Na: { fill: 0xe7e5e4, stroke: 0x78716c, text: "#1c1917" },
  Mg: { fill: 0xe2e8f0, stroke: 0x64748b, text: "#0f172a" },
  Al: { fill: 0xe4e4e7, stroke: 0x71717a, text: "#18181b" },
  Si: { fill: 0xcffafe, stroke: 0x0891b2, text: "#083344" },
  Ca: { fill: 0xe5e5e5, stroke: 0x737373, text: "#171717" },
  Fe: { fill: 0xfed7aa, stroke: 0xea580c, text: "#431407" },
  Cu: { fill: 0xfcd34d, stroke: 0xd97706, text: "#451a03" },
  Zn: { fill: 0xbfdbfe, stroke: 0x2563eb, text: "#172554" },
  He: { fill: 0xddd6fe, stroke: 0x7c3aed, text: "#2e1065" },
  Ne: { fill: 0xf5d0fe, stroke: 0xc026d3, text: "#4a044e" },
  Ar: { fill: 0xe9d5ff, stroke: 0x9333ea, text: "#3b0764" },
  K: { fill: 0xede9fe, stroke: 0x8b5cf6, text: "#2e1065" },
  Xe: { fill: 0x99f6e4, stroke: 0x0d9488, text: "#042f2e" },
  Ph: { fill: 0x164e63, stroke: 0x06b6d4, text: "#ecfeff" },
  Fire: { fill: 0xf97316, stroke: 0xef4444, text: "#fff7ed" },
};

const initialSnapshot: PhysicsGameSnapshot = {
  holdToken: null,
  nextQueue: INITIAL_QUEUE,
  reactionLog: [],
  comboNotice: null,
  score: 0,
  level: 1,
  gameOver: false,
  isRunning: false,
  canUseTokenAction: false,
  resultSummary: { score: 0, reactionCount: 0, acidic: 0, neutral: 0, basic: 0, dominant: "none" },
};

const summarizeResult = (score: number, reactionLog: ReactionLog[]): ResultSummary => {
  const acidic = reactionLog.filter((entry) => entry.acidity === "acidic").length;
  const neutral = reactionLog.filter((entry) => entry.acidity === "neutral").length;
  const basic = reactionLog.filter((entry) => entry.acidity === "basic").length;
  const dominant = reactionLog.length === 0 ? "none" : acidic >= neutral && acidic >= basic ? "acidic" : basic >= neutral ? "basic" : "neutral";
  return { score, reactionCount: reactionLog.length, acidic, neutral, basic, dominant };
};

function createTexture(scene: Phaser.Scene, PhaserRuntime: PhaserModule, key: string, entity: Omit<PhysicsEntity, "id">) {
  if (scene.textures.exists(key)) return;
  const color = TOKEN_COLORS[entity.atoms[0]] ?? TOKEN_COLORS.H;
  const size = entity.radius * 2 + 14;
  const center = size / 2;
  const graphics = scene.add.graphics();
  graphics.fillStyle(color.fill, 1);
  graphics.lineStyle(entity.kind === "atom" ? 2 : 3, entity.kind === "fragment" ? 0xfacc15 : color.stroke, 0.92);
  if (entity.formula === "Fire") {
    graphics.fillCircle(center, center, entity.radius);
    graphics.strokeCircle(center, center, entity.radius);
    graphics.fillStyle(0xffedd5, 0.96);
    graphics.fillTriangle(center, center - entity.radius * 0.72, center - entity.radius * 0.48, center + entity.radius * 0.42, center + entity.radius * 0.44, center + entity.radius * 0.42);
    graphics.fillStyle(0xfacc15, 0.92);
    graphics.fillTriangle(center, center - entity.radius * 0.26, center - entity.radius * 0.25, center + entity.radius * 0.42, center + entity.radius * 0.25, center + entity.radius * 0.42);
  } else if (entity.formula === "Ph") {
    const points = [];
    for (let index = 0; index < 6; index += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 6;
      points.push(new PhaserRuntime.Math.Vector2(center + Math.cos(angle) * entity.radius, center + Math.sin(angle) * entity.radius));
    }
    graphics.fillPoints(points, true);
    graphics.strokePoints(points, true);
    graphics.lineStyle(2, 0xecfeff, 0.86);
    graphics.strokeCircle(center, center, entity.radius * 0.48);
  } else {
    graphics.fillCircle(center, center, entity.radius);
    graphics.strokeCircle(center, center, entity.radius);
    if (entity.kind !== "atom") {
      graphics.lineStyle(2, 0xffffff, 0.74);
      graphics.strokeCircle(center, center, entity.radius - 7);
    }
  }
  graphics.generateTexture(key, size, size);
  graphics.destroy();
}

const getInitialToken = (enabledAtoms: TokenSymbol[]) => (enabledAtoms.includes(INITIAL_CURRENT) ? INITIAL_CURRENT : enabledAtoms[0] ?? "H");
const getInitialQueue = (enabledAtoms: TokenSymbol[]) => {
  const queue: TokenSymbol[] = [];
  for (const token of [...INITIAL_QUEUE, ...enabledAtoms]) {
    if (!queue.includes(token)) queue.push(token);
    if (queue.length === 3) break;
  }
  return queue;
};

export const PhysicsChemPuzzle = forwardRef<PhysicsGameHandle, { enabledAtoms?: TokenSymbol[]; onSnapshot: (snapshot: PhysicsGameSnapshot) => void }>(function PhysicsChemPuzzle({ enabledAtoms: activeAtoms = DEFAULT_GAME_ATOMS, onSnapshot }, ref) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<PhysicsGameHandle | null>(null);
  const snapshotRef = useRef(onSnapshot);

  snapshotRef.current = onSnapshot;

  useImperativeHandle(ref, () => ({
    resetGame: () => sceneRef.current?.resetGame(),
    toggleRunning: () => sceneRef.current?.toggleRunning(),
    holdCurrent: () => sceneRef.current?.holdCurrent(),
    swapWithNext: () => sceneRef.current?.swapWithNext(),
  }));

  useEffect(() => {
    let game: Phaser.Game | null = null;
    let destroyed = false;

    async function boot() {
      const Phaser = await import("phaser");
      if (destroyed || !hostRef.current) return;

      class ChemPuzzleScene extends Phaser.Scene {
        entities = new Map<number, EntityRecord>();
        nextId = 0;
        score = 0;
        level = 1;
        running = false;
        gameOver = false;
        holdToken: TokenSymbol | null = null;
        enabledAtoms: TokenSymbol[] = activeAtoms;
        nextQueue: TokenSymbol[] = getInitialQueue(activeAtoms);
        currentId: number | null = null;
        tokenActionUsed = false;
        releaseTimer: Phaser.Time.TimerEvent | null = null;
        reactionLog: ReactionLog[] = [];
        comboNotice: ComboNotice | null = null;
        logId = 0;
        comboId = 0;
        combining = new Set<number>();
        dropX = WIDTH / 2;

        create() {
          this.matter.world.setBounds(0, 0, WIDTH, HEIGHT, 24, true, true, false, true);
          this.matter.world.drawDebug = false;
          this.matter.world.debugGraphic?.clear();
          this.matter.world.setGravity(0, 1.05);
          this.createBeaker();
          this.input.keyboard?.on("keydown-LEFT", () => this.nudgeCurrent(-1));
          this.input.keyboard?.on("keydown-A", () => this.nudgeCurrent(-1));
          this.input.keyboard?.on("keydown-RIGHT", () => this.nudgeCurrent(1));
          this.input.keyboard?.on("keydown-D", () => this.nudgeCurrent(1));
          this.input.keyboard?.on("keydown-DOWN", () => this.startAndDrop());
          this.input.keyboard?.on("keydown-S", () => this.startAndDrop());
          this.input.keyboard?.on("keydown-SPACE", () => this.startAndDrop());
          this.input.keyboard?.on("keydown-ENTER", () => this.startAndDrop());
          this.input.keyboard?.on("keydown-C", () => this.holdCurrent());
          this.input.keyboard?.on("keydown-X", () => this.swapWithNext());
          this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.moveCurrentTo(pointer.x));
          this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.moveCurrentTo(pointer.x);
            this.startAndDrop();
          });
          this.matter.world.on("collisionstart", (event: CollisionEvent) => this.handleCollision(event));
          sceneRef.current = this;
          this.spawnSpecific(getInitialToken(this.enabledAtoms), this.dropX, DROP_Y, true);
          this.matter.world.pause();
          this.emitSnapshot();
        }

        createBeaker() {
          const bg = this.add.graphics();
          bg.fillStyle(0xf8fbff, 1);
          bg.fillRect(0, 0, WIDTH, HEIGHT);
          bg.fillStyle(0xe9fbff, 0.74);
          bg.fillRect(0, 74, WIDTH, HEIGHT - 74);
          bg.fillStyle(0xd5f5ff, 0.54);
          bg.fillRect(0, HEIGHT - 232, WIDTH, 198);
          bg.fillStyle(0xbdeeff, 0.24);
          bg.fillRect(0, HEIGHT - 120, WIDTH, 86);
          bg.fillStyle(0xffffff, 0.5);
          bg.fillRect(62, 112, 1, HEIGHT - 194);
          bg.fillRect(WIDTH - 64, 112, 1, HEIGHT - 194);
          bg.fillStyle(0xffffff, 0.34);
          bg.fillRect(WIDTH - 88, 96, 16, HEIGHT - 206);
          bg.fillStyle(0x7dd3fc, 0.22);
          [
            [88, 520, 5],
            [132, 430, 3],
            [428, 500, 4],
            [472, 392, 3],
            [214, 562, 2],
          ].forEach(([x, y, radius]) => bg.fillCircle(x, y, radius));
        }

        emitSnapshot() {
          snapshotRef.current({
            holdToken: this.holdToken,
            nextQueue: [...this.nextQueue],
            reactionLog: [...this.reactionLog],
            comboNotice: this.comboNotice,
            score: this.score,
            level: this.level,
            gameOver: this.gameOver,
            isRunning: this.running,
            canUseTokenAction: this.running && !this.gameOver && this.currentId !== null && !this.tokenActionUsed,
            resultSummary: summarizeResult(this.score, this.reactionLog),
          });
        }

        resetGame() {
          this.entities.forEach((entity) => {
            entity.label.destroy();
            entity.body.destroy();
          });
          this.entities.clear();
          this.score = 0;
          this.level = 1;
          this.running = true;
          this.gameOver = false;
          this.holdToken = null;
          this.nextQueue = getInitialQueue(this.enabledAtoms);
          this.currentId = null;
          this.tokenActionUsed = false;
          this.reactionLog = [];
          this.comboNotice = null;
          this.combining.clear();
          this.releaseTimer?.remove(false);
          this.releaseTimer = null;
          this.spawnSpecific(getWeightedToken(1, this.enabledAtoms), this.dropX, DROP_Y, true);
          this.matter.world.resume();
          this.emitSnapshot();
        }

        toggleRunning() {
          if (this.gameOver) {
            this.resetGame();
            return;
          }
          this.running = !this.running;
          if (this.running) this.matter.world.resume();
          else this.matter.world.pause();
          this.emitSnapshot();
        }

        spawnNext() {
          if (this.gameOver || this.currentId !== null) return;
          const [token, ...rest] = this.nextQueue;
          this.nextQueue = [...rest, getWeightedToken(this.level, this.enabledAtoms)];
          this.tokenActionUsed = false;
          this.spawnSpecific(token, this.dropX, DROP_Y, true);
          this.emitSnapshot();
        }

        spawnSpecific(token: TokenSymbol, x: number, y: number, controlled = false) {
          const entity = createAtomEntity(token);
          return this.spawnEntity(entity, x, y, controlled);
        }

        spawnEntity(entity: Omit<PhysicsEntity, "id">, x: number, y: number, controlled = false) {
          const id = ++this.nextId;
          const key = `chem-${entity.formula}-${entity.kind}-${entity.radius}`;
          createTexture(this, Phaser, key, entity);
          const body = this.matter.add.image(x, y, key);
          body.setCircle(entity.radius);
          body.setFriction(0.08);
          body.setFrictionAir(0.006);
          body.setBounce(0.16);
          body.setData("entityId", id);
          const label = this.add.text(x, y, entity.formula === "Ph" || entity.formula === "Fire" ? "" : entity.formula, {
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: `${Math.max(11, Math.min(19, entity.radius * 0.54))}px`,
            fontStyle: "900",
            color: TOKEN_COLORS[entity.atoms[0]]?.text ?? "#0f172a",
            align: "center",
          });
          label.setOrigin(0.5);
          label.setDepth(20);
          body.setDepth(10);
          this.entities.set(id, { ...entity, id, body, label, bornAt: this.time.now });
          if (controlled) {
            body.setStatic(true);
            body.setIgnoreGravity(true);
            this.currentId = id;
          }
          return id;
        }

        releaseCurrent() {
          if (this.currentId === null || this.releaseTimer !== null) return;
          const releasedId = this.currentId;
          this.currentId = null;
          this.queueNextWhenDropZoneClears(releasedId);
          this.emitSnapshot();
        }

        nudgeCurrent(direction: -1 | 1) {
          if (this.gameOver || this.currentId === null) return;
          const entity = this.entities.get(this.currentId);
          if (!entity) return;
          this.moveCurrentTo(entity.body.x + direction * 24);
        }

        moveCurrentTo(x: number) {
          if (this.gameOver || this.currentId === null) return;
          const entity = this.entities.get(this.currentId);
          if (!entity) return;
          const margin = Math.max(38, entity.radius + 8);
          this.dropX = Math.max(LEFT_WALL + margin, Math.min(RIGHT_WALL - margin, x));
          entity.body.setPosition(this.dropX, DROP_Y);
        }

        dropCurrent() {
          if (!this.running || this.gameOver || this.currentId === null) return;
          const entity = this.entities.get(this.currentId);
          if (!entity) return;
          entity.bornAt = this.time.now;
          entity.body.setIgnoreGravity(false);
          entity.body.setStatic(false);
          entity.body.setVelocity(0, 0);
          entity.body.setAngularVelocity(0);
          this.releaseCurrent();
        }

        queueNextWhenDropZoneClears(releasedId: number) {
          const startedAt = this.time.now;
          const waitForClear = () => {
            if (this.gameOver) {
              this.releaseTimer = null;
              return;
            }
            const released = this.entities.get(releasedId);
            const clearedDropZone = !released || released.body.y > DROP_Y + released.radius * 2 + 24;
            const waitedLongEnough = this.time.now - startedAt > 900;
            if (clearedDropZone || waitedLongEnough) {
              this.releaseTimer = null;
              this.spawnNext();
              return;
            }
            this.releaseTimer = this.time.delayedCall(80, waitForClear);
          };
          this.releaseTimer = this.time.delayedCall(120, waitForClear);
        }

        startAndDrop() {
          if (this.gameOver) {
            this.resetGame();
            this.time.delayedCall(30, () => this.dropCurrent());
            return;
          }
          if (!this.running) {
            this.running = true;
            this.matter.world.resume();
          }
          this.dropCurrent();
          this.emitSnapshot();
        }

        holdCurrent() {
          if (!this.running || this.gameOver || this.currentId === null || this.tokenActionUsed) return;
          const current = this.entities.get(this.currentId);
          if (!current || current.kind !== "atom") return;
          const currentToken = current.atoms[0];
          const replacement = this.holdToken ?? this.nextQueue[0];
          if (!replacement) return;
          if (this.holdToken === null) {
            const [, ...rest] = this.nextQueue;
            this.nextQueue = [...rest, getWeightedToken(this.level, this.enabledAtoms)];
          }
          this.holdToken = currentToken;
          const { x, y } = current.body;
          this.removeEntity(current.id);
          this.spawnSpecific(replacement, x, y, true);
          this.tokenActionUsed = true;
          this.emitSnapshot();
        }

        swapWithNext() {
          if (!this.running || this.gameOver || this.currentId === null || this.tokenActionUsed) return;
          const current = this.entities.get(this.currentId);
          const [nextToken, ...rest] = this.nextQueue;
          if (!current || current.kind !== "atom" || !nextToken) return;
          const currentToken = current.atoms[0];
          const { x, y } = current.body;
          this.nextQueue = [currentToken, ...rest];
          this.removeEntity(current.id);
          this.spawnSpecific(nextToken, x, y, true);
          this.tokenActionUsed = true;
          this.emitSnapshot();
        }

        removeEntity(id: number) {
          const entity = this.entities.get(id);
          if (!entity) return;
          entity.label.destroy();
          entity.body.destroy();
          this.entities.delete(id);
          this.combining.delete(id);
          if (this.currentId === id) this.currentId = null;
        }

        handleCollision(event: CollisionEvent) {
          if (!this.running || this.gameOver) return;
          for (const pair of event.pairs) {
            const firstId = this.getEntityId(pair.bodyA);
            const secondId = this.getEntityId(pair.bodyB);
            if (!firstId || !secondId || firstId === secondId) continue;
            if (firstId === this.currentId || secondId === this.currentId) this.releaseCurrent();
            if (this.combining.has(firstId) || this.combining.has(secondId)) continue;
            const first = this.entities.get(firstId);
            const second = this.entities.get(secondId);
            if (!first || !second) continue;
            const reaction = resolvePhysicsReaction(first, second);
            if (!reaction) continue;
            this.combining.add(firstId);
            this.combining.add(secondId);
            this.time.delayedCall(80, () => this.applyReaction(firstId, secondId, reaction));
          }
        }

        getEntityId(body: MatterBodyWithGameObject) {
          const value = body.gameObject?.getData("entityId");
          return typeof value === "number" ? value : null;
        }

        applyReaction(firstId: number, secondId: number, reaction: PhysicsReaction) {
          const first = this.entities.get(firstId);
          const second = this.entities.get(secondId);
          if (!first || !second) return;
          const x = (first.body.x + second.body.x) / 2;
          const y = (first.body.y + second.body.y) / 2;
          this.removeEntity(firstId);
          this.removeEntity(secondId);
          if (reaction.type === "cluster") {
            this.spawnEntity(reaction.entity, x, y);
            this.flash(x, y, 0x22d3ee);
            this.emitSnapshot();
            return;
          }
          if (reaction.type === "burst") {
            this.clearNear(x, y, 92);
            this.score += reaction.points;
            this.flash(x, y, 0xfb923c);
            this.comboNotice = { id: ++this.comboId, chain: 1, matchCount: 1, bonusPoints: 0, gainedPoints: reaction.points, formulas: reaction.formulas };
            this.emitSnapshot();
            return;
          }
          const molecule = reaction.molecule;
          this.score += reaction.points;
          this.level = Math.min(20, this.level + 1);
          this.reactionLog = [
            {
              id: ++this.logId,
              formula: molecule.formula,
              name: molecule.name,
              property: molecule.property,
              effect: molecule.effect,
              ph: molecule.ph,
              acidity: molecule.acidity,
              count: molecule.nodes.length,
              points: reaction.points,
              imageUrl: molecule.imageUrl,
            },
            ...this.reactionLog,
          ].slice(0, MAX_LOG);
          this.comboNotice = { id: ++this.comboId, chain: 1, matchCount: 1, bonusPoints: 0, gainedPoints: reaction.points, formulas: reaction.formulas };
          this.flash(x, y, Number(`0x${EFFECT_STYLES[molecule.effect].stroke.slice(1)}`));
          this.emitSnapshot();
        }

        clearNear(x: number, y: number, radius: number) {
          const targets = [...this.entities.values()].filter((entity) => {
            if (entity.atoms.every((atom) => TOKENS[atom].category === "noble")) return false;
            return Phaser.Math.Distance.Between(x, y, entity.body.x, entity.body.y) < radius;
          });
          targets.forEach((entity) => this.removeEntity(entity.id));
        }

        flash(x: number, y: number, color: number) {
          const burst = this.add.circle(x, y, 12, color, 0.34);
          burst.setDepth(30);
          this.tweens.add({
            targets: burst,
            radius: 92,
            alpha: 0,
            duration: 420,
            ease: "Cubic.easeOut",
            onComplete: () => burst.destroy(),
          });
        }

        update() {
          this.entities.forEach((entity) => {
            entity.label.setPosition(entity.body.x, entity.body.y);
            entity.label.setRotation(0);
            const velocityY = entity.body.body?.velocity.y ?? 0;
            if (!this.gameOver && entity.id !== this.currentId && this.time.now - entity.bornAt > 1200 && entity.body.y < 74 && Math.abs(velocityY) < 0.8) {
              this.gameOver = true;
              this.running = false;
              this.matter.world.pause();
              this.emitSnapshot();
            }
          });
        }
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: WIDTH,
        height: HEIGHT,
        parent: hostRef.current,
        backgroundColor: "#f8fafc",
        physics: {
          default: "matter",
          matter: {
            debug: false,
            gravity: { x: 0, y: 1.05 },
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: ChemPuzzleScene,
      });
    }

    boot();

    return () => {
      destroyed = true;
      sceneRef.current = null;
      if (game) game.destroy(true);
      snapshotRef.current(initialSnapshot);
    };
  }, [activeAtoms]);

  return (
    <div className="beaker-frame physics-beaker flex w-full items-center justify-center overflow-hidden p-0">
      <div ref={hostRef} className="h-[640px] w-full max-w-[560px]" />
    </div>
  );
});

export { initialSnapshot as INITIAL_PHYSICS_GAME_SNAPSHOT };
