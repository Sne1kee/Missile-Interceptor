// 2D Missile Intercept Simulator
// MIT License - Copyright (c) 2026 Sne1ke
//
// Simple 2D real-time missile intercept simulator.
// Coordinates: world origin at launch point (bottom-left of canvas).
// Units: meters, seconds.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");
const statsEl = document.getElementById("stats");

const IS_MOBILE = typeof window !== "undefined"
  ? (("ontouchstart" in window) ||
     (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
     window.matchMedia("(max-width: 900px)").matches)
  : false;
const VIS_SCALE = IS_MOBILE ? 1.6 : 1;

const ui = {
  launchBtn: document.getElementById("launchBtn"),
  resetBtn: document.getElementById("resetBtn"),
  centerCamBtn: document.getElementById("centerCamBtn"),
  langEnBtn: document.getElementById("langEnBtn"),
  langUkBtn: document.getElementById("langUkBtn"),
  targetManeuver: document.getElementById("targetManeuver"),
  targetManeuverLabel: document.getElementById("targetManeuverLabel"),
  targetManeuverHint: document.getElementById("targetManeuverHint"),
  targetSpeed: document.getElementById("targetSpeed"),
  targetRange: document.getElementById("targetRange"),
  targetAlt: document.getElementById("targetAlt"),
  targetTypePlane: document.getElementById("targetTypePlane"),
  targetTypeBallistic: document.getElementById("targetTypeBallistic"),
  targetPlaneFields: document.getElementById("targetPlaneFields"),
  targetBallisticFields: document.getElementById("targetBallisticFields"),
  targetApogee: document.getElementById("targetApogee"),
  targetAttackX: document.getElementById("targetAttackX"),
  targetDeviation: document.getElementById("targetDeviation"),
  targetError: document.getElementById("targetError"),
  missileG: document.getElementById("missileG"),
  missileMass: document.getElementById("missileMass"),
  primaryThrust: document.getElementById("primaryThrust"),
  primaryTime: document.getElementById("primaryTime"),
  secondaryThrust: document.getElementById("secondaryThrust"),
  secondaryTime: document.getElementById("secondaryTime"),
  maxMach: document.getElementById("maxMach"),
  fuzeRange: document.getElementById("fuzeRange"),
  guidanceMode: document.getElementById("guidanceMode"),
  navConstant: document.getElementById("navConstant"),
  loftBias: document.getElementById("loftBias"),
  simSpeed: document.getElementById("simSpeed"),
  mobileControls: document.getElementById("mobileControls"),
  mobileLeft: document.getElementById("mobileLeft"),
  mobileRight: document.getElementById("mobileRight"),
  mobileUp: document.getElementById("mobileUp"),
  mobileDown: document.getElementById("mobileDown"),
};

// Translations: English (en) and Ukrainian (uk)
const LANG = {
  en: {
    subtitle: "Interceptor missile kinematics simulator with smart guidance system",
    btn_launch: "Launch",
    btn_reset: "Reset",
    btn_center_camera: "Center camera",
    panel_target: "Target ▾",
    panel_missile: "Missile ▾",
    panel_guidance: "Guidance ▾",
    label_target_type: "Target type",
    target_plane: "Plane",
    target_ballistic: "Ballistic",
    tooltip_target_type: "Plane: flying target. Ballistic: descending missile from apogee.",
    label_maneuver: "Maneuver",
    label_speed: "Speed (m/s)",
    label_range: "Range (m)",
    label_altitude: "Altitude (m)",
    label_apogee: "Ballistic missile apogee (m)",
    label_attack_coords: "Coordinates of attack (m)",
    label_starting_deviation: "Starting deviation (m)",
    tooltip_apogee: "Altitude at which the ballistic missile starts falling (minimum 20 km).",
    tooltip_attack_coords: "Ground position to attack, relative to launcher (e.g. 100 = 100 m right at ground level).",
    tooltip_starting_deviation: "Horizontal position relative to launcher (min 25% of apogee).",
    error_apogee_min: "Apogee must be at least 20,000 m (20 km).",
    error_deviation_min: "Starting deviation must be at least 25% of apogee.",
    label_g_limit: "G limit",
    label_mass: "Mass (kg)",
    label_primary_thrust: "Primary thrust (N)",
    label_primary_time: "Primary time (s)",
    label_secondary_thrust: "Secondary thrust (N)",
    label_secondary_time: "Secondary time (s)",
    label_max_speed: "Max speed (Mach)",
    label_fuze: "Proximity fuze (m)",
    label_guidance_mode: "Guidance mode",
    label_nav_n: "Nav constant N",
    label_loft_bias: "Loft bias (deg)",
    label_sim_speed: "Simulation speed",
    tooltip_sim_speed: "Speed multiplier for the simulation (0.5× to 5×).",
    tooltip_maneuver: "How the target flies: straight, snake-like weave, or player-controlled with arrow keys.",
    tooltip_speed: "Initial horizontal speed of the target in meters per second.",
    tooltip_range: "Initial horizontal distance from the launcher to the target (positive = right, negative = left).",
    tooltip_altitude: "Initial target altitude above ground level in meters.",
    tooltip_g_limit: "Maximum lateral g the missile can command (structural and fin limit).",
    tooltip_mass: "Launch mass of the missile including fuel and warhead.",
    tooltip_primary_thrust: "Boost motor thrust in newtons; higher gives faster initial acceleration.",
    tooltip_primary_time: "Duration of the boost motor burn in seconds.",
    tooltip_secondary_thrust: "Sustain motor thrust in newtons for the mid-course phase.",
    tooltip_secondary_time: "Duration of the sustain motor burn in seconds.",
    tooltip_max_speed: "Hard cap on missile speed expressed in Mach number.",
    tooltip_fuze: "Detonation radius: if the missile comes within this distance, the proximity fuze triggers.",
    tooltip_guidance_mode: "Choose classic constant-N proportional navigation or energy-saving smart guidance (dynamically changes N midflight to save energy).",
    tooltip_nav_n: "Navigation constant in missile guidance that dictates how aggressively a missile responds to the rotation of the line-of-sight (LOS) to a target. \n In Smart mode this is the maximum N used near intercept.",
    tooltip_loft_bias: "Positive values bias the missile to arc above the line of sight when the target is much higher.",
    hint_straight: "Target flies straight at constant speed.",
    hint_snake: "Target weaves up and down in a snake pattern.",
    hint_player: "Use arrow keys: ← → speed, ↑ ↓ vertical.",
    maneuver_straight: "Straight",
    maneuver_snake: "Snake",
    maneuver_player: "Player",
    option_constant: "Constant N",
    option_smart: "Smart (energy-saving)",
    result_intercept_fuze: "Intercept (proximity fuze)",
    result_direct_hit: "Direct hit",
    result_missed: "Missed",
    result_target_impacted: "Target impacted",
    hud_result: "Result",
    hud_range: "Range",
    hud_closure: "Closure",
    hud_missile_speed: "Missile speed",
    hud_cmd_accel: "Overload",
    hud_guidance: "Guidance",
    hud_eta: "ETA",
    hud_pan_zoom: "Drag to pan, scroll to zoom",
    guidance_smart: "Smart",
    guidance_constant: "Constant",
    stats_missile_pos: "Missile pos",
    stats_target_pos: "Target pos",
    stats_missile_vel: "Missile vel",
    stats_target_vel: "Target vel",
    stats_target_speed: "Target speed",
    stats_missile_mass: "Missile mass",
    stats_target_mass: "Target mass",
    stats_mach: "Mach",
    stats_cmd_accel: "Overload",
    stats_stage_time: "Stage time",
    footer_author: "Author",
  },
  uk: {
    subtitle: "Симулятор ракети-перехоплювача: кінематика та система наведення",
    btn_launch: "Запуск",
    btn_reset: "Скинути",
    btn_center_camera: "Центр камери",
    panel_target: "Ціль ▾",
    panel_missile: "Ракета ▾",
    panel_guidance: "Наведення ▾",
    label_target_type: "Тип цілі",
    target_plane: "Літак",
    target_ballistic: "Балістична",
    tooltip_target_type: "Літак: літаюча ціль. Балістична: ракета, що падає з апогею.",
    label_maneuver: "Маневр",
    label_speed: "Швидкість (м/с)",
    label_range: "Дальність (м)",
    label_altitude: "Висота (м)",
    label_apogee: "Апогей БР (м)",
    label_attack_coords: "Координати удару (м)",
    label_starting_deviation: "Початкове відхилення (м)",
    tooltip_apogee: "Висота, з якої балістична ракета починає падіння (мін. 20 км).",
    tooltip_attack_coords: "Наземна точка удару відносно пускової позиції (напр. 100 = 100 м праворуч на рівні землі).",
    tooltip_starting_deviation: "Відстань в горизонті відносно пускової (мін. 25% від апогею).",
    error_apogee_min: "Апогей має бути не менше 20 000 м (20 км).",
    error_deviation_min: "Початкове відхилення має бути не менше 25% від апогею.",
    label_g_limit: "Обмеження g",
    label_mass: "Маса (кг)",
    label_primary_thrust: "Основна тяга (Н)",
    label_primary_time: "Час основного ступеня (с)",
    label_secondary_thrust: "Додаткова тяга (Н)",
    label_secondary_time: "Час додаткового ступеня (с)",
    label_max_speed: "Макс швидкість (Мах)",
    label_fuze: "Радіус підриву (м)",
    label_guidance_mode: "Режим наведення",
    label_nav_n: "Стала наведення N",
    label_loft_bias: "Відхилення вгору (°)",
    label_sim_speed: "Швидкість симуляції",
    tooltip_sim_speed: "Множник швидкості симуляції (0.5× – 5×).",
    tooltip_maneuver: "Як летить ціль: прямо, змійкою або керування гравцем стрілками.",
    tooltip_speed: "Початкова горизонтальна швидкість цілі в м/с.",
    tooltip_range: "Початкова дальність від пускової до цілі (додатня = праворуч, відʼємна = ліворуч).",
    tooltip_altitude: "Початкова висота цілі над землею в метрах.",
    tooltip_g_limit: "Максимальне поперечне прискорення (перевантаження) ракети (конструкція та стабілізатори). Більше значення означає більшу здатність ракети витримувати перевантаження та більшу маневреність.",
    tooltip_mass: "Стартова маса ракети разом з паливом і БЧ.",
    tooltip_primary_thrust: "Тяга розгінного ступеня в ньютонах; більше — швидше розгін.",
    tooltip_primary_time: "Тривалість роботи розгінного ступеня в секундах.",
    tooltip_secondary_thrust: "Тяга маршового ступеня в ньютонах.",
    tooltip_secondary_time: "Тривалість роботи маршового ступеня в секундах.",
    tooltip_max_speed: "Максимальна швидкість ракети в Махах.",
    tooltip_fuze: "Радіус підриву: при наближенні на цю відстань спрацьовує неконтактний підривач.",
    tooltip_guidance_mode: "Класичне постійне N або енерго-зберігаюче розумне наведення (N змінюється під час польоту).",
    tooltip_nav_n: "Навігаційна стала в системі наведення ракети, яка визначає, наскільки агресивно ракета реагує на обертання лінії видимості (LOS) до цілі. \n У режимі «Розумне наведення» — це максимальне N біля перехоплення.",
    tooltip_loft_bias: "Додатні значення відхиляють траєкторію вгору, коли ціль значно вище, для завчасного набору висоти.",
    hint_straight: "Ціль летить прямо з постійною швидкістю.",
    hint_snake: "Ціль рухається вгору-вниз змійкою.",
    hint_player: "Стрілки: ← → швидкість в горизонті, ↑ ↓ вертикальна швидкість.",
    maneuver_straight: "Прямо",
    maneuver_snake: "Змійка",
    maneuver_player: "Гравець",
    option_constant: "Постійне N",
    option_smart: "Розумне наведення (економія енергії)",
    result_intercept_fuze: "Перехоплення (неконтактний підривач)",
    result_direct_hit: "Пряме влучення",
    result_missed: "Промах",
    result_target_impacted: "Ціль влучила",
    hud_result: "Результат",
    hud_range: "Відстань до цілі",
    hud_closure: " Швидкість зближення",
    hud_missile_speed: "Швидкість ракети",
    hud_cmd_accel: "Перевантаження",
    hud_guidance: "Наведення",
    hud_eta: "Час до зіткнення",
    hud_pan_zoom: "Перетягуйте — рух камери, прокрутка — приближення",
    guidance_smart: "Розумне",
    guidance_constant: "Постійне",
    stats_missile_pos: "Поз. ракети",
    stats_target_pos: "Поз. цілі",
    stats_missile_vel: "Швид. ракети",
    stats_target_vel: "Швид. цілі",
    stats_target_speed: "Швидкість цілі",
    stats_missile_mass: "Маса ракети",
    stats_target_mass: "Маса цілі",
    stats_mach: "Швидкість в Махах",
    stats_cmd_accel: "Перевантаження",
    stats_stage_time: "Час польоту",
    footer_author: "Автор",
  },
};

let currentLang = "en";

function t(key) {
  return LANG[currentLang]?.[key] ?? LANG.en[key] ?? key;
}

function updateTargetTypeUI() {
  const isBallistic = ui.targetTypeBallistic?.checked ?? false;
  if (ui.targetPlaneFields) ui.targetPlaneFields.classList.toggle("hidden", isBallistic);
  if (ui.targetBallisticFields) ui.targetBallisticFields.classList.toggle("hidden", !isBallistic);
}

function validateBallisticParams() {
  const apogee = Number(ui.targetApogee?.value ?? 25000);
  const deviation = Number(ui.targetDeviation?.value ?? 0);
  if (apogee < 20000) return t("error_apogee_min");
  const minDeviation = 0.25 * apogee;
  if (Math.abs(deviation) < minDeviation) return t("error_deviation_min");
  return null;
}

function applyTranslations() {
  document.documentElement.lang = currentLang === "uk" ? "uk" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && t(key)) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-tooltip]").forEach((el) => {
    const key = el.getAttribute("data-i18n-tooltip");
    if (key && t(key)) el.setAttribute("data-tooltip", t(key));
  });
  const sub = document.querySelector(".subtitle");
  if (sub) sub.textContent = t("subtitle");
  const opt0 = document.querySelector("#guidanceMode option[value='constant']");
  const opt1 = document.querySelector("#guidanceMode option[value='smart']");
  if (opt0) opt0.textContent = t("option_constant");
  if (opt1) opt1.textContent = t("option_smart");
  updateManeuverUI();
  updateTargetTypeUI();
  if (typeof sim !== "undefined") sim.refreshHudLanguage();
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
  });
  document.querySelectorAll(".panel-section.collapsed").forEach((section) => {
    const id = section.id;
    const btn = document.querySelector(`.panel-toggle[data-panel-target="${id}"]`);
    if (btn && btn.textContent.includes("▾")) btn.textContent = btn.textContent.replace("▾", "▸");
  });
}

// Arrow key state for player-controlled target (only when maneuver === 2)
const keyState = { left: false, right: false, up: false, down: false };
const MANEUVER_KEYS = ["maneuver_straight", "maneuver_snake", "maneuver_player"];
const HINT_KEYS = ["hint_straight", "hint_snake", "hint_player"];

const WORLD = {
  width: 4000000, // meters span horizontally
  height: 2400000, // meters span vertically
  g: 9.81,
  seaLevelSpeedSound: 340, // m/s
  rho0: 1.225, // sea level air density kg/m^3
  scaleHeight: 8500, // meters, exponential atmosphere scale height
};

// Aerodynamic limits (very approximate, tuned for plausible behavior rather than fidelity).
// LIFT_EFFECTIVE_AREA controls how much lateral acceleration is available vs. dynamic pressure;
// INDUCED_DRAG_AREA adds extra drag when the missile pulls G so that hard turns bleed energy.
const LIFT_EFFECTIVE_AREA = 0.22;
const INDUCED_DRAG_AREA = 0.0003;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function magnitude(v) {
  return Math.hypot(v.x, v.y);
}

function normalize(v) {
  const m = magnitude(v) || 1e-6;
  return { x: v.x / m, y: v.y / m };
}

function rotate(v, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}

// Ballistic target aerodynamics: use same basic model as interceptor
// (drag ∝ q * CdA) but with its own reference Cd·A and mass scaling so
// heavier warheads fall faster and lighter ones slow down more.
class Target {
  constructor(speed, altitude, range, maneuverMode = 0) {
    this.maneuverMode = maneuverMode;
    this.trail = [];
    this.snakePhase = 0;
    this.snakePeriod = 10;
    this.playerAccel = 50;
    this.minSpeed = 50;
    this.maxSpeed = 500;
    this.maxVertSpeed = 150;
    this.snakeAmplitude = 150;
    this.plasmaLevel = 0;

    this.pos = { x: range, y: altitude };
    this.vel = { x: speed, y: 0 };
    this.baseSpeed = speed;
  }

  update(dt, keys = { left: false, right: false, up: false, down: false }) {
    if (this.maneuverMode === 0) {
      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
    } else if (this.maneuverMode === 1) {
      this.snakePhase += dt;
      const omega = (2 * Math.PI) / this.snakePeriod;
      const speedMag = Math.max(Math.abs(this.baseSpeed), this.minSpeed);
      const speedFactor = clamp(speedMag / 250, 0.4, 2.0);
      const amp = this.snakeAmplitude * speedFactor;
      this.vel.y = amp * omega * Math.cos(omega * this.snakePhase);
      this.vel.x = this.baseSpeed;
      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
    } else {
      if (keys.left) this.vel.x -= this.playerAccel * dt;
      if (keys.right) this.vel.x += this.playerAccel * dt;
      this.vel.x = clamp(this.vel.x, -this.maxSpeed, this.maxSpeed);
      if (keys.up) this.vel.y += this.playerAccel * dt;
      if (keys.down) this.vel.y -= this.playerAccel * dt;
      this.vel.y = clamp(this.vel.y, -this.maxVertSpeed, this.maxVertSpeed);
      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
    }
    // Smooth plasma intensity based on Mach
    const speed = magnitude(this.vel);
    const mach = speed / WORLD.seaLevelSpeedSound;
    const raw = clamp((mach - PLASMA_MACH_MIN) / (PLASMA_MACH_MAX - PLASMA_MACH_MIN), 0, 1);
    const fadeRate = 3; // 1/s
    const k = clamp(dt * fadeRate, 0, 1);
    this.plasmaLevel += (raw - this.plasmaLevel) * k;
    this.pos.y = Math.max(0, this.pos.y);
    this.trail.push({ x: this.pos.x, y: this.pos.y, t: performance.now() });
    if (this.trail.length > 400) this.trail.shift();
  }
}

// Ballistic target: descent-only physics (gravity + drag). CdA and mass for warhead-like body.
const BALLISTIC_CDA = 0.015;
const BALLISTIC_MASS = 500;

function simulateBallisticImpactX(deviation, apogee, vx) {
  let x = deviation;
  let y = apogee;
  let vxCur = vx;
  let vyCur = 0;
  const dt = 0.02;
  let prevX = x;
  let prevY = y;
  for (let step = 0; step < 150000 && y > 0; step++) {
    const rho = WORLD.rho0 * Math.exp(-Math.max(y, 0) / WORLD.scaleHeight);
    const speed = Math.hypot(vxCur, vyCur) || 1e-6;
    const q = 0.5 * rho * speed * speed;
    const dragMag = q * BALLISTIC_CDA;
    const ax = -(vxCur / speed) * (dragMag / BALLISTIC_MASS);
    const ay = -WORLD.g - (vyCur / speed) * (dragMag / BALLISTIC_MASS);
    vxCur += ax * dt;
    vyCur += ay * dt;
    prevX = x;
    prevY = y;
    x += vxCur * dt;
    y += vyCur * dt;
  }
  // If we stepped past ground (y <= 0), linearly interpolate impact x at y = 0
  if (y <= 0 && y !== prevY) {
    const t = -prevY / (y - prevY);
    return prevX + (x - prevX) * t;
  }
  return x;
}

function solveBallisticVx(deviation, apogee, attackX) {
  let vxLow = -4000;
  let vxHigh = 4000;
  for (let i = 0; i < 80; i++) {
    const vx = (vxLow + vxHigh) / 2;
    const impactX = simulateBallisticImpactX(deviation, apogee, vx);
    if (Math.abs(impactX - attackX) < 1) return vx;
    if (impactX < attackX) vxLow = vx;
    else vxHigh = vx;
  }
  return (vxLow + vxHigh) / 2;
}

class BallisticTarget {
  constructor(apogee, attackX, deviation, maneuverMode = 0) {
    this.maneuverMode = maneuverMode;
    this.trail = [];
    this.snakePhase = 0;
    this.snakePeriod = 10;
    this.playerAccel = 20;
    this.snakeAmplitude = 120;
    this.isBallistic = true;
    this.attackPoint = { x: attackX, y: 0 };
    this.plasmaLevel = 0;

    const vx = solveBallisticVx(deviation, apogee, attackX);
    this.pos = { x: deviation, y: apogee };
    this.vel = { x: vx, y: 0 };
    this.baseSpeed = vx;
  }

  update(dt, keys = { left: false, right: false, up: false, down: false }) {
    const rho = WORLD.rho0 * Math.exp(-Math.max(this.pos.y, 0) / WORLD.scaleHeight);
    const speed = magnitude(this.vel) || 1e-6;
    const q = 0.5 * rho * speed * speed;
    const dragMag = q * BALLISTIC_CDA;
    let ax = -(this.vel.x / speed) * (dragMag / BALLISTIC_MASS);
    let ay = -WORLD.g - (this.vel.y / speed) * (dragMag / BALLISTIC_MASS);

    if (this.maneuverMode === 0) {
      // straight descent
    } else if (this.maneuverMode === 1) {
      this.snakePhase += dt;
      const omega = (2 * Math.PI) / this.snakePeriod;
      const speedMag = Math.max(Math.abs(this.baseSpeed), this.minSpeed);
      const speedFactor = clamp(speedMag / 250, 0.4, 2.0);
      const amp = this.snakeAmplitude * speedFactor;
      this.vel.x = this.baseSpeed + amp * omega * Math.cos(omega * this.snakePhase);
    } else {
      if (keys.left) this.vel.x -= this.playerAccel * dt;
      if (keys.right) this.vel.x += this.playerAccel * dt;
    }

    this.vel.x += ax * dt;
    this.vel.y += ay * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.y = Math.max(0, this.pos.y);
    this.trail.push({ x: this.pos.x, y: this.pos.y, t: performance.now() });
    if (this.trail.length > 50000) this.trail.shift();

    const mach = speed / WORLD.seaLevelSpeedSound;
    const minMach = 5;
    const raw = clamp((mach - minMach) / (PLASMA_MACH_MAX - minMach), 0, 1);
    const fadeRate = 3;
    const k = clamp(dt * fadeRate, 0, 1);
    this.plasmaLevel += (raw - this.plasmaLevel) * k;
  }
}

// Missile mass model: a simple two-stage solid motor with fuel as a fixed fraction of launch mass.
// Fuel mass decreases in proportion to motor impulse (thrust * time), which roughly approximates
// constant specific impulse and makes weight change depend on how hard the motor is pushing.
const FUEL_MASS_FRACTION = 0.45;

class Missile {
  constructor(config) {
    this.cfg = { ...config };
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.dryMass = config.mass * (1 - FUEL_MASS_FRACTION);
    this.initialFuelMass = config.mass * FUEL_MASS_FRACTION;
    this.fuelRemaining = this.initialFuelMass;
    this.mass = config.mass;
    // Simple two-stage motor: assume fuel burn is proportional to thrust
    // (constant specific impulse), so high-thrust boost eats more fuel.
    this.totalImpulseProxy =
      this.cfg.primaryThrust * this.cfg.primaryTime +
      this.cfg.secondaryThrust * this.cfg.secondaryTime;
    this.stageTime = 0;
    this.totalTime = 0;
    this.active = false;
    this.destroyed = false;
    this.detonated = false;
    this.trail = [];
    this.smokeTrail = []; // { x, y, t, stage: 'primary'|'secondary' }
    this.plasmaLevel = 0;
  }

  currentThrust() {
    if (this.stageTime < this.cfg.primaryTime) return this.cfg.primaryThrust;
    if (this.stageTime < this.cfg.primaryTime + this.cfg.secondaryTime) return this.cfg.secondaryThrust;
    return 0;
  }

  // Integrates missile equations of motion for one time step:
  //  - updates fuel and mass based on motor impulse,
  //  - computes drag and induced drag from current speed and commanded G,
  //  - applies thrust, drag, lift (via guidanceAcc) and gravity to update velocity and position,
  //  - enforces a simple Mach cap and grows a permanent trail.
  update(dt, guidanceAcc) {
    if (this.destroyed) return;

    this.stageTime += dt;
    this.totalTime += dt;

    let thrustMag = this.currentThrust();

    // Fuel burn: fuel mass decreases in proportion to motor impulse (thrust * time).
    // This is closer to a constant-Isp rocket, and makes weight change depend on
    // how hard the motor is pushing rather than just elapsed time.
    if (this.totalImpulseProxy > 0 && thrustMag > 0 && this.fuelRemaining > 0) {
      const dImpulse = thrustMag * dt;
      const fuelBurn = this.initialFuelMass * (dImpulse / this.totalImpulseProxy);
      this.fuelRemaining = Math.max(0, this.fuelRemaining - fuelBurn);
    }
    // When fuel is gone, thrust drops to zero and mass is just dry.
    if (this.fuelRemaining <= 0) {
      thrustMag = 0;
      this.fuelRemaining = 0;
    }
    this.mass = this.dryMass + this.fuelRemaining;

    const speed = magnitude(this.vel);

    // Altitude-dependent air density using exponential model.
    const density = WORLD.rho0 * Math.exp(-Math.max(this.pos.y, 0) / WORLD.scaleHeight);
    const cdA = 0.009; // effective drag area term (Cd * Area)
    const q = 0.5 * density * speed * speed;
    const dragMag = q * cdA;
    const velDir = normalize(this.vel.x || this.vel.y ? this.vel : { x: 1, y: 0 });

    // Maneuvering energy loss: turning generates induced drag, bleeding speed during hard pulls.
    // Simple model: induced drag ∝ dynamic pressure * (turnG^2).
    const turnG = magnitude(guidanceAcc) / WORLD.g;
    const inducedDragMag = q * INDUCED_DRAG_AREA * turnG * turnG;

    const drag = {
      x: -velDir.x * (dragMag + inducedDragMag),
      y: -velDir.y * (dragMag + inducedDragMag),
    };

    const thrustDir = velDir;
    const thrust = { x: thrustDir.x * thrustMag, y: thrustDir.y * thrustMag };

    // total force
    const force = {
      x: thrust.x + drag.x + guidanceAcc.x * this.mass,
      y: thrust.y + drag.y + guidanceAcc.y * this.mass - WORLD.g * this.mass,
    };

    this.vel.x += (force.x / this.mass) * dt;
    this.vel.y += (force.y / this.mass) * dt;

    // limit speed by max Mach
    const maxSpeed = this.cfg.maxMach * WORLD.seaLevelSpeedSound;
    const newSpeed = magnitude(this.vel);
    if (newSpeed > maxSpeed) {
      const n = normalize(this.vel);
      this.vel.x = n.x * maxSpeed;
      this.vel.y = n.y * maxSpeed;
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    this.trail.push({ x: this.pos.x, y: this.pos.y, t: performance.now() });
    if (this.trail.length > 50000) this.trail.shift();

    if (thrustMag > 0 && this.fuelRemaining > 0) {
      const stage = this.stageTime <= this.cfg.primaryTime ? "primary" : "secondary";
      this.smokeTrail.push({ x: this.pos.x, y: this.pos.y, t: performance.now(), stage });
      if (this.smokeTrail.length > 300) this.smokeTrail.shift();
    }

    // Smooth plasma intensity based on Mach
    const mach = speed / WORLD.seaLevelSpeedSound;
    const raw = clamp((mach - PLASMA_MACH_MIN) / (PLASMA_MACH_MAX - PLASMA_MACH_MIN), 0, 1);
    const fadeRate = 3; // 1/s
    const k = clamp(dt * fadeRate, 0, 1);
    this.plasmaLevel += (raw - this.plasmaLevel) * k;
  }
}

class Simulation {
  constructor() {
    this.reset();
  }

  reset() {
    const maneuverMode = Number(ui.targetManeuver?.value ?? 0);
    const isBallistic = ui.targetTypeBallistic?.checked ?? false;
    if (isBallistic) {
      const err = validateBallisticParams();
      if (err && ui.targetError) {
        ui.targetError.textContent = err;
        ui.targetError.setAttribute("aria-live", "polite");
      }
      if (err) {
        this.target = new Target(-250, 10000, 30000, 0);
        this.missile = new Missile(this.readMissileConfig());
      } else {
        if (ui.targetError) ui.targetError.textContent = "";
        const apogee = Number(ui.targetApogee.value);
        const attackX = Number(ui.targetAttackX.value);
        const deviation = Number(ui.targetDeviation.value);
        this.target = new BallisticTarget(apogee, attackX, deviation, maneuverMode);
        this.missile = new Missile(this.readMissileConfig());
      }
    } else {
      if (ui.targetError) ui.targetError.textContent = "";
      this.target = new Target(
        Number(ui.targetSpeed.value),
        Number(ui.targetAlt.value),
        Number(ui.targetRange.value),
        maneuverMode
      );
      this.missile = new Missile(this.readMissileConfig());
    }
    this.running = false;
    this.resultKey = "idle";
    this.lastTime = performance.now();
    this.hudStrings = [];
    this.lastHudUpdate = 0;
    this.lastStatsUpdate = 0;
    this.climbPhase = true;
    this.lastKnownTargetPos = null;
    this.lastKnownTargetVel = null;
    this.lastKnownTargetTime = 0;
    this.signalLostUntil = 0;
    this.updateGuidanceControls();
  }

  updateGuidanceControls() {
    const disabled = this.running;
    if (ui.guidanceMode) {
      ui.guidanceMode.disabled = disabled;
      ui.guidanceMode.style.opacity = disabled ? 0.6 : 1;
    }
    // Refresh mobile controls / swipe state when run state changes
    updateManeuverUI();
  }

  readMissileConfig() {
    return {
      gLimit: Number(ui.missileG.value),
      mass: Number(ui.missileMass.value),
      primaryThrust: Number(ui.primaryThrust.value),
      primaryTime: Number(ui.primaryTime.value),
      secondaryThrust: Number(ui.secondaryThrust.value),
      secondaryTime: Number(ui.secondaryTime.value),
      maxMach: Number(ui.maxMach.value),
      fuze: Number(ui.fuzeRange.value),
      navN: Number(ui.navConstant.value),
      loftBiasDeg: Number(ui.loftBias.value),
    };
  }

  launch() {
    this.reset();
    const isBallistic = ui.targetTypeBallistic?.checked ?? false;
    if (isBallistic) {
      const err = validateBallisticParams();
      if (err) {
        if (ui.targetError) ui.targetError.textContent = err;
        return;
      }
    }
    // SAM-style cold launch: go straight up first.
    this.missile.vel = { x: 0, y: 120 }; // initial upward kick

    this.missile.active = true;
    this.running = true;
    this.resultKey = "in_flight";
    this.updateGuidanceControls();
  }

  step(dt) {
    if (!this.running) return;

    let keys = {};
    if (this.target.maneuverMode === 2) keys = keyState;
    this.target.update(dt, keys);

    const missileMach = magnitude(this.missile.vel) / WORLD.seaLevelSpeedSound;
    const t = this.missile.totalTime;
    if (missileMach < 7) {
      this.lastKnownTargetPos = { x: this.target.pos.x, y: this.target.pos.y };
      this.lastKnownTargetVel = { x: this.target.vel.x, y: this.target.vel.y };
      this.lastKnownTargetTime = t;
      this.signalLostUntil = 0;
    } else if (missileMach >= 8) {
      // Full blackout above Mach 8: no updates, guidance uses prediction only
    } else {
      // 7–8 Mach: disrupted link – randomly lose signal for brief moments
      if (t >= this.signalLostUntil) {
        this.lastKnownTargetPos = { x: this.target.pos.x, y: this.target.pos.y };
        this.lastKnownTargetVel = { x: this.target.vel.x, y: this.target.vel.y };
        this.lastKnownTargetTime = t;
        if (Math.random() < 0.018) {
          this.signalLostUntil = t + 0.08 + Math.random() * 0.18;
        }
      }
    }

    const guidanceAcc = this.guidance();
    this.missile.update(dt, guidanceAcc);

    const range = {
      x: this.target.pos.x - this.missile.pos.x,
      y: this.target.pos.y - this.missile.pos.y,
    };
    const distance = magnitude(range);

    if (distance < this.missile.cfg.fuze) {
      this.running = false;
      this.missile.detonated = true;
      this.resultKey = "intercept_fuze";
    } else if (distance < 5) {
      this.running = false;
      this.missile.detonated = true;
      this.resultKey = "direct_hit";
    }

    if (this.target.isBallistic && this.target.pos.y <= 0) {
      this.running = false;
      this.resultKey = "target_impacted";
    }

    // Expanded flight envelope: allow high lofts and long shots before declaring miss.
    const xLimit = Math.max(this.target.pos.x, WORLD.width) * 5;
    const yLimit = Math.max(this.target.pos.y + 15000, WORLD.height * 2.5);
    if (this.missile.pos.y < -500 || this.missile.pos.y > yLimit || this.missile.pos.x > xLimit) {
      this.running = false;
      this.resultKey = "missed";
    }

    if (!this.running) {
      this.updateGuidanceControls();
    }
  }

  // Computes lateral acceleration command using proportional navigation with two extensions:
  //  - "smart" N scheduling: lower N at long range to save energy, ramping up near intercept,
  //  - energy-aware lofting: only bias the trajectory upward when the target is high and the
  //    missile has sufficient speed and time, fading back to pure PN close to impact.
  //  - Communication blackout: above Mach 8 always use prediction; 7–8 Mach intermittent disruption.
  guidance() {
    const m = this.missile;
    const missileMach = magnitude(m.vel) / WORLD.seaLevelSpeedSound;
    let tPos = this.target.pos;
    let tVel = this.target.vel;
    const usePrediction =
      missileMach >= 8 ||
      (missileMach >= 7 && (m.totalTime < this.signalLostUntil || !this.lastKnownTargetPos || this.lastKnownTargetVel == null));
    if (usePrediction && this.lastKnownTargetPos && this.lastKnownTargetVel != null) {
      const dtPred = m.totalTime - this.lastKnownTargetTime;
      tPos = {
        x: this.lastKnownTargetPos.x + this.lastKnownTargetVel.x * dtPred,
        y: this.lastKnownTargetPos.y + this.lastKnownTargetVel.y * dtPred,
      };
      tVel = { ...this.lastKnownTargetVel };
    }
    const rel = { x: tPos.x - m.pos.x, y: tPos.y - m.pos.y };
    const relVel = { x: tVel.x - m.vel.x, y: tVel.y - m.vel.y };

    const r = magnitude(rel);
    const closing = -(rel.x * relVel.x + rel.y * relVel.y) / Math.max(r, 1e-6);
    const losRate = (rel.x * relVel.y - rel.y * relVel.x) / Math.max(r * r, 1e-6); // rad/s
    const losDir = normalize(rel);
    const velDir = normalize(m.vel.x || m.vel.y ? m.vel : losDir);

    // Climb phase: fly straight up until 150 m AGL (no lateral command).
    if (this.climbPhase) {
      if (m.pos.y >= 150) {
        this.climbPhase = false;
      } else {
        return { x: 0, y: 0 };
      }
    }

    // Proportional navigation: command turn to null line-of-sight rate.
    // Use |closing| so that when target is receding (closing < 0) we still turn toward the target.
    const closingMag = Math.abs(closing);

    // Guidance mode: constant N (classic PN) or smart N scheduling to save energy at long range.
    const mode = ui.guidanceMode?.value ?? "constant";
    const navNMax = m.cfg.navN;
    let navNUsed = navNMax;
    if (mode === "smart") {
      // Use time-to-go (ETA) derived from range/closure, but only start ramping N
      // when we are very close: ETA <= 2 s. Before that, keep N low to save energy.
      const tgo = closingMag > 1 ? r / closingMag : 999;
      const navNMin = 0.2; // gentle long-range value

      if (tgo <= 5) {
        const tRaw = clamp((5 - tgo) / 5, 0, 1);
        const tSmooth = tRaw * tRaw * (3 - 2 * tRaw);
        navNUsed = navNMin + (navNMax - navNMin) * tSmooth;
      } else {
        navNUsed = navNMin;
      }
    }

    let aCmd = navNUsed * closingMag * losRate;

    // Energy-aware lofting: only bias the path upward when
    //  - the target is meaningfully above the missile,
    //  - the missile has plenty of speed,
    //  - and we are in the mid-course (ETA not too small or huge).
    // Close to intercept we fade loft to zero so guidance becomes pure PN.
    const loftDeg = m.cfg.loftBiasDeg;
    if (loftDeg !== 0 && closingMag > 1 && Math.abs(losRate) > 1e-6) {
      const altDiff = tPos.y - m.pos.y;
      if (altDiff > 1000) {
        const speed = magnitude(m.vel);
        const mach = speed / WORLD.seaLevelSpeedSound;
        const eta = r / closingMag; // s

        // Require some energy and mid-course geometry.
        const energyFactor = clamp((mach - 1.0) / 2.0, 0, 1); // 0 below Mach 1, ~1 by Mach 3
        const altFactor = clamp(altDiff / 8000, 0, 1);       // more loft when target much higher

        // Mid-course window: start lofting for ETA in [4, 16] s; zero outside.
        let etaFactor = 0;
        if (eta > 4 && eta < 16) {
          const x = (eta - 4) / (16 - 4);   // 0 at 4s, 1 at 16s
          // Bell-shaped curve peaking in the middle (~10 s).
          etaFactor = 4 * x * (1 - x);      // in [0,1]
        }

        const loftStrength =
          ((loftDeg * Math.PI) / 180) *
          energyFactor *
          altFactor *
          etaFactor *
          (closingMag / Math.max(r, 1e-6));

        if (loftStrength > 0) {
          aCmd += Math.sign(losRate) * loftStrength;
        }
      }
    }

    const perp = { x: -velDir.y, y: velDir.x };

    // Aerodynamic-limited lateral acceleration: depends on dynamic pressure.
    const speed = magnitude(m.vel);
    const rho = WORLD.rho0 * Math.exp(-Math.max(m.pos.y, 0) / WORLD.scaleHeight);
    const q = 0.5 * rho * speed * speed;
    const availableAcc = q * LIFT_EFFECTIVE_AREA / Math.max(m.mass, 1); // m/s^2

    const gLimit = m.cfg.gLimit * WORLD.g;
    const maxLatAcc = Math.min(gLimit, availableAcc);

    const limitedAcc = clamp(aCmd * speed, -maxLatAcc, maxLatAcc);
    const acc = { x: perp.x * limitedAcc, y: perp.y * limitedAcc };

    this.updateHud(r, closing, limitedAcc / WORLD.g, navNUsed);
    return acc;
  }

  updateHud(range, closing, accelGs, navNUsed = this.missile.cfg.navN) {
    const now = performance.now();
    if (now - this.lastHudUpdate < 100) return; // throttle HUD to 10 Hz to reduce flicker
    this.lastHudUpdate = now;
    const speed = magnitude(this.missile.vel);
    const mach = speed / WORLD.seaLevelSpeedSound;
    const targetSpeed = magnitude(this.target.vel);
    const targetMach = targetSpeed / WORLD.seaLevelSpeedSound;
    const eta = closing > 1 ? range / closing : Infinity;
    const mode = ui.guidanceMode?.value ?? "constant";
    const guidanceLabel = mode === "smart" ? t("guidance_smart") : t("guidance_constant");
    this.hudStrings = [
      `${t("hud_range")}: ${range.toFixed(0)} m`,
      `${t("hud_closure")}: ${closing.toFixed(1)} m/s`,
      `${t("hud_missile_speed")}: ${speed.toFixed(1)} m/s (Mach ${mach.toFixed(2)})`,
      `${t("stats_target_speed")}: ${targetSpeed.toFixed(1)} m/s (Mach ${targetMach.toFixed(2)})`,
      `${t("hud_cmd_accel")}: ${accelGs.toFixed(1)} g`,
      `${t("hud_guidance")}: ${guidanceLabel} (N=${navNUsed.toFixed(2)})`,
      `${t("hud_eta")}: ${isFinite(eta) ? eta.toFixed(1) + " s" : "—"}`,
    ];

    // Also update stats panel (throttled separately for stability)
    if (now - this.lastStatsUpdate > 100) {
      this.lastStatsUpdate = now;
      const statsLines = [
        `${t("stats_mach")}: ${mach.toFixed(2)}`,
        `${t("stats_missile_pos")}: ${this.missile.pos.x.toFixed(0)} m, ${this.missile.pos.y.toFixed(0)} m`,
        `${t("stats_stage_time")}: ${this.missile.stageTime.toFixed(2)} s`,
        `${t("stats_target_pos")}: ${this.target.pos.x.toFixed(0)} m, ${this.target.pos.y.toFixed(0)} m`,
        `${t("stats_missile_vel")}: ${this.missile.vel.x.toFixed(1)}, ${this.missile.vel.y.toFixed(1)} m/s`,
        `${t("stats_missile_mass")}: ${this.missile.mass.toFixed(1)} kg`,
        `${t("stats_cmd_accel")}: ${accelGs.toFixed(1)} g`,
        `${t("stats_target_vel")}: ${this.target.vel.x.toFixed(1)}, ${this.target.vel.y.toFixed(1)} m/s`,
      ];
      statsEl.innerHTML = statsLines
        .map((line) => `<div>${line}</div>`)
        .join("");
    }
  }

  refreshHudLanguage() {
    this.lastHudUpdate = 0;
    this.lastStatsUpdate = 0;
    if (ui.targetError) ui.targetError.textContent = "";
  }
}

const sim = new Simulation();

// Camera state: "follow" chases the missile like GPS; "free" lets the player pan/zoom.
const viewState = {
  mode: "follow", // "follow" | "free"
  center: { x: 0, y: 0 },
  scale: 0.08,
  minScale: 0.0002,
  maxScale: 2,
};

function computeView() {
  const missile = sim.missile.pos;
  const target = sim.target.pos;

  if (viewState.mode === "free") {
    const width = canvas.width / viewState.scale;
    const height = canvas.height / viewState.scale;
    return {
      scale: viewState.scale,
      origin: {
        x: viewState.center.x - width / 2,
        y: viewState.center.y - height / 2,
      },
      width,
      height,
    };
  }

  // Follow mode: center between missile and target (biased toward missile), frame both.
  const dx = Math.abs(target.x - missile.x);
  const dy = Math.abs(target.y - missile.y);
  const padding = 500; // meters
  const baseWidth = Math.max(2000, dx * 2 + padding * 2);
  const baseHeight = Math.max(1500, dy * 2 + padding * 2);

  // Expand the smaller dimension so that the world view matches the canvas aspect ratio.
  // This ensures the grid fills the entire canvas, like a math graph, instead of only
  // covering part of the screen when one dimension is not limiting.
  const canvasAspect = canvas.width / canvas.height;
  let viewWidth = baseWidth;
  let viewHeight = baseHeight;
  const worldAspect = baseWidth / baseHeight || canvasAspect;
  if (worldAspect > canvasAspect) {
    // World is wider than canvas: width dominates, expand height.
    viewHeight = viewWidth / canvasAspect;
  } else {
    // World is taller than canvas: height dominates, expand width.
    viewWidth = viewHeight * canvasAspect;
  }

  const scale = canvas.width / viewWidth;

  const centerX = missile.x * 0.7 + target.x * 0.3;
  const centerY = missile.y * 0.7 + target.y * 0.3;

  const view = {
    scale,
    origin: { x: centerX - viewWidth / 2, y: centerY - viewHeight / 2 },
    width: viewWidth,
    height: viewHeight,
  };
  // While following, track current view so that switching to free camera keeps the same framing.
  if (viewState.mode === "follow") {
    viewState.center = { x: centerX, y: centerY };
    viewState.scale = scale;
  }

  return view;
}

function worldToCanvas(p, view) {
  return {
    x: (p.x - view.origin.x) * view.scale,
    y: canvas.height - (p.y - view.origin.y) * view.scale,
  };
}

const PLASMA_MACH_MIN = 5;
const PLASMA_MACH_MAX = 20;

function drawPlasmaEffect(worldPos, vel, view, level) {
  const speed = magnitude(vel);
  const factor = clamp(level, 0, 1);
  if (factor <= 0.01) return;
  const alpha = 0.25 + 0.6 * factor;
  const baseLen = 50 * VIS_SCALE;
  const len = baseLen + 100 * factor * VIS_SCALE;   // comet length
  const baseRadius = 14 * VIS_SCALE;
  const radius = baseRadius + 24 * factor * VIS_SCALE; // make it wider than missile
  const c = worldToCanvas(worldPos, view);
  const dir = speed > 1e-6 ? normalize(vel) : { x: 1, y: 0 };
  const angle = Math.atan2(dir.y, dir.x);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(-angle);

  // Main comet body: streamlined teardrop slightly ahead of the missile nose.
  const noseX = 28 * VIS_SCALE; // shift plasma forward
  const tailX = noseX - len;
  const bodyGrad = ctx.createLinearGradient(tailX, 0, noseX, 0);
  bodyGrad.addColorStop(0, "rgba(80,50,180,0)");
  bodyGrad.addColorStop(0.3, `rgba(120,80,220,${alpha * 0.35})`);
  bodyGrad.addColorStop(0.6, `rgba(200,120,200,${alpha * 0.55})`);
  bodyGrad.addColorStop(0.9, `rgba(255,140,60,${alpha * 0.9})`);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Nose at (noseX,0), tail stretching backward.
  ctx.moveTo(noseX, 0);
  ctx.quadraticCurveTo(tailX + (len * 0.35), radius * 0.9, tailX, 0);
  ctx.quadraticCurveTo(tailX + (len * 0.35), -radius * 0.9, noseX, 0);
  ctx.fill();

  // Bright glow at the front tip, matching the cone.
  const glowLen = len * 0.8;
  const glowTailX = noseX - glowLen;
  const glowGrad = ctx.createLinearGradient(glowTailX, 0, noseX, 0);
  glowGrad.addColorStop(0, "rgba(255,180,120,0)");
  glowGrad.addColorStop(0.4, `rgba(255,200,150,${alpha * 0.6})`);
  glowGrad.addColorStop(1, `rgba(255,240,220,${alpha})`);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.moveTo(noseX, 0);
  ctx.quadraticCurveTo(glowTailX + glowLen * 0.4, radius * 0.7, glowTailX, 0);
  ctx.quadraticCurveTo(glowTailX + glowLen * 0.4, -radius * 0.7, noseX, 0);
  ctx.fill();

  ctx.restore();
}

function drawTrail(trail, color, view) {
  if (trail.length < 2) return;
  ctx.beginPath();
  for (let i = 0; i < trail.length; i++) {
    const p = worldToCanvas(trail[i], view);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * VIS_SCALE;
  ctx.stroke();
}

function drawSmokeTrail(m, view) {
  if (!m.smokeTrail || m.smokeTrail.length < 2) return;
  const now = performance.now();
  const maxAge = 7000;
  for (let i = 0; i < m.smokeTrail.length; i++) {
    const pt = m.smokeTrail[i];
    const age = now - pt.t;
    if (age > maxAge) continue;
    const alpha = 1 - age / maxAge;
    const c = worldToCanvas({ x: pt.x, y: pt.y }, view);
    const r = (pt.stage === "primary" ? 6 : 4) * VIS_SCALE * (0.5 + 0.5 * alpha);
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    if (pt.stage === "primary") {
      ctx.fillStyle = `rgba(255,255,255,${0.35 * alpha})`;
    } else {
      ctx.fillStyle = `rgba(40,40,45,${0.1 * alpha})`;
    }
    ctx.fill();
  }
}

function drawMissile(m, view) {
  const p = worldToCanvas(m.pos, view);
  const hasVel = m.vel.x !== 0 || m.vel.y !== 0;
  const dir = normalize(hasVel ? m.vel : { x: 0, y: 1 });
  const angle = Math.atan2(dir.y, dir.x);

  if (m.smokeTrail && m.smokeTrail.length > 0) drawSmokeTrail(m, view);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-angle);
  ctx.fillStyle = "#9dd1ff";
  ctx.strokeStyle = "#c6e3ff";
  ctx.lineWidth = 3 * VIS_SCALE;
  ctx.beginPath();
  ctx.moveTo(20 * VIS_SCALE, 0);
  ctx.lineTo(-16 * VIS_SCALE, 8 * VIS_SCALE);
  ctx.lineTo(-20 * VIS_SCALE, 0);
  ctx.lineTo(-16 * VIS_SCALE, -8 * VIS_SCALE);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const thrustMag = m.currentThrust();
  const hasFuel = m.fuelRemaining > 0;
  if (hasFuel && thrustMag > 0) {
    const isPrimary = m.stageTime < m.cfg.primaryTime;
    const baseX = -16 * VIS_SCALE;
    const len = (isPrimary ? 28 : 18) * VIS_SCALE;
    const w = (isPrimary ? 14 : 10) * VIS_SCALE;
    const gradient = ctx.createRadialGradient(baseX - len * 0.3, 0, 0, baseX, 0, len);
    if (isPrimary) {
      gradient.addColorStop(0, "rgba(255,255,255,0.95)");
      gradient.addColorStop(0.35, "rgba(255,250,200,0.7)");
      gradient.addColorStop(0.7, "rgba(255,200,100,0.3)");
      gradient.addColorStop(1, "rgba(255,180,80,0)");
    } else {
      gradient.addColorStop(0, "rgba(255,160,60,0.85)");
      gradient.addColorStop(0.5, "rgba(220,120,40,0.4)");
      gradient.addColorStop(1, "rgba(200,100,30,0)");
    }
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(baseX - len * 0.5, 0, len, w, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  if (m.plasmaLevel > 0.01) {
    drawPlasmaEffect(m.pos, m.vel, view, m.plasmaLevel);
  }
}

function drawTarget(t, view) {
  const p = worldToCanvas(t.pos, view);
  const dir = normalize(t.vel.x || t.vel.y ? t.vel : { x: 1, y: 0 });
  const angle = Math.atan2(dir.y, dir.x);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-angle);
  ctx.fillStyle = "#7bd88f";
  ctx.strokeStyle = "#c8f9d1";
  ctx.lineWidth = 3 * VIS_SCALE;
  ctx.beginPath();
  ctx.moveTo(18 * VIS_SCALE, 0);
  ctx.lineTo(-14 * VIS_SCALE, 7 * VIS_SCALE);
  ctx.lineTo(-14 * VIS_SCALE, -7 * VIS_SCALE);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawExplosion(p, view) {
  const c = worldToCanvas(p, view);
  const radius = 20;
  const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, radius);
  gradient.addColorStop(0, "rgba(255,220,120,0.9)");
  gradient.addColorStop(1, "rgba(255,120,80,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawScaleBar(view) {
  const paddingX = 40;
  const paddingY = 50 * VIS_SCALE;
  const targetBarPx = 200 * VIS_SCALE;
  const niceMeters = [
    10, 25, 50, 100, 250, 500,
    1000, 2500, 5000, 10000,
    25000, 50000, 100000,
    250000, 500000, 1000000,
    2500000, 5000000, 10000000,
  ];
  let best = niceMeters[0];
  let bestDiff = Infinity;
  for (const m of niceMeters) {
    const barPx = m * view.scale;
    const diff = Math.abs(barPx - targetBarPx);
    if (barPx >= 60 && barPx <= 400 && diff < bestDiff) {
      bestDiff = diff;
      best = m;
    }
  }
  const barPx = best * view.scale;
  const x = canvas.width - paddingX - barPx;
  const y = canvas.height - paddingY;
  const tickH = 12 * VIS_SCALE;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 4 * VIS_SCALE;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + barPx, y);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + tickH);
  ctx.moveTo(x + barPx, y);
  ctx.lineTo(x + barPx, y + tickH);
  ctx.stroke();

  const label = best >= 1000 ? (best / 1000) + " km" : best + " m";
  ctx.font = `${28 * VIS_SCALE}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, x + barPx / 2, y + tickH + 4);
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const view = computeView();

  // Grid (dynamic spacing based on zoom)
  const targetPx = 90;
  const candidates = [
    50, 100, 200, 500,
    1000, 2000, 5000,
    10000, 20000, 50000,
    100000, 200000, 500000,
    1000000, 2000000, 5000000,
  ];
  let spacing = candidates[0];
  let bestDiff = Infinity;
  for (const s of candidates) {
    const px = s * view.scale;
    const diff = Math.abs(px - targetPx);
    if (diff < bestDiff) {
      bestDiff = diff;
      spacing = s;
    }
  }
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const startX = Math.floor(view.origin.x / spacing) * spacing;
  const endX = view.origin.x + view.width;
  for (let x = startX; x <= endX; x += spacing) {
    const p1 = worldToCanvas({ x, y: view.origin.y }, view);
    const p2 = worldToCanvas({ x, y: view.origin.y + view.height }, view);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }
  const startY = Math.floor(view.origin.y / spacing) * spacing;
  const endY = view.origin.y + view.height;
  for (let y = startY; y <= endY; y += spacing) {
    const p1 = worldToCanvas({ x: view.origin.x, y }, view);
    const p2 = worldToCanvas({ x: view.origin.x + view.width, y }, view);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.stroke();

  // Ground line (more visible, green)
  ctx.strokeStyle = "rgba(123,216,143,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  const groundLeft = worldToCanvas({ x: view.origin.x, y: 0 }, view);
  const groundRight = worldToCanvas({ x: view.origin.x + canvas.width / view.scale, y: 0 }, view);
  ctx.moveTo(groundLeft.x, groundLeft.y);
  ctx.lineTo(groundRight.x, groundRight.y);
  ctx.stroke();

  if (sim.target.isBallistic && sim.target.attackPoint) {
    const c = worldToCanvas(sim.target.attackPoint, view);
    ctx.save();
    ctx.fillStyle = "#e53935";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 8 * VIS_SCALE, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
  drawTrail(sim.target.trail, "rgba(123,216,143,0.55)", view);
  drawTrail(sim.missile.trail, "rgba(90,200,250,0.65)", view);
  drawTarget(sim.target, view);
  if (sim.target.plasmaLevel > 0.01) {
    drawPlasmaEffect(sim.target.pos, sim.target.vel, view, sim.target.plasmaLevel);
  }
  drawMissile(sim.missile, view);

  if (sim.missile.detonated) {
    drawExplosion(sim.missile.pos, view);
  }

  drawScaleBar(view);

  hud.innerHTML = sim.hudStrings.join("<br>");
  if (viewState.mode === "free") {
    hud.innerHTML += "<br><span style=\"color:var(--muted);font-size:12px\">" + t("hud_pan_zoom") + "</span>";
    canvas.style.cursor = panning ? "grabbing" : "grab";
  } else {
    canvas.style.cursor = "default";
  }
}

// Simulation at 120 FPS so integration is fine enough to match previous top speed (~3+ Mach); rendering stays at display refresh rate.
const SIM_FPS = 120;
const SIM_DT = 1 / SIM_FPS;
const MAX_SIM_STEPS_PER_FRAME = 30;
let simAccumulator = 0;

function getSimSpeedFactor() {
  const checked = document.querySelector('input[name="simSpeedOpt"]:checked');
  const val = checked ? Number(checked.value) : 1;
  return Number.isFinite(val) && val > 0 ? val : 1;
}

function loop() {
  const now = performance.now();
  const dt = clamp((now - sim.lastTime) / 1000, 0, 0.1);
  sim.lastTime = now;

  const speedFactor = getSimSpeedFactor();
  simAccumulator += dt * speedFactor;
  const maxAccum = SIM_DT * 3;
  if (simAccumulator > maxAccum) simAccumulator = maxAccum;
  let steps = 0;
  while (simAccumulator >= SIM_DT && steps < MAX_SIM_STEPS_PER_FRAME) {
    sim.step(SIM_DT);
    simAccumulator -= SIM_DT;
    steps++;
  }

  render();
  requestAnimationFrame(loop);
}

// UI bindings
ui.launchBtn.addEventListener("click", () => {
  simAccumulator = 0;
  sim.launch();
  viewState.mode = "follow";
});
ui.resetBtn.addEventListener("click", () => {
  simAccumulator = 0;
  sim.reset();
  viewState.mode = "follow";
});
ui.centerCamBtn?.addEventListener("click", () => {
  viewState.mode = "follow";
});

// Collapsible panels
document.querySelectorAll(".panel-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-panel-target");
    const section = document.getElementById(targetId);
    if (!section) return;
    section.classList.toggle("collapsed");
    btn.textContent = btn.textContent.includes("▾")
      ? btn.textContent.replace("▾", "▸")
      : btn.textContent.replace("▸", "▾");
  });
});

// Pan and zoom: always available. Like a GPS, any manual camera movement switches to free mode.
let panning = false;
let lastPanX = 0;
let lastPanY = 0;
let touchMode = null; // "pan" | "pinch" | null
let pinchStartDist = 0;
let pinchStartScale = 1;

function enterFreeCamera() {
  if (viewState.mode === "free") return;
  viewState.mode = "free";
}

canvas.addEventListener("mousedown", (e) => {
  enterFreeCamera();
  panning = true;
  lastPanX = e.offsetX;
  lastPanY = e.offsetY;
});
canvas.addEventListener("mousemove", (e) => {
  if (!panning) return;
  const dx = e.offsetX - lastPanX;
  const dy = e.offsetY - lastPanY;
  lastPanX = e.offsetX;
  lastPanY = e.offsetY;
  viewState.center.x -= dx / viewState.scale;
  viewState.center.y += dy / viewState.scale;
});
canvas.addEventListener("mouseup", () => { panning = false; });
canvas.addEventListener("mouseleave", () => { panning = false; });

canvas.addEventListener("wheel", (e) => {
  enterFreeCamera();
  e.preventDefault();
  const factor = 1 - e.deltaY * 0.002;
  viewState.scale = clamp(viewState.scale * factor, viewState.minScale, viewState.maxScale);
}, { passive: false });

// Touch support for pan and pinch-zoom on mobile.
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    enterFreeCamera();
    touchMode = "pan";
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastPanX = t.clientX - rect.left;
    lastPanY = t.clientY - rect.top;
  } else if (e.touches.length === 2) {
    enterFreeCamera();
    touchMode = "pinch";
    const [t1, t2] = e.touches;
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    pinchStartDist = Math.hypot(dx, dy) || 1;
    pinchStartScale = viewState.scale;
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  if (!touchMode) return;
  const rect = canvas.getBoundingClientRect();
  if (touchMode === "pan" && e.touches.length === 1) {
    const t = e.touches[0];
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    const dx = x - lastPanX;
    const dy = y - lastPanY;
    lastPanX = x;
    lastPanY = y;
    const panBoost = IS_MOBILE ? 1.8 : 1;
    viewState.center.x -= (dx / viewState.scale) * panBoost;
    viewState.center.y += (dy / viewState.scale) * panBoost;
  } else if (touchMode === "pinch" && e.touches.length === 2) {
    const [t1, t2] = e.touches;
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    const dist = Math.hypot(dx, dy) || 1;
    const factor = dist / pinchStartDist;
    viewState.scale = clamp(pinchStartScale * factor, viewState.minScale, viewState.maxScale);
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  if (e.touches && e.touches.length > 0) return;
  touchMode = null;
  panning = false;
}, { passive: false });

function updateManeuverUI() {
  const idx = Number(ui.targetManeuver?.value ?? 0);
  if (ui.targetManeuverLabel) ui.targetManeuverLabel.textContent = t(MANEUVER_KEYS[idx]);
  if (ui.targetManeuverHint) ui.targetManeuverHint.textContent = t(HINT_KEYS[idx]);

  // Mobile-only on-screen controls visibility
  if (IS_MOBILE && ui.mobileControls) {
    const isPlayer = idx === 2;
    ui.mobileControls.classList.toggle("hidden", !isPlayer);

    // Only block swipe when player-controlled target is active AND sim is running
    const blockSwipe = IS_MOBILE && isPlayer && sim && sim.running;
    document.body.classList.toggle("mobile-player-active", !!blockSwipe);
  }
}

ui.targetManeuver?.addEventListener("input", updateManeuverUI);
updateManeuverUI();

function onTargetTypeChange() {
  updateTargetTypeUI();
}
ui.targetTypePlane?.addEventListener("change", onTargetTypeChange);
ui.targetTypeBallistic?.addEventListener("change", onTargetTypeChange);

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    if (lang && LANG[lang]) {
      currentLang = lang;
      applyTranslations();
    }
  });
});
applyTranslations();

// Mobile on-screen arrows map to the same keyState as keyboard arrows.
if (IS_MOBILE && ui.mobileLeft && ui.mobileRight) {
  ui.mobileLeft.addEventListener("touchstart", (e) => {
    keyState.left = true;
    e.preventDefault();
  }, { passive: false });
  ui.mobileLeft.addEventListener("touchend", () => {
    keyState.left = false;
  });
  ui.mobileRight.addEventListener("touchstart", (e) => {
    keyState.right = true;
    e.preventDefault();
  }, { passive: false });
  ui.mobileRight.addEventListener("touchend", () => {
    keyState.right = false;
  });
  if (ui.mobileUp) {
    ui.mobileUp.addEventListener("touchstart", (e) => {
      keyState.up = true;
      e.preventDefault();
    }, { passive: false });
    ui.mobileUp.addEventListener("touchend", () => {
      keyState.up = false;
    });
  }
  if (ui.mobileDown) {
    ui.mobileDown.addEventListener("touchstart", (e) => {
      keyState.down = true;
      e.preventDefault();
    }, { passive: false });
    ui.mobileDown.addEventListener("touchend", () => {
      keyState.down = false;
    });
  }
}

// Arrow keys for player-controlled target (prevent scroll)
function onKeyDown(e) {
  if (e.key === "ArrowLeft") { keyState.left = true; e.preventDefault(); }
  if (e.key === "ArrowRight") { keyState.right = true; e.preventDefault(); }
  if (e.key === "ArrowUp") { keyState.up = true; e.preventDefault(); }
  if (e.key === "ArrowDown") { keyState.down = true; e.preventDefault(); }
}
function onKeyUp(e) {
  if (e.key === "ArrowLeft") keyState.left = false;
  if (e.key === "ArrowRight") keyState.right = false;
  if (e.key === "ArrowUp") keyState.up = false;
  if (e.key === "ArrowDown") keyState.down = false;
}
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

// Start idle render
sim.updateHud(0, 0, 0);
loop();

